package com.infodif.icard.app.attendance;

import java.math.BigDecimal;

public record AttendanceStats(BigDecimal weeklyHours, BigDecimal dailyHours, BigDecimal totalHours, Long weeklyLogin, Long weeklyLogout) {
}