package com.infodif.icard.app.department;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping("/admin/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public List<DepartmentResponse> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/departments/{id}/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public DepartmentStatsResponse getDepartmentStats(
            @PathVariable String id,
            Authentication authentication
    ) {
        return departmentService.getDepartmentStats(id, authentication);
    }

    @PostMapping("/admin/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public DepartmentResponse createDepartment(@RequestBody DepartmentCreateRequest request) {
        return departmentService.createDepartment(request);
    }

    @PutMapping("/admin/departments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public DepartmentResponse updateDepartment(
            @PathVariable String id,
            @RequestBody DepartmentUpdateRequest request
    ) {
        return departmentService.updateDepartment(id, request);
    }

}