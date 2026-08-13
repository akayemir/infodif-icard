package com.infodif.icard.app.attendance;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.infodif.icard.app.user.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
@Entity
@Table(name = "attendances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)

public class Attendance {
    @Id
    @UuidGenerator
    @Column(name= "id",unique = true)
    private String id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;
    private Instant loginTime;
    private Instant logoutTime;
    private Long workedMinutes;
    private BigDecimal workedHours;
    private boolean status;

    private Boolean lateArrival;
    private Boolean earlyLeave;
    private Long overtimeMinutes;
}
