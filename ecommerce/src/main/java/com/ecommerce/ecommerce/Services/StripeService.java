// Contract for Stripe payment gateway integration.
package com.ecommerce.ecommerce.Services;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.ecommerce.ecommerce.Payload.StripePaymentDto;

public interface StripeService {
    PaymentIntent paymentIntent(StripePaymentDto stripePaymentDto) throws StripeException;
}