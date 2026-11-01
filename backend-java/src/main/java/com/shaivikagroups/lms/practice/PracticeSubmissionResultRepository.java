package com.shaivikagroups.lms.practice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeSubmissionResultRepository extends JpaRepository<PracticeSubmissionResultEntity, String> {

    List<PracticeSubmissionResultEntity> findBySubmissionId(String submissionId);
}
