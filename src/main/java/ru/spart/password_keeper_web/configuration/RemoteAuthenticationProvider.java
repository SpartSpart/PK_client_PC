package ru.spart.password_keeper_web.configuration;

import org.apache.tomcat.util.http.parser.Cookie;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;

public class RemoteAuthenticationProvider implements AuthenticationProvider {

    private final RestTemplateBuilder restTemplateBuilder;

    public RemoteAuthenticationProvider(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplateBuilder = restTemplateBuilder;
    }

    @Override
    public Authentication authenticate(Authentication authentication)
            throws AuthenticationException {

        String name = authentication.getName();
        String password = authentication.getCredentials().toString();
        RestTemplate restTemplate = restTemplateBuilder.basicAuthentication(name, password).build();
        try {
            ResponseEntity<Void> response = restTemplate.exchange("http://localhost:58440/api/login", HttpMethod.POST, null, Void.class);
            String sessionId = response.getHeaders().get("Set-Cookie").get(0).split(";")[0];


//            String sessionIdFromContext = (String) SecurityContextHolder.getContext().getAuthentication().getCredentials();
//            String contextDetails = SecurityContextHolder.getContext().getAuthentication().getDetails().toString();
//            String sessionIdFromDetails = contextDetails.split(";")[contextDetails.split(";").length-1];
            HttpHeaders headers = new HttpHeaders();

            headers.add("Cookie", sessionId);
            HttpEntity<String> request = new HttpEntity<>("body", headers);
            restTemplateBuilder.build().exchange("http://localhost:58440/api/secrets", HttpMethod.GET, request, String.class);
            return new UsernamePasswordAuthenticationToken(name, sessionId, new ArrayList<>());
        } catch (HttpClientErrorException.Unauthorized unauthorized) {
            return null;
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}

