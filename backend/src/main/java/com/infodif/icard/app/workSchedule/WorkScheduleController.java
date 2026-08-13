package com.infodif.icard.app.workSchedule;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WorkScheduleController {

    private final WorkScheduleService workScheduleService;

    @PostMapping("/admin/work-schedules")
    @PreAuthorize("hasRole('ADMIN')")
    public WorkScheduleResponse create(@RequestBody WorkScheduleCreateRequest request) {
        return workScheduleService.create(request);
    }

    @PutMapping("/admin/work-schedules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public WorkScheduleResponse update(@PathVariable String id, @RequestBody WorkScheduleUpdateRequest request) {
        return workScheduleService.update(id, request);
    }


    @GetMapping("/work-schedules")
    public List<WorkScheduleResponse> getAll() {
        return workScheduleService.getAll();
    }

    @GetMapping("/work-schedules/mine")
    public WorkScheduleResponse getMySchedule(Authentication authentication) {
        return workScheduleService.getMyResolvedSchedule(authentication.getName());
    }
}