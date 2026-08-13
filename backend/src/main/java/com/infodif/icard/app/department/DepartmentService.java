package com.infodif.icard.app.department;

import com.infodif.icard.app.attendance.Attendance;
import com.infodif.icard.app.attendance.AttendanceRepo;
import com.infodif.icard.app.user.AppUser;
import com.infodif.icard.app.user.Role;
import com.infodif.icard.app.user.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepo departmentRepo;
    private final UserRepo userRepo;
    private final AttendanceRepo attendanceRepo;

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepo.findAll().stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Departman adı gerekli");
        }

        departmentRepo.findAll().stream()
                .filter(d -> d.getName().equalsIgnoreCase(request.name()))
                .findFirst()
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu isimde bir departman zaten var");
                });

        Department department = new Department();
        department.setName(request.name());
        department.setCreatedDate(Instant.now());

        AppUser manager = null;

        if (request.managerId() != null && !request.managerId().isBlank()) {
            manager = userRepo.findById(request.managerId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Manager bulunamadı: " + request.managerId()));

            if (manager.getRole() != Role.ROLE_MANAGER) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Seçilen kullanıcı MANAGER rolünde değil");
            }

            department.setManager(manager);
        }

        Department saved = departmentRepo.save(department);


        if (manager != null) {
            manager.setDepartment(saved);
            manager.setManager(null);
            userRepo.save(manager);
        }

        return DepartmentResponse.from(saved);
    }

    public DepartmentResponse updateDepartment(String departmentId, DepartmentUpdateRequest request) {
        Department department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Departman bulunamadı: " + departmentId));

        if (request.name() != null && !request.name().isBlank()) {
            department.setName(request.name());
        }

        boolean managerChanged = false;

        if (request.managerId() != null) {
            if (request.managerId().isBlank()) {
                department.setManager(null);
            } else {
                AppUser manager = userRepo.findById(request.managerId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.BAD_REQUEST, "Manager bulunamadı: " + request.managerId()));

                if (manager.getRole() != Role.ROLE_MANAGER) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Seçilen kullanıcı MANAGER rolünde değil");
                }

                department.setManager(manager);
            }
            managerChanged = true;
        }

        Department saved = departmentRepo.save(department);

        if (managerChanged && saved.getManager() != null) {
            AppUser newManagerUser = saved.getManager();
            newManagerUser.setDepartment(saved);
            newManagerUser.setManager(null);
            userRepo.save(newManagerUser);
        }

        if (managerChanged) {
            AppUser newManager = saved.getManager();

            List<AppUser> members = userRepo.findByDepartment_Id(departmentId).stream()
                    .filter(member -> newManager == null || !member.getId().equals(newManager.getId()))
                    .toList();

            members.forEach(member -> member.setManager(newManager));
            userRepo.saveAll(members);
        }

        return DepartmentResponse.from(saved);
    }

    public DepartmentStatsResponse getDepartmentStats(String departmentId, Authentication authentication) {
        Department department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Departman bulunamadı: " + departmentId));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            String callerEmail = authentication.getName();
            boolean isOwnDepartment = department.getManager() != null
                    && department.getManager().getEmail().equals(callerEmail);

            if (!isOwnDepartment) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu departmana erişim yetkiniz yok");
            }
        }

        List<Attendance> all = attendanceRepo.findByUser_Department_Id(departmentId);

        BigDecimal totalHours = all.stream()
                .map(Attendance::getWorkedHours)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ZoneId zone = ZoneId.systemDefault();
        LocalDate monday = LocalDate.now(zone).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Instant weekStart = monday.atStartOfDay(zone).toInstant();

        BigDecimal weeklyHours = all.stream()
                .filter(a -> a.getWorkedHours() != null
                        && a.getLoginTime() != null
                        && !a.getLoginTime().isBefore(weekStart))
                .map(Attendance::getWorkedHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DepartmentStatsResponse(
                department.getId(),
                department.getName(),
                totalHours.setScale(2, RoundingMode.HALF_UP),
                weeklyHours.setScale(2, RoundingMode.HALF_UP)
        );
    }
}