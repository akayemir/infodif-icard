package com.infodif.icard.app.attendance;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/attendance")
    public Page<AttendanceResponse> getMyAttendances(
            Authentication authentication,
            @PageableDefault(size = 5, sort = "loginTime", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String filterField,
            @RequestParam(required = false) AttendanceFilterOperator filterOperator,
            @RequestParam(required = false) List<String> filterValue
    ) {
        String email = authentication.getName();
        return attendanceService.getAttendancesByEmail(email, pageable, filterField, filterOperator, filterValue)
                .map(AttendanceResponse::from);
    }

    @GetMapping("/attendance/status")
    public boolean isCheckedIn(Authentication authentication) {
        String email = authentication.getName();
        return attendanceService.isCheckedIn(email);
    }

    @GetMapping("/attendances")
    public List<Attendance> getAllAttendances() {
        return attendanceService.getAllAttendances();
    }

    @PostMapping("/attendance/checkin")
    public Attendance checkIn(Authentication authentication, @RequestParam String code) {
        String email = authentication.getName();
        return attendanceService.checkIn(email, code);
    }

    @PostMapping("/attendance/checkout")
    public Attendance checkOut(Authentication authentication) {
        String email = authentication.getName();
        return attendanceService.checkOut(email);
    }

    @GetMapping("/attendance/stats")
    public AttendanceStats getMyStats(Authentication authentication) {
        String email = authentication.getName();
        return attendanceService.getStats(email);
    }
}