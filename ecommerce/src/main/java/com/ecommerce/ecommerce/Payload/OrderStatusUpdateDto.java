// DTO: carries new status value for order update endpoints.
package com.ecommerce.ecommerce.Payload;

import lombok.Data;

@Data
public class OrderStatusUpdateDto {
    private String status;
}
