package com.infodif.icard.app.user;

public record AdminUpdateRequest(
        String firstName,
        String lastName,
        Role role,
        String departmentId,
        Boolean active
) {
}