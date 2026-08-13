package com.infodif.icard.app.auth;

import com.infodif.icard.app.user.Role;

public record LoginResponse(String token, String email, String firstName, String lastName, Role role) {
}