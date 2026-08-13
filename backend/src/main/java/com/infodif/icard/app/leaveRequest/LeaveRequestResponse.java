package com.infodif.icard.app.leaveRequest;

import com.infodif.icard.app.user.AppUser;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveRequestResponse(
        String id,
        String userId,
        String userFullName,
        LocalDate startDate,
        LocalDate endDate,
        LeaveType leaveType,
        String reason,
        LeaveStatus status,
        String approvedById,
        String approvedByName,
        LocalDateTime createdDate,
        LocalDateTime decisionDate
) {
    public static LeaveRequestResponse from(LeaveRequest lr) {
        AppUser user = lr.getUser();
        AppUser approver = lr.getApprovedBy();

        return new LeaveRequestResponse(
                lr.getId(),
                user != null ? user.getId() : null,
                user != null ? (user.getFirstName() + " " + user.getLastName()) : null,
                lr.getStartDate(),
                lr.getEndDate(),
                lr.getLeaveType(),
                lr.getReason(),
                lr.getStatus(),
                approver != null ? approver.getId() : null,
                approver != null ? (approver.getFirstName() + " " + approver.getLastName()) : null,
                lr.getCreatedDate(),
                lr.getDecisionDate()
        );
    }
}