package com.infodif.icard.app.department;

public record DepartmentCreateRequest(
        String name,
        String managerId
) {
}