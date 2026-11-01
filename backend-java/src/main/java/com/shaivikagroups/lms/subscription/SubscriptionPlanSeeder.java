package com.shaivikagroups.lms.subscription;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Component
@Order(5)
public class SubscriptionPlanSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionPlanSeeder.class);

    private final SubscriptionPlanRepository planRepository;

    public SubscriptionPlanSeeder(SubscriptionPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (planRepository.count() > 0) {
            return;
        }

        log.info("Seeding default LMS subscription plans...");

        SubscriptionPlanEntity starter = new SubscriptionPlanEntity();
        starter.setId("plan_free_starter");
        starter.setName("Starter Free");
        starter.setTier(PlanTier.FREE);
        starter.setBillingCycle(BillingCycle.MONTHLY);
        starter.setPriceInr(BigDecimal.ZERO);
        starter.setMaxStudents(100);
        starter.setMaxCourses(5);
        starter.setMaxStorageGb(BigDecimal.valueOf(2.00));
        starter.setFeatures("[\"5 Active Courses\", \"100 Students\", \"Community Support\", \"Basic Analytics\"]");
        starter.setActive(true);
        starter.setCreatedAt(Instant.now());

        SubscriptionPlanEntity proMonthly = new SubscriptionPlanEntity();
        proMonthly.setId("plan_pro_monthly");
        proMonthly.setName("Growth Pro (Monthly)");
        proMonthly.setTier(PlanTier.PRO);
        proMonthly.setBillingCycle(BillingCycle.MONTHLY);
        proMonthly.setPriceInr(BigDecimal.valueOf(1999.00));
        proMonthly.setMaxStudents(1000);
        proMonthly.setMaxCourses(50);
        proMonthly.setMaxStorageGb(BigDecimal.valueOf(25.00));
        proMonthly.setFeatures("[\"Unlimited Courses\", \"1,000 Students\", \"AI Mentor Integration\", \"Custom Domain\", \"Verified Certificates\"]");
        proMonthly.setActive(true);
        proMonthly.setCreatedAt(Instant.now());

        SubscriptionPlanEntity proAnnual = new SubscriptionPlanEntity();
        proAnnual.setId("plan_pro_annual");
        proAnnual.setName("Growth Pro (Annual)");
        proAnnual.setTier(PlanTier.PRO);
        proAnnual.setBillingCycle(BillingCycle.ANNUAL);
        proAnnual.setPriceInr(BigDecimal.valueOf(19990.00));
        proAnnual.setMaxStudents(1000);
        proAnnual.setMaxCourses(50);
        proAnnual.setMaxStorageGb(BigDecimal.valueOf(25.00));
        proAnnual.setFeatures("[\"Unlimited Courses\", \"1,000 Students\", \"2 Months Free\", \"AI Mentor Integration\", \"Custom Domain\", \"Verified Certificates\"]");
        proAnnual.setActive(true);
        proAnnual.setCreatedAt(Instant.now());

        SubscriptionPlanEntity enterprise = new SubscriptionPlanEntity();
        enterprise.setId("plan_enterprise_scale");
        enterprise.setName("Enterprise Scale");
        enterprise.setTier(PlanTier.ENTERPRISE);
        enterprise.setBillingCycle(BillingCycle.ANNUAL);
        enterprise.setPriceInr(BigDecimal.valueOf(49999.00));
        enterprise.setMaxStudents(10000);
        enterprise.setMaxCourses(500);
        enterprise.setMaxStorageGb(BigDecimal.valueOf(200.00));
        enterprise.setFeatures("[\"Custom Tenant Isolation\", \"Unlimited Students\", \"Dedicated Database Option\", \"SLA 99.9%\", \"Dedicated Account Architect\"]");
        enterprise.setActive(true);
        enterprise.setCreatedAt(Instant.now());

        planRepository.saveAll(List.of(starter, proMonthly, proAnnual, enterprise));
        log.info("Default subscription plans seeded successfully.");
    }
}

