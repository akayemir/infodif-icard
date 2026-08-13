package com.infodif.icard.app.manager;

import com.infodif.icard.app.attendance.AttendanceFilterOperator;
import com.infodif.icard.app.attendance.AttendanceResponse;
import com.infodif.icard.app.department.DepartmentResponse;
import com.infodif.icard.app.user.AdminUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/manager")
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerService managerService;

    @GetMapping("/department")
    @PreAuthorize("hasRole('MANAGER')")
    public DepartmentResponse getMyDepartment(Authentication authentication) {
        return managerService.getMyDepartment(authentication.getName());
    }

    @GetMapping("/team")
    @PreAuthorize("hasRole('MANAGER')")
    public List<AdminUserResponse> getTeam(Authentication authentication) {
        return managerService.getTeam(authentication.getName());
    }

    @GetMapping("/team/attendance")
    @PreAuthorize("hasRole('MANAGER')")
    public List<AttendanceResponse> getTeamAttendance(Authentication authentication) {
        return managerService.getTeamAttendance(authentication.getName());
    }

    @GetMapping("/department/employees")
    @PreAuthorize("hasRole('MANAGER')")
    public Page<DepartmentEmployeeResponse> getDepartmentEmployees(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(required = false) String filterField,
            @RequestParam(required = false) AttendanceFilterOperator filterOperator,
            @RequestParam(required = false) List<String> filterValue
    ) {
        return managerService.getDepartmentEmployees(
                authentication.getName(), pageable, filterField, filterOperator, filterValue);
    }

    @GetMapping("/department/attendance")
    @PreAuthorize("hasRole('MANAGER')")
    public Page<AttendanceResponse> getDepartmentAttendance(
            Authentication authentication,
            @PageableDefault(size = 5, sort = "loginTime", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String filterField,
            @RequestParam(required = false) AttendanceFilterOperator filterOperator,
            @RequestParam(required = false) List<String> filterValue
    ) {
        return managerService.getDepartmentAttendance(
                authentication.getName(), pageable, filterField, filterOperator, filterValue);
    }

    @GetMapping("/team/overtime-summary")
    @PreAuthorize("hasRole('MANAGER')")
    public List<OvertimeSummaryResponse> getTeamOvertimeSummary(Authentication authentication) {
        return managerService.getTeamOvertimeSummary(authentication.getName());
    }

    @GetMapping("/team/stats")
    @PreAuthorize("hasRole('MANAGER')")
    public TeamStatsResponse getTeamStats(Authentication authentication) {
        return managerService.getTeamStats(authentication.getName());
    }
}