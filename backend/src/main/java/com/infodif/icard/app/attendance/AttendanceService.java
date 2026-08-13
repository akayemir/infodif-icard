package com.infodif.icard.app.attendance;

import com.infodif.icard.app.qrcode.QrCode;
import com.infodif.icard.app.qrcode.QrCodeRepo;
import com.infodif.icard.app.qrcode.QrCodeService;
import com.infodif.icard.app.user.AppUser;
import com.infodif.icard.app.user.UserService;
import com.infodif.icard.app.workSchedule.WorkSchedule;
import com.infodif.icard.app.workSchedule.WorkScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepo attendanceRepo;
    private final UserService userService;
    private final QrCodeRepo qrCodeRepo;
    private final WorkScheduleService workScheduleService;

    public List<Attendance> getAttendancesByEmail(String email) {
        //return attendanceRepo.findByUser_EmailOrderByLoginTimeDesc(email);
        return attendanceRepo.findByUser_Email(email);
    }

    public Page<Attendance> getAttendancesByEmail(
            String email,
            Pageable pageable,
            String filterField,
            AttendanceFilterOperator filterOperator,
            List<String> filterValues
    ) {
        Specification<Attendance> spec = Specification.where(AttendanceSpecifications.forUser(email));

        Specification<Attendance> filterSpec =
                AttendanceSpecifications.withFilter(filterField, filterOperator, filterValues);

        if (filterSpec != null) {
            spec = spec.and(filterSpec);
        }

        return attendanceRepo.findAll(spec, pageable);
    }

    public Page<Attendance> getAttendancesByDepartment(
            String departmentId,
            Pageable pageable,
            String filterField,
            AttendanceFilterOperator filterOperator,
            List<String> filterValues
    ) {
        Specification<Attendance> spec = Specification.where(AttendanceSpecifications.forDepartment(departmentId));

        Specification<Attendance> filterSpec =
                AttendanceSpecifications.withFilter(filterField, filterOperator, filterValues);

        if (filterSpec != null) {
            spec = spec.and(filterSpec);
        }

        return attendanceRepo.findAll(spec, pageable);
    }

    public List<Attendance> getAllAttendances() {
        return attendanceRepo.findAll();
    }

    public boolean isCheckedIn(String email) {
        return attendanceRepo.findFirstByUser_EmailAndLogoutTimeIsNull(email).isPresent();
    }

