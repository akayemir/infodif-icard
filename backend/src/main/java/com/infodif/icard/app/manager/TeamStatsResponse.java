package com.infodif.icard.app.manager;

import java.math.BigDecimal;

public record TeamStatsResponse(
        Long lateArrivalCountThisMonth,
        BigDecimal totalOvertimeHours,
        BigDecimal weeklyHours,
        BigDecimal dailyHours,
        Long onLeaveCount
) {
}