package com.infodif.icard.app.workSchedule;

import java.time.LocalTime;

public record WorkScheduleUpdateRequest(
        String departmentId,
        LocalTime startTime,
        LocalTime endTime,
        Integer toleranceMinutes
) {
}