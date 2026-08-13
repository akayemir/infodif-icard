package com.infodif.icard.app.leaveRequest;

import com.infodif.icard.app.attendance.AttendanceFilterOperator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @PostMapping("/leaves")
    public LeaveRequestResponse create(Authentication authentication, @RequestBody LeaveRequestCreateRequest request) {
        return leaveRequestService.create(authentication.getName(), request);
    }

    @GetMapping("/leaves/me")
    public List<LeaveRequestResponse> getMyLeaveRequests(Authentication authentication) {
        return leaveRequestService.getMyLeaveRequests(authentication.getName());
    }

    @GetMapping("/manager/leaves")
    @PreAuthorize("hasRole('MANAGER')")
    public Page<LeaveRequestResponse> getTeamLeaveRequests(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "createdDate", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String filterField,
            @RequestParam(required = false) AttendanceFilterOperator filterOperator,
            @RequestParam(required = false) List<String> filterValue
    ) {
        return leaveRequestService.getTeamLeaveRequests(
                authentication.getName(), pageable, filterField, filterOperator, filterValue);
    }

    @PutMapping("/manager/leaves/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public LeaveRequestResponse approve(@PathVariable String id, Authentication authentication) {
        return leaveRequestService.approve(id, authentication.getName());
    }

    @PutMapping("/manager/leaves/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public LeaveRequestResponse reject(@PathVariable String id, Authentication authentication) {
        return leaveRequestService.reject(id, authentication.getName());
    }
}