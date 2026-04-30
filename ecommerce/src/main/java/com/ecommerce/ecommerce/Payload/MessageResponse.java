package com.ecommerce.ecommerce.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic message response DTO used for simple status messages
 * (e.g., successful registration, sign-out confirmation, validation errors).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    /** The human-readable status message. */
    private String message;
}
