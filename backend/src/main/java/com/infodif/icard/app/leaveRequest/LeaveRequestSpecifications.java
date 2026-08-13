package com.infodif.icard.app.leaveRequest;

import com.infodif.icard.app.attendance.AttendanceFilterOperator;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public class LeaveRequestSpecifications {

    private static final Set<String> ALLOWED_FIELDS = Set.of(
            "status", "leaveType", "startDate", "endDate"
    );

    private static final Set<String> DATE_FIELDS = Set.of("startDate", "endDate");

    public static Specification<LeaveRequest> forDepartment(String departmentId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("department").get("id"), departmentId);
    }

    public static Specification<LeaveRequest> withFilter(
            String field, AttendanceFilterOperator operator, List<String> values
    ) {
        if (field == null || operator == null || values == null || values.isEmpty()) {
            return null;
        }
        if (!ALLOWED_FIELDS.contains(field)) {
            throw new IllegalArgumentException("Geçersiz filtre alanı: " + field);
        }

        boolean isDateField = DATE_FIELDS.contains(field);

        return switch (operator) {
            case EQ -> isDateField
                    ? (root, query, cb) -> cb.equal(root.get(field), LocalDate.parse(values.get(0)))
                    : (root, query, cb) -> cb.equal(root.get(field), parseValue(field, values.get(0)));

            case IN -> (root, query, cb) ->
                    root.get(field).in(values.stream().map(v -> parseValue(field, v)).toList());

            case BETWEEN, DATE_BETWEEN -> {
                LocalDate min = LocalDate.parse(values.get(0));
                LocalDate max = LocalDate.parse(values.get(1));
                yield (root, query, cb) -> cb.between(root.get(field), min, max);
            }
        };
    }

    private static Object parseValue(String field, String raw) {
        return switch (field) {
            case "status" -> LeaveStatus.valueOf(raw);
            case "leaveType" -> LeaveType.valueOf(raw);
            case "startDate", "endDate" -> LocalDate.parse(raw);
            default -> raw;
        };
    }
}