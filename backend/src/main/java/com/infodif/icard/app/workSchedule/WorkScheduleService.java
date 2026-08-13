package com.infodif.icard.app.workSchedule;

import com.infodif.icard.app.department.Department;
import com.infodif.icard.app.department.DepartmentRepo;
import com.infodif.icard.app.user.AppUser;
import com.infodif.icard.app.user.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkScheduleService {

    private final WorkScheduleRepo workScheduleRepo;
    private final DepartmentRepo departmentRepo;
    private final UserRepo userRepo;

    public WorkScheduleResponse create(WorkScheduleCreateRequest request) {
        validateTimes(request.startTime(), request.endTime());

        WorkSchedule schedule = new WorkSchedule();
        schedule.setStartTime(request.startTime());
        schedule.setEndTime(request.endTime());
        schedule.setToleranceMinutes(request.toleranceMinutes() != null ? request.toleranceMinutes() : 0);
        schedule.setCreatedDate(Instant.now());

        if (request.departmentId() != null && !request.departmentId().isBlank()) {
            Department department = departmentRepo.findById(request.departmentId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Departman bulunamadı: " + request.departmentId()));
            schedule.setDepartment(department);
        }

        return WorkScheduleResponse.from(workScheduleRepo.save(schedule));
    }

    public WorkScheduleResponse update(String id, WorkScheduleUpdateRequest request) {
        WorkSchedule schedule = workScheduleRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Mesai kuralı bulunamadı: " + id));

        if (request.startTime() != null) {
            schedule.setStartTime(request.startTime());
        }
        if (request.endTime() != null) {
            schedule.setEndTime(request.endTime());
        }
        validateTimes(schedule.getStartTime(), schedule.getEndTime());

        if (request.toleranceMinutes() != null) {
            schedule.setToleranceMinutes(request.toleranceMinutes());
        }

        if (request.departmentId() != null) {
            if (request.departmentId().isBlank()) {
                schedule.setDepartment(null);
            } else {
                Department department = departmentRepo.findById(request.departmentId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.BAD_REQUEST, "Departman bulunamadı: " + request.departmentId()));
                schedule.setDepartment(department);
            }
        }

        return WorkScheduleResponse.from(workScheduleRepo.save(schedule));
    }

    public List<WorkScheduleResponse> getAll() {
        return workScheduleRepo.findAll().stream()
                .map(WorkScheduleResponse::from)
                .toList();
    }

    public Optional<WorkSchedule> resolveForDepartment(String departmentId) {
        List<WorkSchedule> departmentSpecific = workScheduleRepo.findByDepartment_Id(departmentId);
        if (!departmentSpecific.isEmpty()) {
            return Optional.of(departmentSpecific.get(0));
        }

        List<WorkSchedule> general = workScheduleRepo.findByDepartmentIsNull();
        return general.isEmpty() ? Optional.empty() : Optional.of(general.get(0));
    }

    public WorkScheduleResponse getMyResolvedSchedule(String email) {
        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        if (user.getDepartment() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bu kullanıcıya atanmış bir departman yok");
        }

        WorkSchedule schedule = resolveForDepartment(user.getDepartment().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Bu departman için tanımlı bir mesai kuralı yok"));

        return WorkScheduleResponse.from(schedule);
    }

    private void validateTimes(java.time.LocalTime start, java.time.LocalTime end) {
        if (start == null || end == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime ve endTime gerekli");
        }
        if (!start.isBefore(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime, endTime'dan önce olmalı");
        }
    }
}