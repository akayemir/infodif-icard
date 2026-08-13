package com.infodif.icard.app.workSchedule;

import java.time.Instant;
import java.time.LocalTime;

public record WorkScheduleResponse(
        String id,
        String departmentId,
        String departmentName,
        LocalTime startTime,
        LocalTime endTime,
        Integer toleranceMinutes
) {
    public static WorkScheduleResponse from(WorkSchedule schedule) {
        return new WorkScheduleResponse(
                schedule.getId(),
                schedule.getDepartment() != null ? schedule.getDepartment().getId() : null,
                schedule.getDepartment() != null ? schedule.getDepartment().getName() : null,
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getToleranceMinutes()
        );
    }
}