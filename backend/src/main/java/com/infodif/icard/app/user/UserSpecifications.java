package com.infodif.icard.app.user;

import com.infodif.icard.app.attendance.AttendanceFilterOperator;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;

public class UserSpecifications {

    private static final Set<String> ALLOWED_FIELDS = Set.of(
            "role", "active", "createdDate", "email", "firstName", "lastName"
    );

    private static final Set<String> DATE_FIELDS = Set.of("createdDate");

    private static final ZoneId ZONE = ZoneId.systemDefault();

    public static Specification<AppUser> withFilter(
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

    private static Specification<AppUser> dayRangeSpecification(
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
            case "active" -> Boolean.parseBoolean(raw);
            case "createdDate" -> Instant.parse(raw);
            case "role" -> Role.valueOf(raw);
            default -> raw;
        };
    }


    public static Specification<AppUser> defaultOrder() {
        return (root, query, cb) -> {

            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                var rolePriority = cb.<Integer>selectCase()
                        .when(cb.equal(root.get("role"), Role.ROLE_ADMIN), 0)
                        .when(cb.equal(root.get("role"), Role.ROLE_MANAGER), 1)
                        .otherwise(2);

                query.orderBy(
                        cb.asc(root.get("active")),
                        cb.asc(rolePriority),
                        cb.asc(cb.lower(root.get("firstName")))
                );
            }

            return cb.conjunction();
        };
    }

    public static Specification<AppUser> belongsToDepartment(String departmentId) {
        return (root, query, cb) -> cb.equal(root.get("department").get("id"), departmentId);
    }
}