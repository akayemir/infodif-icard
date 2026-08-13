package com.infodif.icard.app.manager;

public record OvertimeSummaryResponse(
        String userId,
        String userFullName,
        Long totalOvertimeMinutes
) {
}