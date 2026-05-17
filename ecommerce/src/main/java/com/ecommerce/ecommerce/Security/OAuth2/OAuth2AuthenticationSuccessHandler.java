// Called by Spring Security after a successful OAuth2 login.
// Generates a JWT cookie (reusing the existing JwtUtils) and redirects
// the browser to the frontend with the cookie already set.
package com.ecommerce.ecommerce.Security.OAuth2;

import com.ecommerce.ecommerce.Security.Jwt.JwtUtils;
import com.ecommerce.ecommerce.Security.Services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;

    // The frontend URL to redirect to after a successful OAuth2 login.
    // Configured in application.properties as app.oauth2.redirect-uri
    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/callback}")
    private String redirectUri;

    /**
     * Generates a JWT cookie and redirects the browser to the frontend callback URL.
     *
     * <p>The JWT is delivered via an HttpOnly cookie (same mechanism as the regular
     * login endpoint), so the frontend does not need to handle the token directly —
     * it just needs to redirect the user to the appropriate page after the callback.</p>
     *
     * <p>A {@code success=true} query parameter is appended so the frontend can
     * distinguish a successful OAuth2 callback from a direct navigation.</p>
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Reuse the same JWT cookie generation as the regular login flow.
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);
        response.addHeader("Set-Cookie", jwtCookie.toString());

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("success", "true")
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
