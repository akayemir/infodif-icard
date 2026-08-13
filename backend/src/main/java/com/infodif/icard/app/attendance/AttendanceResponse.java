package com.infodif.icard.app.attendance;

import com.infodif.icard.app.user.AppUser;

import java.math.BigDecimal;
import java.time.Instant;

public record AttendanceResponse(
        String id,
        String userId,
        String userEmail,
        String userFullName,
        Instant loginTime,
        Instant logoutTime,
        Long workedMinutes,
        BigDecimal workedHours,
        Boolean status,
        Boolean lateArrival,
        Boolean earlyLeave,
        Long overtimeMinutes
) {
    public static AttendanceResponse from(Attendance attendance) {
        AppUser user = attendance.getUser();
        return new AttendanceResponse(
                attendance.getId(),
                user != null ? user.getId() : null,
                user != null ? user.getEmail() : null,
                user != null ? (user.getFirstName() + " " + user.getLastName()) : null,
                attendance.getLoginTime(),
                attendance.getLogoutTime(),
                attendance.getWorkedMinutes(),
                attendance.getWorkedHours(),
                attendance.isStatus(),
                attendance.getLateArrival(),
                attendance.getEarlyLeave(),
                attendance.getOvertimeMinutes()
        );
    }
}