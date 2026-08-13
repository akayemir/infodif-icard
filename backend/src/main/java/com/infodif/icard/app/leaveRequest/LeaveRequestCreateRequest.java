package com.infodif.icard.app.leaveRequest;

import java.time.LocalDate;

public record LeaveRequestCreateRequest(
        LocalDate startDate,
        LocalDate endDate,
        LeaveType leaveType,
        String reason
) {
}