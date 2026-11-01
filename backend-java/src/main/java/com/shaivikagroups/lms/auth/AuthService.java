package com.shaivikagroups.lms.auth;

import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ConflictException;
import com.shaivikagroups.lms.common.ForbiddenException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.common.UnauthorizedException;
import com.shaivikagroups.lms.notification.EmailService;
import com.shaivikagroups.lms.security.JwtTokenProvider;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.tenant.TenantEntity;
import com.shaivikagroups.lms.tenant.TenantResponse;
import com.shaivikagroups.lms.tenant.TenantService;
import com.shaivikagroups.lms.user.Role;
import com.shaivikagroups.lms.user.UserEntity;
import com.shaivikagroups.lms.user.UserRepository;
import com.shaivikagroups.lms.user.UserResponse;
import com.shaivikagroups.lms.user.UserStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final TenantService tenantService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       VerificationTokenRepository verificationTokenRepository,
                       TenantService tenantService,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.tenantService = tenantService;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String contextTenantId, String clientIp, String userAgent) {
        TenantEntity tenant;
        if (request.getOrganizationSlug() != null && !request.getOrganizationSlug().trim().isEmpty()) {
            tenant = tenantService.resolveTenant(request.getOrganizationSlug());
        } else {
            tenant = tenantService.resolveTenant(contextTenantId);
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByTenantIdAndEmail(tenant.getId(), email)) {
            throw new ConflictException("Email '" + email + "' is already registered in this organization");
        }

        UserEntity user = new UserEntity();
        user.setId("usr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20));
        user.setTenantId(tenant.getId());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setDisplayName(request.getFullName().trim());
        user.setRole(Role.STUDENT);
        user.setStatus(UserStatus.ACTIVE);
        user.setPhone(request.getPhone());
        user.setEmailVerified(false);
        user.setXpPoints(0);
        user.setStreakCount(0);
        user.setLastActiveAt(Instant.now());

        UserEntity savedUser = userRepository.save(user);

        // Send welcome email asynchronously
        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName(), tenant.getName());
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", savedUser.getEmail(), e.getMessage());
        }

        return issueAuthResponse(savedUser, tenant, clientIp, userAgent);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String contextTenantId, String clientIp, String userAgent) {
        String email = request.getEmail().trim().toLowerCase();
        TenantEntity requestedTenant = (request.getOrganizationSlug() != null && !request.getOrganizationSlug().trim().isEmpty())
                ? tenantService.resolveTenant(request.getOrganizationSlug())
                : tenantService.resolveTenant(contextTenantId);

        UserEntity user = userRepository.findByTenantIdAndEmail(requestedTenant.getId(), email)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ForbiddenException("Account is suspended. Please contact administrator.");
        }
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new ForbiddenException("Account is inactive.");
        }

        user.setLastActiveAt(Instant.now());
        userRepository.save(user);

        TenantEntity actualTenant = tenantService.getTenantById(user.getTenantId());
        return issueAuthResponse(user, actualTenant, clientIp, userAgent);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request, String clientIp, String userAgent) {
        String rawToken = request.getRefreshToken().trim();
        String tokenHash = tokenProvider.hashToken(rawToken);

        RefreshTokenEntity tokenEntity = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (tokenEntity.isRevoked()) {
            // Security defense: Token reuse detected! Invalidate all tokens for this user.
            log.warn("Security alert: Revoked refresh token reuse detected for userId: {}", tokenEntity.getUserId());
            List<RefreshTokenEntity> userTokens = refreshTokenRepository.findAllByUserId(tokenEntity.getUserId());
            for (RefreshTokenEntity t : userTokens) {
                t.setRevoked(true);
                t.setRevokedAt(Instant.now());
            }
            refreshTokenRepository.saveAll(userTokens);
            throw new UnauthorizedException("Session invalid: refresh token reuse detected. Please log in again.");
        }

        if (tokenEntity.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");
        }

        UserEntity user = userRepository.findById(tokenEntity.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User associated with token no longer exists"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Account is no longer active");
        }

        TenantEntity tenant = tenantService.getTenantById(user.getTenantId());

        // Rotate token
        String newRawRefreshToken = tokenProvider.generateRandomToken();
        String newHashedRefreshToken = tokenProvider.hashToken(newRawRefreshToken);

        tokenEntity.setRevoked(true);
        tokenEntity.setRevokedAt(Instant.now());
        tokenEntity.setReplacedByTokenHash(newHashedRefreshToken);
        refreshTokenRepository.save(tokenEntity);

        RefreshTokenEntity newToken = new RefreshTokenEntity();
        newToken.setId("ref_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20));
        newToken.setUserId(user.getId());
        newToken.setTenantId(tenant.getId());
        newToken.setTokenHash(newHashedRefreshToken);
        newToken.setExpiresAt(Instant.now().plusSeconds(tokenProvider.getRefreshTokenExpirationSeconds()));
        newToken.setRevoked(false);
        newToken.setClientIp(clientIp);
        newToken.setUserAgent(userAgent);
        refreshTokenRepository.save(newToken);

        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessToken(principal);

        return new AuthResponse(
                newAccessToken,
                newRawRefreshToken,
                tokenProvider.getAccessTokenExpirationSeconds(),
                UserResponse.fromEntity(user),
                TenantResponse.fromEntity(tenant)
        );
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.trim().isEmpty()) {
            String tokenHash = tokenProvider.hashToken(rawRefreshToken.trim());
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.setRevoked(true);
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            });
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, String contextTenantId, String baseUrl) {
        String email = request.getEmail().trim().toLowerCase();
        TenantEntity tenant = (request.getOrganizationSlug() != null && !request.getOrganizationSlug().trim().isEmpty())
                ? tenantService.resolveTenant(request.getOrganizationSlug())
                : tenantService.resolveTenant(contextTenantId);

        userRepository.findByTenantIdAndEmail(tenant.getId(), email)
                .or(() -> userRepository.findByEmail(email))
                .ifPresent(user -> {
                    String rawToken = tokenProvider.generateRandomToken();
                    String tokenHash = tokenProvider.hashToken(rawToken);

                    VerificationTokenEntity token = new VerificationTokenEntity();
                    token.setId("vt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20));
                    token.setUserId(user.getId());
                    token.setTokenHash(tokenHash);
                    token.setType("PASSWORD_RESET");
                    token.setExpiresAt(Instant.now().plusSeconds(3600)); // 1 hour
                    token.setUsed(false);
                    verificationTokenRepository.save(token);

                    String resetUrl = (baseUrl != null ? baseUrl : "") + "/reset-password?token=" + rawToken;
                    emailService.sendPasswordResetEmail(user.getEmail(), rawToken, resetUrl);
                });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = tokenProvider.hashToken(request.getToken().trim());
        VerificationTokenEntity token = verificationTokenRepository.findByTokenHashAndType(tokenHash, "PASSWORD_RESET")
                .orElseThrow(() -> new BadRequestException("Invalid password reset token"));

        if (token.isUsed()) {
            throw new BadRequestException("Password reset token has already been used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Password reset token has expired");
        }

        UserEntity user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", token.getUserId()));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsed(true);
        verificationTokenRepository.save(token);

        // Invalidate all existing refresh tokens for security
        List<RefreshTokenEntity> userTokens = refreshTokenRepository.findAllByUserId(user.getId());
        for (RefreshTokenEntity t : userTokens) {
            t.setRevoked(true);
            t.setRevokedAt(Instant.now());
        }
        refreshTokenRepository.saveAll(userTokens);
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private AuthResponse issueAuthResponse(UserEntity user, TenantEntity tenant, String clientIp, String userAgent) {
        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(principal);

        String rawRefreshToken = tokenProvider.generateRandomToken();
        String hashedRefreshToken = tokenProvider.hashToken(rawRefreshToken);

        RefreshTokenEntity refreshTokenEntity = new RefreshTokenEntity();
        refreshTokenEntity.setId("ref_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20));
        refreshTokenEntity.setUserId(user.getId());
        refreshTokenEntity.setTenantId(tenant.getId());
        refreshTokenEntity.setTokenHash(hashedRefreshToken);
        refreshTokenEntity.setExpiresAt(Instant.now().plusSeconds(tokenProvider.getRefreshTokenExpirationSeconds()));
        refreshTokenEntity.setRevoked(false);
        refreshTokenEntity.setClientIp(clientIp);
        refreshTokenEntity.setUserAgent(userAgent);
        refreshTokenRepository.save(refreshTokenEntity);

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                tokenProvider.getAccessTokenExpirationSeconds(),
                UserResponse.fromEntity(user),
                TenantResponse.fromEntity(tenant)
        );
    }
}

