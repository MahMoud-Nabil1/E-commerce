// Extracts user info from GitHub's OAuth2 user attributes.
// GitHub attribute keys: "id" (integer), "login" (username), "email".
// Note: GitHub email can be null if the user has set their email to private.
package com.ecommerce.ecommerce.Security.OAuth2;

import java.util.Map;

public class GithubOAuth2UserInfo extends OAuth2UserInfo {

    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    // GitHub returns "id" as an Integer — convert to String for uniform handling.
    @Override
    public String getId() {
        return String.valueOf(attributes.get("id"));
    }

    // GitHub uses "login" as the username (e.g. "torvalds").
    @Override
    public String getName() {
        return (String) attributes.get("login");
    }

    // GitHub email may be null if the user has set their email to private in GitHub settings.
    // The CustomOAuth2UserService handles this case by generating a placeholder email.
    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }
}
