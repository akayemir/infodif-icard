package com.infodif.icard.app.workSchedule;

import java.time.LocalTime;

public record WorkScheduleCreateRequest(
        String departmentId,
        LocalTime startTime,
        LocalTime endTime,
        Integer toleranceMinutes
) {
}