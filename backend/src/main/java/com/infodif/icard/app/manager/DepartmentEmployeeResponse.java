package com.infodif.icard.app.manager;

import com.infodif.icard.app.user.AppUser;

public record DepartmentEmployeeResponse(
        String id,
        String firstName,
        String lastName,
        String email,
        Boolean active
) {
    public static DepartmentEmployeeResponse from(AppUser user) {
        return new DepartmentEmployeeResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getActive()
        );
    }
}