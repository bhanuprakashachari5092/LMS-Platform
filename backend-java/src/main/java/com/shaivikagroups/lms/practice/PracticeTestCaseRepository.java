package com.shaivikagroups.lms.practice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeTestCaseRepository extends JpaRepository<PracticeTestCaseEntity, String> {

    List<PracticeTestCaseEntity> findByProblemIdOrderByDisplayOrderAsc(String problemId);

    List<PracticeTestCaseEntity> findByProblemIdAndIsHiddenFalseOrderByDisplayOrderAsc(String problemId);

    void deleteByProblemId(String problemId);
}

