package com.infodif.icard.app.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepo extends JpaRepository<Attendance, String>, JpaSpecificationExecutor<Attendance> {

    List<Attendance> findByUser_Email(String email);

    List<Attendance> findByUser_EmailOrderByLoginTimeDesc(String email);

    Page<Attendance> findByUser_Email(String email, Pageable pageable);

    Optional<Attendance> findFirstByUser_EmailAndLogoutTimeIsNull(String email);

    List<Attendance> findByUser_Department_Id(String departmentId);

    List<Attendance> findByUser_Manager_EmailOrderByLoginTimeDesc(String managerEmail);
}