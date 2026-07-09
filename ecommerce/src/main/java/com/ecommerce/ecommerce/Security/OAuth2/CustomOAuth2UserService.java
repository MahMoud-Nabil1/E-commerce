// Bridges Spring Security's OAuth2 login flow with the application's User model.
//
// Called automatically by Spring Security after the provider redirects back with
// an authorization code. At that point the access token has already been exchanged
// and the provider's user-info endpoint has been called — this service receives the
// resulting attributes and must return a UserDetails-compatible principal.
//
// Strategy:
//   1. Look up the user by (provider, providerId) — the most reliable match.
//   2. If not found, look up by email — handles the case where the user previously
//      registered locally with the same email.
//   3. If still not found, create a brand-new OAuth2 user.
//   4. Wrap the resolved User in a UserDetailsImpl so the rest of the security
//      infrastructure (JWT filter, @AuthenticationPrincipal, etc.) works unchanged.
package com.ecommerce.ecommerce.Security.OAuth2;

import com.ecommerce.ecommerce.Models.AppRole;
import com.ecommerce.ecommerce.Models.Role;
import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Repositories.RoleRepository;
import com.ecommerce.ecommerce.Repositories.UserRepository;
import com.ecommerce.ecommerce.Security.Services.UserDetailsImpl;
import com.ecommerce.ecommerce.exceptions.APIException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    /**
     * Entry point called by Spring Security after a successful OAuth2 token exchange.
     *
     * <p>Delegates to the parent to fetch user attributes from the provider's
     * user-info endpoint, then processes them into a local {@link User} record.</p>
     */
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Let the default implementation fetch attributes from the provider's user-info endpoint.
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                registrationId, oAuth2User.getAttributes());

        User user = resolveUser(registrationId, userInfo);

        // Wrap in UserDetailsImpl so the rest of the app sees a consistent principal type.
        return UserDetailsImpl.build(user);
    }

    /**
     * Finds or creates the local {@link User} record for the OAuth2 principal.
     *
     * <p>Resolution order:
     * <ol>
     *   <li>Match by (provider, providerId) — exact, stable match.</li>
     *   <li>Match by email — links an existing local account to the OAuth2 provider.</li>
     *   <li>Create a new user if neither match is found.</li>
     * </ol>
     */
    private User resolveUser(String provider, OAuth2UserInfo userInfo) {
        // 1. Try to find by provider + providerId (most reliable).
        Optional<User> byProvider = userRepository.findByProviderAndProviderId(
                provider, userInfo.getId());
        if (byProvider.isPresent()) {
            return byProvider.get();
        }

        // 2. Try to find by email — link existing local account to this OAuth2 provider.
        String email = resolveEmail(provider, userInfo);
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            User existing = byEmail.get();
            // Link the OAuth2 provider to the existing account so future logins
            // use path 1 (faster and avoids email-change edge cases).
            existing.setProvider(provider);
            existing.setProviderId(userInfo.getId());
            existing.setEnabled(true); // OAuth2 login proves email ownership; auto-enable the account
            return userRepository.save(existing);
        }

        // 3. No existing account — create a new OAuth2 user.
        return createOAuth2User(provider, userInfo, email);
    }

    /**
     * Creates and persists a new {@link User} from OAuth2 provider data.
     * New OAuth2 users are assigned {@code ROLE_USER} by default.
     */
    private User createOAuth2User(String provider, OAuth2UserInfo userInfo, String email) {
        Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                .orElseThrow(() -> new APIException("Default role ROLE_USER not found in database."));

        // Derive a unique username from the provider name + a short UUID suffix
        // to avoid collisions with existing local usernames.
        String baseUsername = sanitizeUsername(userInfo.getName());
        String username = ensureUniqueUsername(baseUsername);

        User newUser = new User(username, email, provider, userInfo.getId());
        newUser.setRoles(Set.of(userRole));

        return userRepository.save(newUser);
    }

    /**
     * Resolves the email to use for this OAuth2 user.
     *
     * <p>GitHub users can hide their email — in that case we generate a
     * deterministic placeholder so the {@code NOT NULL} constraint is satisfied.</p>
     */
    private String resolveEmail(String provider, OAuth2UserInfo userInfo) {
        String email = userInfo.getEmail();
        if (email != null && !email.isBlank()) {
            return email;
        }
        // Placeholder for providers that don't expose email (e.g. private GitHub accounts).
        // Format: <providerId>@<provider>.oauth2.noemail
        return userInfo.getId() + "@" + provider + ".oauth2.noemail";
    }

    /**
     * Strips characters that are invalid in a username and trims to 40 chars.
     * Falls back to "user" if the result is empty.
     */
    private String sanitizeUsername(String name) {
        if (name == null || name.isBlank()) return "user";
        // Keep only alphanumeric and underscores; replace spaces with underscores.
        String sanitized = name.replaceAll("[^a-zA-Z0-9_]", "_")
                               .replaceAll("_+", "_")
                               .replaceAll("^_|_$", "");
        sanitized = sanitized.length() > 40 ? sanitized.substring(0, 40) : sanitized;
        return sanitized.isBlank() ? "user" : sanitized;
    }

    /**
     * Appends a short random suffix until the username is unique in the database.
     * In practice this loop runs at most once or twice.
     */
    private String ensureUniqueUsername(String base) {
        String candidate = base;
        while (userRepository.existsByUsername(candidate)) {
            // 6-char suffix is enough to make collisions astronomically unlikely.
            candidate = base + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        }
        return candidate;
    }
}
