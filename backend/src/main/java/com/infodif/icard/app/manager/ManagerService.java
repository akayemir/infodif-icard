package com.infodif.icard.app.manager;

import com.infodif.icard.app.attendance.Attendance;
import com.infodif.icard.app.attendance.AttendanceFilterOperator;
import com.infodif.icard.app.attendance.AttendanceRepo;
import com.infodif.icard.app.attendance.AttendanceResponse;
import com.infodif.icard.app.attendance.AttendanceService;
import com.infodif.icard.app.department.DepartmentResponse;
import com.infodif.icard.app.leaveRequest.LeaveRequestRepo;
import com.infodif.icard.app.leaveRequest.LeaveStatus;
import com.infodif.icard.app.user.AdminUserResponse;
import com.infodif.icard.app.user.AppUser;
import com.infodif.icard.app.user.UserRepo;
import com.infodif.icard.app.user.UserSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
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
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerService {

    private final UserRepo userRepo;
    private final AttendanceRepo attendanceRepo;
    private final AttendanceService attendanceService;
    private final LeaveRequestRepo leaveRequestRepo;


    public DepartmentResponse getMyDepartment(String managerEmail) {
        AppUser manager = userRepo.findByEmail(managerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        if (manager.getDepartment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu kullanıcıya atanmış bir departman yok");
        }

        return DepartmentResponse.from(manager.getDepartment());
    }

    public List<AdminUserResponse> getTeam(String managerEmail) {
        return userRepo.findByManager_Email(managerEmail).stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    public List<AttendanceResponse> getTeamAttendance(String managerEmail) {
        return attendanceRepo.findByUser_Manager_EmailOrderByLoginTimeDesc(managerEmail).stream()
                .map(AttendanceResponse::from)
                .toList();
    }

    public Page<DepartmentEmployeeResponse> getDepartmentEmployees(
            String managerEmail,
            Pageable pageable,
            String filterField,
            AttendanceFilterOperator filterOperator,
            List<String> filterValues
    ) {
        AppUser manager = userRepo.findByEmail(managerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        if (manager.getDepartment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu kullanıcıya atanmış bir departman yok");
        }

        String departmentId = manager.getDepartment().getId();

        Specification<AppUser> filterSpec = UserSpecifications.withFilter(filterField, filterOperator, filterValues);

        Specification<AppUser> spec = UserSpecifications.belongsToDepartment(departmentId);
        if (filterSpec != null) {
            spec = spec.and(filterSpec);
        }

        Page<AppUser> page = userRepo.findAll(spec, pageable);

        return page.map(DepartmentEmployeeResponse::from);
    }

    public Page<AttendanceResponse> getDepartmentAttendance(
            String managerEmail,
            Pageable pageable,
            String filterField,
            AttendanceFilterOperator filterOperator,
            List<String> filterValues
    ) {
        AppUser manager = userRepo.findByEmail(managerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        if (manager.getDepartment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu kullanıcıya atanmış bir departman yok");
        }

        String departmentId = manager.getDepartment().getId();

        return attendanceService
                .getAttendancesByDepartment(departmentId, pageable, filterField, filterOperator, filterValues)
                .map(AttendanceResponse::from);
    }

    public List<OvertimeSummaryResponse> getTeamOvertimeSummary(String managerEmail) {
        AppUser manager = userRepo.findByEmail(managerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        if (manager.getDepartment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu kullanıcıya atanmış bir departman yok");
        }

        String departmentId = manager.getDepartment().getId();

        List<Attendance> completedAttendances = attendanceRepo.findByUser_Department_Id(departmentId).stream()
                .filter(a -> a.getLogoutTime() != null && a.getOvertimeMinutes() != null)
                .toList();

        Map<String, List<Attendance>> byUser = completedAttendances.stream()
                .collect(Collectors.groupingBy(a -> a.getUser().getId()));

        return byUser.entrySet().stream()
                .map(entry -> {
                    AppUser user = entry.getValue().get(0).getUser();

                    long totalOvertime = entry.getValue().stream()
                            .mapToLong(Attendance::getOvertimeMinutes)
                            .sum();

                    return new OvertimeSummaryResponse(
                            user.getId(),
                            user.getFirstName() + " " + user.getLastName(),
                            totalOvertime
                    );
                })
                .toList();
    }


    public TeamStatsResponse getTeamStats(String managerEmail) {
        AppUser manager = userRepo.findByEmail(managerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        if (manager.getDepartment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu kullanıcıya atanmış bir departman yok");
        }

        String departmentId = manager.getDepartment().getId();
        List<Attendance> all = attendanceRepo.findByUser_Department_Id(departmentId);

        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        Instant monthStartInstant = monthStart.atStartOfDay(zone).toInstant();
        Instant weekStartInstant = monday.atStartOfDay(zone).toInstant();
        Instant todayStartInstant = today.atStartOfDay(zone).toInstant();
        Instant todayEndInstant = today.plusDays(1).atStartOfDay(zone).toInstant();

        long lateArrivalCount = all.stream()
                .filter(a -> Boolean.TRUE.equals(a.getLateArrival()))
                .filter(a -> a.getLoginTime() != null && !a.getLoginTime().isBefore(monthStartInstant))
                .count();

        long totalOvertimeMinutes = all.stream()
                .map(Attendance::getOvertimeMinutes)
                .filter(Objects::nonNull)
                .mapToLong(Long::longValue)
                .sum();

        BigDecimal weeklyHours = sumWorkedHoursSince(all, weekStartInstant, null);
        BigDecimal dailyHours = sumWorkedHoursSince(all, todayStartInstant, todayEndInstant);

        long onLeaveCount = leaveRequestRepo.findByUser_Department_IdAndStatus(departmentId, LeaveStatus.APPROVED)
                .stream()
                .filter(lr -> !today.isBefore(lr.getStartDate()) && !today.isAfter(lr.getEndDate()))
                .count();

        return new TeamStatsResponse(
                lateArrivalCount,
                BigDecimal.valueOf(totalOvertimeMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP),
                weeklyHours,
                dailyHours,
                onLeaveCount
        );
    }

    private BigDecimal sumWorkedHoursSince(List<Attendance> attendances, Instant from, Instant toExclusive) {
        return attendances.stream()
                .filter(a -> a.getWorkedHours() != null && a.getLoginTime() != null)
                .filter(a -> !a.getLoginTime().isBefore(from))
                .filter(a -> toExclusive == null || a.getLoginTime().isBefore(toExclusive))
                .map(Attendance::getWorkedHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }
}