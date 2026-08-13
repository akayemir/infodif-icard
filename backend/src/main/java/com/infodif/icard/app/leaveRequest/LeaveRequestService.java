package com.infodif.icard.app.leaveRequest;

import com.infodif.icard.app.attendance.AttendanceFilterOperator;
import com.infodif.icard.app.user.AppUser;
import com.infodif.icard.app.user.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepo leaveRequestRepo;
    private final UserRepo userRepo;

    public LeaveRequestResponse create(String email, LeaveRequestCreateRequest request) {
        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        if (request.startDate() == null || request.endDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startDate ve endDate gerekli");
        }
        if (request.startDate().isAfter(request.endDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startDate, endDate'ten sonra olamaz");
        }
        if (request.leaveType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "leaveType gerekli");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(user);
        leaveRequest.setStartDate(request.startDate());
        leaveRequest.setEndDate(request.endDate());
        leaveRequest.setLeaveType(request.leaveType());
        leaveRequest.setReason(request.reason());
        leaveRequest.setStatus(LeaveStatus.PENDING);
        leaveRequest.setCreatedDate(LocalDateTime.now());

        return LeaveRequestResponse.from(leaveRequestRepo.save(leaveRequest));
    }

    public List<LeaveRequestResponse> getMyLeaveRequests(String email) {
        return leaveRequestRepo.findByUser_EmailOrderByCreatedDateDesc(email).stream()
                .map(LeaveRequestResponse::from)
                .toList();
    }

    public Page<LeaveRequestResponse> getTeamLeaveRequests(
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

        Specification<LeaveRequest> spec = LeaveRequestSpecifications.forDepartment(manager.getDepartment().getId());

        Specification<LeaveRequest> filterSpec =
                LeaveRequestSpecifications.withFilter(filterField, filterOperator, filterValues);
        if (filterSpec != null) {
            spec = spec.and(filterSpec);
        }

        return leaveRequestRepo.findAll(spec, pageable).map(LeaveRequestResponse::from);
    }

    public LeaveRequestResponse approve(String requestId, String managerEmail) {
        return decide(requestId, managerEmail, LeaveStatus.APPROVED);
    }

    public LeaveRequestResponse reject(String requestId, String managerEmail) {
        return decide(requestId, managerEmail, LeaveStatus.REJECTED);
    }

    private LeaveRequestResponse decide(String requestId, String managerEmail, LeaveStatus decision) {
        AppUser manager = userRepo.findByEmail(managerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        LeaveRequest leaveRequest = leaveRequestRepo.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "İzin talebi bulunamadı: " + requestId));

        assertManagerOwnsRequest(leaveRequest, manager);

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu talep zaten karara bağlanmış");
        }

        leaveRequest.setStatus(decision);
        leaveRequest.setApprovedBy(manager);
        leaveRequest.setDecisionDate(LocalDateTime.now());

        return LeaveRequestResponse.from(leaveRequestRepo.save(leaveRequest));
    }


    private void assertManagerOwnsRequest(LeaveRequest leaveRequest, AppUser manager) {
        boolean sameDepartment = leaveRequest.getUser() != null
                && leaveRequest.getUser().getDepartment() != null
                && manager.getDepartment() != null
                && leaveRequest.getUser().getDepartment().getId().equals(manager.getDepartment().getId());

        if (!sameDepartment) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu izin talebine erişim yetkiniz yok");
        }
    }
}