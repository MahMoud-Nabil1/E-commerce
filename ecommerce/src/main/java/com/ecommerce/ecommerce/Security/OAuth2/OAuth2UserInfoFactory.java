// Factory that returns the correct OAuth2UserInfo subclass based on the provider name.
// Add a new case here whenever a new provider is integrated.
package com.ecommerce.ecommerce.Security.OAuth2;

import com.ecommerce.ecommerce.exceptions.APIException;

import java.util.Map;

public class OAuth2UserInfoFactory {

    private OAuth2UserInfoFactory() {
        // Utility class — no instances.
    }

    /**
     * Returns the provider-specific {@link OAuth2UserInfo} wrapper.
     *
     * @param registrationId the Spring Security registration ID (e.g. "google", "github")
     * @param attributes     the raw attribute map from the OAuth2 provider
     * @return the appropriate {@link OAuth2UserInfo} subclass
     * @throws APIException if the provider is not supported
     */
    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        return switch (registrationId.toLowerCase()) {
            case "google" -> new GoogleOAuth2UserInfo(attributes);
            case "github" -> new GithubOAuth2UserInfo(attributes);
            default -> throw new APIException("Login with " + registrationId + " is not supported.");
        };
    }
}
