package com.shaivikagroups.lms.coupon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<CouponEntity, String> {

    Optional<CouponEntity> findByTenantIdAndCode(String tenantId, String code);

    List<CouponEntity> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    boolean existsByTenantIdAndCode(String tenantId, String code);
}

