package com.infodif.icard.app.user;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    @GetMapping("/users")
    public List<AppUser> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/user")
    public AppUser getUser(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUsers(email);
    }

}