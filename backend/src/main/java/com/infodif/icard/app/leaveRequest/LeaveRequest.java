package com.infodif.icard.app.leaveRequest;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.infodif.icard.app.attendance.Attendance;
import com.infodif.icard.app.department.Department;
import com.infodif.icard.app.user.AppUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "leaveRequests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)

public class LeaveRequest {
    @Id
    @UuidGenerator
    @Column(name= "id",unique = true)
    private String id;

    @ManyToOne
    private AppUser user;

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private LeaveType leaveType;

    private String reason;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status;

    @ManyToOne
    private AppUser approvedBy;

    private LocalDateTime createdDate;
    private LocalDateTime decisionDate;


}
