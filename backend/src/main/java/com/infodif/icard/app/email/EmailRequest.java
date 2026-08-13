package com.infodif.icard.app.email;

public record EmailRequest(String subject, String body, String image) {
}