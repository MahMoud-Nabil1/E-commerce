// Stripe PaymentIntent creation and customer management.
package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.Payload.StripePaymentDto;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.CustomerSearchResult;
import com.stripe.model.PaymentIntent;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerSearchParams;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.secret.key}")
    private String stripeApiKey;

    // Sets the global Stripe API key once at startup.
    @PostConstruct
    public void init(){
        Stripe.apiKey = stripeApiKey;
    }

    // Creates a PaymentIntent for the frontend to confirm. Side effect: may create Stripe customer.
    @Override
    public PaymentIntent paymentIntent(StripePaymentDto stripePaymentDto) throws StripeException {
        Customer customer;
        // Reuse existing Stripe customer to avoid duplicates.
        CustomerSearchParams searchParams =
                CustomerSearchParams.builder()
                        .setQuery("email:'" + stripePaymentDto.getEmail() + "'")
                        .build();
        CustomerSearchResult customers = Customer.search(searchParams);
        if (customers.getData().isEmpty()) {
            CustomerCreateParams customerParams = CustomerCreateParams.builder()
                    .setEmail(stripePaymentDto.getEmail())
                    .setName(stripePaymentDto.getName())
                    .setAddress(
                            CustomerCreateParams.Address.builder()
                                    .setLine1(stripePaymentDto.getAddress().getStreet())
                                    .setCity(stripePaymentDto.getAddress().getCity())
                                    .setState(stripePaymentDto.getAddress().getState())
                                    .setPostalCode(stripePaymentDto.getAddress().getPincode())
                                    .setCountry(stripePaymentDto.getAddress().getCountry())
                                    .build()
                    )
                    .build();

            customer = Customer.create(customerParams);
        } else {
            customer = customers.getData().get(0);
        }

        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(stripePaymentDto.getAmount())
                        .setCurrency(stripePaymentDto.getCurrency())
                        .setCustomer(customer.getId())
                        .setDescription(stripePaymentDto.getDescription())
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .build();

        return PaymentIntent.create(params);
    }
}
