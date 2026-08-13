package com.infodif.icard.app.department;

import java.math.BigDecimal;

public record DepartmentStatsResponse(
        String departmentId,
        String departmentName,
        BigDecimal totalHours,
        BigDecimal weeklyHours
) {
}