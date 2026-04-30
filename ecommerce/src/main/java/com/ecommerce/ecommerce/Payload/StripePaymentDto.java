// DTO: frontend sends this to create a Stripe PaymentIntent.
package com.ecommerce.ecommerce.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StripePaymentDto {
    private Long amount;
    private String email;
    private String name;
    private String currency;
    private String description;
    private Address address;

    // Nested class so address travels with the payment request.
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String street;
        private String city;
        private String state;
        private String pincode;
        private String country;
    }
}