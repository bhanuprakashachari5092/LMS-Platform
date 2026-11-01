package com.shaivikagroups.lms.subscription;

import com.shaivikagroups.lms.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanDTO>>> listPlans() {
        return ResponseEntity.ok(ApiResponse.success(subscriptionService.listPlans()));
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantSubscriptionDTO>> getCurrentSubscription() {
        return ResponseEntity.ok(ApiResponse.success(subscriptionService.getCurrentTenantSubscription()));
    }

    @PostMapping("/upgrade")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantSubscriptionDTO>> upgradeSubscription(
            @Valid @RequestBody UpgradeSubscriptionRequest request) {
        TenantSubscriptionDTO response = subscriptionService.upgradeSubscription(request);
        return ResponseEntity.ok(ApiResponse.success("Subscription upgraded successfully", response));
    }

    @PostMapping("/cancel")
    @PreAuthorize("hasAnyRole('ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantSubscriptionDTO>> cancelSubscription() {
        TenantSubscriptionDTO response = subscriptionService.cancelSubscription();
        return ResponseEntity.ok(ApiResponse.success("Subscription auto-renewal cancelled", response));
    }
}