//    public Attendance checkIn(String email, String code) {
//        AppUser user = userService.getUsers(email);
//        QrCode qrCode = QrCodeRepo.findByCode(code);
//
//        attendanceRepo.findFirstByUser_EmailAndLogoutTimeIsNull(email).ifPresent(existing -> {
//            throw new ResponseStatusException(HttpStatus.CONFLICT, "Zaten giriş yapılmış, önce çıkış yapmalısınız.");
//        });
//
//        if (qrCode.getUser()==user && qrCode.getActive()==true && qrCode.getExpireDate()<Instant.now())
//        {
//
//            Attendance attendance = new Attendance();
//            attendance.setUser(user);
//            attendance.setLoginTime(Instant.now());
//            attendance.setStatus(true);
//
//            return attendanceRepo.save(attendance);
//            }
//    }

    public Attendance checkIn(String email, String code) {
        AppUser user = userService.getUsers(email);

        QrCode qrCode = qrCodeRepo.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QR kod bulunamadı"));

        attendanceRepo.findFirstByUser_EmailAndLogoutTimeIsNull(email).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Zaten giriş yapılmış, önce çıkış yapmalısınız.");
        });

        boolean belongsToUser = qrCode.getUser() != null && email.equals(qrCode.getUser().getEmail());
        boolean isActive = Boolean.TRUE.equals(qrCode.getActive());
        boolean notExpired = qrCode.getExpireDate() != null && qrCode.getExpireDate().isAfter(Instant.now());

        if (!belongsToUser) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu QR kod bu kullanıcıya ait değil.");
        }
        if (!isActive) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR kod aktif değil.");
        }
        if (!notExpired) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR kodun süresi dolmuş.");
        }

        qrCode.setActive(false);
        qrCode.setUsed(true);
        qrCodeRepo.save(qrCode);

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setLoginTime(Instant.now());
        attendance.setStatus(true);

        applyLateArrivalTag(attendance, user);

        return attendanceRepo.save(attendance);
    }

    private void applyLateArrivalTag(Attendance attendance, AppUser user) {
        if (user.getDepartment() == null) {
            return;
        }

        Optional<WorkSchedule> scheduleOpt = workScheduleService.resolveForDepartment(user.getDepartment().getId());
        if (scheduleOpt.isEmpty()) {
            return;
        }

        WorkSchedule schedule = scheduleOpt.get();
        int tolerance = schedule.getToleranceMinutes() != null ? schedule.getToleranceMinutes() : 0;

        LocalTime loginLocalTime = attendance.getLoginTime().atZone(ZoneId.systemDefault()).toLocalTime();
        LocalTime latestAllowed = schedule.getStartTime().plusMinutes(tolerance);

        attendance.setLateArrival(loginLocalTime.isAfter(latestAllowed));
    }

    public Attendance checkOut(String email) {
        Attendance attendance = attendanceRepo.findFirstByUser_EmailAndLogoutTimeIsNull(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Açık bir giriş kaydı bulunamadı."));

        Instant logoutTime = Instant.now();
        long minutes = Duration.between(attendance.getLoginTime(), logoutTime).toMinutes();

        BigDecimal hours = BigDecimal.valueOf(minutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        attendance.setLogoutTime(logoutTime);
        attendance.setWorkedMinutes(minutes);
        attendance.setWorkedHours(hours);
        attendance.setStatus(false);

        applyEarlyLeaveAndOvertimeTags(attendance);

        return attendanceRepo.save(attendance);
    }

    private void applyEarlyLeaveAndOvertimeTags(Attendance attendance) {
        AppUser user = attendance.getUser();
        if (user == null || user.getDepartment() == null) {
            return;
        }

        Optional<WorkSchedule> scheduleOpt = workScheduleService.resolveForDepartment(user.getDepartment().getId());
        if (scheduleOpt.isEmpty()) {
            return;
        }

        WorkSchedule schedule = scheduleOpt.get();
        LocalTime logoutLocalTime = attendance.getLogoutTime().atZone(ZoneId.systemDefault()).toLocalTime();
        LocalTime endTime = schedule.getEndTime();

        if (logoutLocalTime.isBefore(endTime)) {
            attendance.setEarlyLeave(true);
            attendance.setOvertimeMinutes(0L);
        } else {
            attendance.setEarlyLeave(false);
            attendance.setOvertimeMinutes(Duration.between(endTime, logoutLocalTime).toMinutes());
        }
    }

    public AttendanceStats getStats(String email) {
        List<Attendance> all = attendanceRepo.findByUser_Email(email);

        BigDecimal totalHours = all.stream()
                .map(Attendance::getWorkedHours)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        Instant dayStart = today.atStartOfDay(zone).toInstant();

        LocalDate monday = LocalDate.now(zone).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Instant weekStart = monday.atStartOfDay(zone).toInstant();

        BigDecimal dailyHours = all.stream()
                .filter(a -> a.getWorkedHours() != null
                        && a.getLoginTime() != null
                        && !a.getLoginTime().isBefore(dayStart))
                .map(Attendance::getWorkedHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal weeklyHours = all.stream()
                .filter(a -> a.getWorkedHours() != null
                        && a.getLoginTime() != null
                        && !a.getLoginTime().isBefore(weekStart))
                .map(Attendance::getWorkedHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long weeklyLogin = all.stream()
                .filter(a -> a.getLoginTime() != null && !a.getLoginTime().isBefore(weekStart))
                .count();

        Long weeklyLogout = all.stream()
                .filter(a -> a.getLoginTime() != null
                        && !a.getLoginTime().isBefore(weekStart)
                        && !a.isStatus())
                .count();


        return new AttendanceStats(
                weeklyHours.setScale(2, RoundingMode.HALF_UP),
                dailyHours.setScale(2, RoundingMode.HALF_UP),
                totalHours.setScale(2, RoundingMode.HALF_UP),
                weeklyLogin,
                weeklyLogout
        );
    }
}