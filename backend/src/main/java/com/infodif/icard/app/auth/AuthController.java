package com.infodif.icard.app.auth;

import com.infodif.icard.app.user.AdminUserResponse;
import com.infodif.icard.app.user.AppUser;
import com.infodif.icard.app.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final com.infodif.icard.app.auth.JwtService jwtService;

    @PostMapping("/register")
    public AdminUserResponse register(@RequestBody AppUser user) {
        return AdminUserResponse.from(userService.register(user));
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        AppUser user = userService.login(request.email(), request.password());
        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole());
    }
}