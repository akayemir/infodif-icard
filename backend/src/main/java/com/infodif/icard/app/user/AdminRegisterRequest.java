package com.infodif.icard.app.user;

public record AdminRegisterRequest(
        String email,
        String password,
        String firstName,
        String lastName,
        Role role,
        String departmentId,
        Boolean active
) {
}