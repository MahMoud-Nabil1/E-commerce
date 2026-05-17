// Extracts user info from Google's OpenID Connect token attributes.
// Google attribute keys: "sub" (unique id), "name", "email".
package com.ecommerce.ecommerce.Security.OAuth2;

import java.util.Map;

public class GoogleOAuth2UserInfo extends OAuth2UserInfo {

    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    // Google uses "sub" as the stable unique identifier (never changes, even if email changes).
    @Override
    public String getId() {
        return (String) attributes.get("sub");
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }
}
