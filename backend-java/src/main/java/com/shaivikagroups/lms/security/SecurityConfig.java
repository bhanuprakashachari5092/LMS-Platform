package com.shaivikagroups.lms.security;

import com.shaivikagroups.lms.tenant.TenantFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security 6 Configuration for Stateless REST API with Multi-Tenant JWT Authentication.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final TenantFilter tenantFilter;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(
            TenantFilter tenantFilter,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler) {
        this.tenantFilter = tenantFilter;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Disable automatic servlet container registration for TenantFilter so it only runs in the Security chain.
     */
    @Bean
    public FilterRegistrationBean<TenantFilter> tenantFilterRegistration(TenantFilter filter) {
        FilterRegistrationBean<TenantFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    /**
     * Disable automatic servlet container registration for JwtAuthenticationFilter so it only runs in the Security chain.
     */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtAuthFilterRegistration(JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {}) // Handled by CorsConfig CorsFilter
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. Health & Discovery Probes
                        .requestMatchers("/", "/health", "/api/v1/health").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                        // 2. Swagger / OpenAPI UI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        // 3. Authenticated User Endpoints under Auth
                        .requestMatchers("/api/v1/auth/me", "/api/v1/auth/change-password").authenticated()

                        // 4. Public Auth & Tenant Resolution/Onboarding Endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/tenants/public/**", "/api/v1/tenants/onboard").permitAll()

                        // 4. Public Course, Lesson & Internship Browsing (Free previews)
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/lessons/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/subscriptions/plans").permitAll()
                        .requestMatchers("/api/v1/coupons/validate").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/practice/languages", "/api/v1/practice/problems", "/api/v1/practice/problems/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/practice/run").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/internships", "/api/v1/internships/*", "/api/v1/internships/verify/**", "/api/v1/careers", "/api/v1/careers/*", "/api/v1/careers/openings", "/api/v1/careers/openings/*", "/api/v1/careers/verify/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/internships/apply", "/api/v1/careers/apply", "/api/v1/careers/applications").permitAll()

                        // 5. Public Certificate Verification, Showcase Portfolios, AI & GitHub Integrations
                        .requestMatchers(HttpMethod.GET, "/api/v1/certificates/verify/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/portfolio/public/**", "/api/v1/portfolio/me").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/portfolio/me").permitAll()
                        .requestMatchers("/api/v1/ai/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/integrations/github/**").permitAll()

                        // 6. Webhooks
                        .requestMatchers("/api/v1/payments/webhook/**").permitAll()

                        // 7. Role-Protected Endpoints
                        .requestMatchers("/api/v1/admin/internships/**", "/api/v1/admin/careers/**").hasAnyRole("SUPER_ADMIN", "ORGANIZATION_ADMIN", "LECTURER")
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("SUPER_ADMIN", "ORGANIZATION_ADMIN")
                        .requestMatchers("/api/v1/lecturer/**").hasAnyRole("SUPER_ADMIN", "ORGANIZATION_ADMIN", "LECTURER")

                        // 8. All other requests require authentication
                        .anyRequest().authenticated()
                );

        // Chain order: TenantFilter -> JwtAuthenticationFilter -> UsernamePasswordAuthenticationFilter
        http.addFilterBefore(tenantFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
