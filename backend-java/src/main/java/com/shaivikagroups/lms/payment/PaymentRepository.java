package com.shaivikagroups.lms.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, String> {

    Optional<PaymentEntity> findByOrderId(String orderId);

    Optional<PaymentEntity> findByPaymentId(String paymentId);

    List<PaymentEntity> findByTenantIdAndUserIdOrderByCreatedAtDesc(String tenantId, String userId);

    List<PaymentEntity> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}

