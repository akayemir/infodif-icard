package com.infodif.icard.app.department;

import java.time.Instant;

public record DepartmentResponse(
        String id,
        String name,
        String managerId,
        String managerName,
        Instant createdDate

) {
    public static DepartmentResponse from(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getManager() != null ? department.getManager().getId() : null,
                department.getManager() != null
                        ? (department.getManager().getFirstName() + " " + department.getManager().getLastName())
                        : null,
                department.getCreatedDate()
        );
    }
}