package com.shaivikagroups.lms.internship;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipTaskRepository extends JpaRepository<InternshipTaskEntity, String> {
    List<InternshipTaskEntity> findByInternshipIdOrderByDisplayOrderAsc(String internshipId);
}

