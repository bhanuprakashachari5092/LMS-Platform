package com.shaivikagroups.lms.practice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PracticeProblemTemplateRepository extends JpaRepository<PracticeProblemTemplateEntity, String> {

    List<PracticeProblemTemplateEntity> findByProblemId(String problemId);

    Optional<PracticeProblemTemplateEntity> findByProblemIdAndLanguage(String problemId, String language);

    void deleteByProblemId(String problemId);
}
