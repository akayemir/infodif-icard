package com.infodif.icard.app.user;

import java.time.Instant;

public record AdminUserResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        Role role,
        Boolean active,
        String managerId,
        String managerName,
        String departmentId,
        String departmentName,
        Instant createdDate
) {
    public static AdminUserResponse from(AppUser user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getActive(),
                user.getManager() != null ? user.getManager().getId() : null,
                user.getManager() != null
                        ? (user.getManager().getFirstName() + " " + user.getManager().getLastName())
                        : null,
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getDepartment() != null ? user.getDepartment().getName() : null,
                user.getCreatedDate()
        );
    }
}