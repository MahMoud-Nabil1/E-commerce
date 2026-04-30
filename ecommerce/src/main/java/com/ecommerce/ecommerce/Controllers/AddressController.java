// HTTP endpoints for user address CRUD operations.
package com.ecommerce.ecommerce.Controllers;

import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Payload.AddressDTO;
import com.ecommerce.ecommerce.Services.AddressService;
import com.ecommerce.ecommerce.util.AuthUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AddressController {

    @Autowired
    AuthUtil authUtil;

    @Autowired
    AddressService addressService;

    /**
     * What it does: Creates a new address linked to the currently logged-in user.
     * What it expects: An AddressDTO object in the JSON body containing address details.
     * What it returns: The saved AddressDTO including its newly generated ID, with 201 Created.
     */
    @PostMapping("/addresses")
    public ResponseEntity<AddressDTO> createAddress(@Valid @RequestBody AddressDTO addressDTO){
        User user = authUtil.loggedInUser();
        AddressDTO savedAddressDTO = addressService.createAddress(addressDTO, user);
        return new ResponseEntity<>(savedAddressDTO, HttpStatus.CREATED);
    }

    /**
     * What it does: Lists all addresses in the entire system.
     * What it expects: No parameters.
     * What it returns: A List of AddressDTO objects with 200 OK.
     */
    @GetMapping("/addresses")
    public ResponseEntity<List<AddressDTO>> getAddresses(){
        List<AddressDTO> addressList = addressService.getAddresses();
        return new ResponseEntity<>(addressList, HttpStatus.OK);
    }

    /**
     * What it does: Retrieves a single address by its unique ID.
     * What it expects: The addressId as a URL path variable.
     * What it returns: A single AddressDTO object with 200 OK.
     */
    @GetMapping("/addresses/{addressId}")
    public ResponseEntity<AddressDTO> getAddressById(@PathVariable Long addressId){
        AddressDTO addressDTO = addressService.getAddressesById(addressId);
        return new ResponseEntity<>(addressDTO, HttpStatus.OK);
    }

    /**
     * What it does: Lists all addresses that belong only to the currently logged-in user.
     * What it expects: Authentication context (cookie/token), no distinct body or path vars.
     * What it returns: A List of AddressDTO objects for the user with 200 OK.
     */
    @GetMapping("/users/addresses")
    public ResponseEntity<List<AddressDTO>> getUserAddresses(){
        User user = authUtil.loggedInUser();
        List<AddressDTO> addressList = addressService.getUserAddresses(user);
        return new ResponseEntity<>(addressList, HttpStatus.OK);
    }

    /**
     * What it does: Updates an existing address identified by ID.
     * What it expects: The addressId in the URL path, and an AddressDTO in the JSON body with updated details.
     * What it returns: The updated AddressDTO object with 200 OK.
     */
    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<AddressDTO> updateAddress(@PathVariable Long addressId
            , @RequestBody AddressDTO addressDTO){
        AddressDTO updatedAddress = addressService.updateAddress(addressId, addressDTO);
        return new ResponseEntity<>(updatedAddress, HttpStatus.OK);
    }

    /**
     * What it does: Deletes an address by its ID.
     * What it expects: The addressId in the URL path.
     * What it returns: A plain text string confirming deletion ("Address deleted successfully") with 200 OK.
     */
    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<String> updateAddress(@PathVariable Long addressId){
        String status = addressService.deleteAddress(addressId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}
