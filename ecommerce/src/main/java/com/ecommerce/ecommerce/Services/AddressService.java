// Contract for address CRUD linked to user accounts.
package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Payload.AddressDTO;

import java.util.List;

public interface AddressService {
    AddressDTO createAddress(AddressDTO addressDTO, User user);

    List<AddressDTO> getAddresses();

    AddressDTO getAddressesById(Long addressId);

    List<AddressDTO> getUserAddresses(User user);

    AddressDTO updateAddress(Long addressId, AddressDTO addressDTO);

    String deleteAddress(Long addressId);
}
