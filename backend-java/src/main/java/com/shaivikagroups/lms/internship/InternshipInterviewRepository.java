package com.shaivikagroups.lms.internship;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipInterviewRepository extends JpaRepository<InternshipInterviewEntity, String> {
    Optional<InternshipInterviewEntity> findByApplicationId(String applicationId);
    List<InternshipInterviewEntity> findByApplicationIdIn(List<String> applicationIds);
}

