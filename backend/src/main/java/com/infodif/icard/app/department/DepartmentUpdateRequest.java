package com.infodif.icard.app.department;

public record DepartmentUpdateRequest(
        String name,
        String managerId
) {
}