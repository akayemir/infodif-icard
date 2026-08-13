package com.infodif.icard.app.attendance;

import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;

public class AttendanceSpecifications {
    
    private static final Set<String> ALLOWED_FIELDS = Set.of(
            "loginTime", "logoutTime", "workedMinutes", "status", "lateArrival", "earlyLeave", "hasOvertime"
    );

    private static final Set<String> DATE_FIELDS = Set.of("loginTime", "logoutTime");

    private static final String HAS_OVERTIME_FIELD = "hasOvertime";

    private static final ZoneId ZONE = ZoneId.systemDefault();

    public static Specification<Attendance> forUser(String email) {
        return (root, query, cb) -> cb.equal(root.get("user").get("email"), email);
    }

    public static Specification<Attendance> forDepartment(String departmentId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("department").get("id"), departmentId);
    }

    public static Specification<Attendance> withFilter(
            String field, AttendanceFilterOperator operator, List<String> values
    ) {
        if (field == null || operator == null || values == null || values.isEmpty()) {
            return null;
        }
        if (!ALLOWED_FIELDS.contains(field)) {
            throw new IllegalArgumentException("Geçersiz filtre alanı: " + field);
        }

        if (HAS_OVERTIME_FIELD.equals(field)) {
            return hasOvertimeSpecification(Boolean.parseBoolean(values.get(0)));
        }

        boolean isDateField = DATE_FIELDS.contains(field);

        return switch (operator) {

            case EQ -> isDateField
                    ? dayRangeSpecification(field, values.get(0), values.get(0))
                    : (root, query, cb) -> cb.equal(root.get(field), parseValue(field, values.get(0)));

            case IN -> (root, query, cb) ->
                    root.get(field).in(values.stream().map(v -> parseValue(field, v)).toList());

            case BETWEEN -> (root, query, cb) -> {
                @SuppressWarnings({"unchecked", "rawtypes"})
                Comparable min = (Comparable) parseValue(field, values.get(0));
                @SuppressWarnings({"unchecked", "rawtypes"})
                Comparable max = (Comparable) parseValue(field, values.get(1));
                return cb.between(root.get(field), min, max);
            };

            case DATE_BETWEEN -> dayRangeSpecification(field, values.get(0), values.get(1));
        };
    }

    private static Specification<Attendance> hasOvertimeSpecification(boolean wantsOvertime) {
        return (root, query, cb) -> wantsOvertime
                ? cb.greaterThan(root.get("overtimeMinutes"), 0L)
                : cb.or(
                cb.isNull(root.get("overtimeMinutes")),
                cb.lessThanOrEqualTo(root.get("overtimeMinutes"), 0L)
        );
    }

    private static Specification<Attendance> dayRangeSpecification(
            String field, String startDateStr, String endDateStr
    ) {
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);

        Instant rangeStart = startDate.atStartOfDay(ZONE).toInstant();
        Instant rangeEnd = endDate.plusDays(1).atStartOfDay(ZONE).toInstant();

        return (root, query, cb) -> cb.and(
                cb.greaterThanOrEqualTo(root.get(field), rangeStart),
                cb.lessThan(root.get(field), rangeEnd)
        );
    }

    private static Object parseValue(String field, String raw) {
        return switch (field) {
            case "workedMinutes" -> Long.parseLong(raw);
            case "status", "lateArrival", "earlyLeave" -> Boolean.parseBoolean(raw);
            case "loginTime", "logoutTime" -> Instant.parse(raw);
            default -> raw;
        };
    }
}