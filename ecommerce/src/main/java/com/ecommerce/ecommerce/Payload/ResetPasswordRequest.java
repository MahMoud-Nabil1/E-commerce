package com.ecommerce.ecommerce.Payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "OTP code is required")
    private String otp;

    @NotBlank(message = "New password is required")
    private String newPassword;
}
