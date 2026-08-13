package com.infodif.icard.app.user;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@Slf4j
@Transactional(rollbackOn = Exception.class)
@RequiredArgsConstructor

public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public AppUser getUsers(String email) {
        return userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Not found."));
    }

    public List<AppUser> getAllUsers() {
        return userRepo.findAll();
    }


    public AppUser register(AppUser user) {
        userRepo.findByEmail(user.getEmail()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        });
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedDate(Instant.now());
        return userRepo.save(user);
    }

    public AppUser login(String email, String password) {
        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (!user.getActive())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You are not allowed to login");


        return user;
    }

}
