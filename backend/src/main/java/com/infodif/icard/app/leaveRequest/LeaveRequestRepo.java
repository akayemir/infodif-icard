package com.infodif.icard.app.leaveRequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepo extends JpaRepository<LeaveRequest, String>, JpaSpecificationExecutor<LeaveRequest> {

    List<LeaveRequest> findByUser_EmailOrderByCreatedDateDesc(String email);

    List<LeaveRequest> findByUser_Department_IdAndStatus(String departmentId, LeaveStatus status);
}