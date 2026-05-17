// Abstract wrapper around the raw attribute map returned by an OAuth2 provider.
// Each provider returns different field names for the same concepts (id, name, email),
// so this abstraction normalises them into a single interface.
package com.ecommerce.ecommerce.Security.OAuth2;

import java.util.Map;

public abstract class OAuth2UserInfo {

    protected final Map<String, Object> attributes;

    protected OAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    /** The provider-specific unique identifier for this user (never changes). */
    public abstract String getId();

    /** The user's display name as returned by the provider. */
    public abstract String getName();

    /** The user's primary email address. */
    public abstract String getEmail();

    /** Raw attribute map — useful for debugging or accessing provider-specific fields. */
    public Map<String, Object> getAttributes() {
        return attributes;
    }
}
