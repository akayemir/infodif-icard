package com.infodif.icard.app.user;

import com.infodif.icard.app.attendance.AttendanceFilterOperator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AdminUserResponse> getAllUsers(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(required = false) String filterField,
            @RequestParam(required = false) AttendanceFilterOperator filterOperator,
            @RequestParam(required = false) List<String> filterValue
    ) {
        return adminService.getAllUsers(pageable, filterField, filterOperator, filterValue);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse getUser(@PathVariable String id) {
        return adminService.getUser(id);
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse register(@RequestBody AdminRegisterRequest request) {
        return adminService.register(request);
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse updateUser(@PathVariable String id, @RequestBody AdminUpdateRequest request) {
        return adminService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable String id) {
        adminService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

}