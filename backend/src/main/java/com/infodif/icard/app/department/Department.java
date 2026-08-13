package com.infodif.icard.app.department;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.infodif.icard.app.attendance.Attendance;
import com.infodif.icard.app.user.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "department")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)

public class Department {
    @Id
    @UuidGenerator
    @Column(name= "id",unique = true)
    private String id;
    private String name;
    @ManyToOne
    private AppUser manager;
    private Instant createdDate;

}
