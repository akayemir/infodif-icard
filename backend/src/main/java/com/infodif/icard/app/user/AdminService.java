package com.infodif.icard.app.user;

import com.infodif.icard.app.attendance.AttendanceFilterOperator;
import com.infodif.icard.app.department.Department;
import com.infodif.icard.app.department.DepartmentRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminService {

    private final UserRepo userRepo;
    private final DepartmentRepo departmentRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminUserResponse register(AdminRegisterRequest request) {
        userRepo.findByEmail(request.email()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        });

        AppUser user = new AppUser();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setCreatedDate(Instant.now());
        user.setRole(request.role() != null ? request.role() : Role.ROLE_EMPLOYEE);
        user.setActive(request.active() != null ? request.active() : true);

        user = userRepo.save(user);

        if (request.departmentId() != null && !request.departmentId().isBlank()) {
            user = assignDepartment(user, request.departmentId());
        }

        return AdminUserResponse.from(user);
    }

    public Page<AdminUserResponse> getAllUsers(
            Pageable pageable,
            String filterField,
            AttendanceFilterOperator filterOperator,
            List<String> filterValues
    ) {
        Specification<AppUser> filterSpec = UserSpecifications.withFilter(filterField, filterOperator, filterValues);


        Specification<AppUser> spec = (root, query, cb) -> cb.conjunction();

        if (filterSpec != null) {
            spec = spec.and(filterSpec);
        }

        if (pageable.getSort().isUnsorted()) {
            spec = spec.and(UserSpecifications.defaultOrder());
        }

        Page<AppUser> page = userRepo.findAll(spec, pageable);

        return page.map(AdminUserResponse::from);
    }

    public AdminUserResponse getUser(String userId) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı: " + userId));
        return AdminUserResponse.from(user);
    }

    public AdminUserResponse updateUser(String userId, AdminUpdateRequest request) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı: " + userId));

        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.active() != null) {
            user.setActive(request.active());
        }

        if (request.departmentId() != null) {
            if (request.departmentId().isBlank()) {
                user.setDepartment(null);
                user.setManager(null);
            } else {
                user = assignDepartment(user, request.departmentId());
            }
        }

        return AdminUserResponse.from(userRepo.save(user));
    }

    private AppUser assignDepartment(AppUser user, String departmentId) {
        Department department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Departman bulunamadı: " + departmentId));

        user.setDepartment(department);

        if (user.getRole() == Role.ROLE_MANAGER) {
            user.setManager(null);
            department.setManager(user);
            departmentRepo.save(department);
            propagateManagerToDepartmentMembers(department, user);
        } else {
            user.setManager(department.getManager());
        }

        return userRepo.save(user);
    }

    private void propagateManagerToDepartmentMembers(Department department, AppUser excludeUser) {
        List<AppUser> members = userRepo.findByDepartment_Id(department.getId()).stream()
                .filter(member -> excludeUser == null || !member.getId().equals(excludeUser.getId()))
                .toList();

        members.forEach(member -> member.setManager(department.getManager()));
        userRepo.saveAll(members);
    }

    public void deactivateUser(String userId) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı: " + userId));

        user.setActive(false);
        userRepo.save(user);
    }
}