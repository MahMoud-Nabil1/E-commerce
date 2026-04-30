// DTO: standardized API feedback with message and success flag.
package com.ecommerce.ecommerce.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class APIResponse {
    public String message;
    private boolean status;
}
