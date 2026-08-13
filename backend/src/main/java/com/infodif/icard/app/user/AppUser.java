package com.infodif.icard.app.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.infodif.icard.app.attendance.Attendance;
import com.infodif.icard.app.department.Department;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)

public class AppUser {
    @Id
    @UuidGenerator
    @Column(name= "id",unique = true)
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Instant createdDate;
    //List<Attendance> attendances
    //List<QrCode> qrCodes

    @Enumerated(EnumType.STRING)
    private Role role;
    @ManyToOne
    private AppUser manager;
    @ManyToOne
    private Department department;
    private Boolean active;
}
