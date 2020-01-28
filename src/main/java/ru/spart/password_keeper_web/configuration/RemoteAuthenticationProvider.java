package ru.spart.password_keeper_web.configuration;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import ru.spart.password_keeper_web.configuration.yaml.YamlConfig;

import java.util.ArrayList;

public class RemoteAuthenticationProvider implements AuthenticationProvider {

    private final RestTemplateBuilder restTemplateBuilder;

    private final YamlConfig yamlConfig;

    private String remoteServerUrl = null;
    private String loginURl = null;


    public RemoteAuthenticationProvider(RestTemplateBuilder restTemplateBuilder, YamlConfig yamlConfig) {

        this.restTemplateBuilder = restTemplateBuilder;
        this.yamlConfig = yamlConfig;

        remoteServerUrl = yamlConfig.getRemoteserver();
        loginURl = remoteServerUrl+"login";
    }

    @Override
    public Authentication authenticate(Authentication authentication)
            throws AuthenticationException {

        String login = authentication.getName();
        String password = authentication.getCredentials().toString();
        RestTemplate restTemplate = restTemplateBuilder.basicAuthentication(login, password).build();

        try {
            ResponseEntity<Void> response = restTemplate.exchange(loginURl, HttpMethod.POST, null, Void.class);
            String sessionId = response.getHeaders().get("Set-Cookie").get(0).split(";")[0];

            return new UsernamePasswordAuthenticationToken(new Principal(login, sessionId), null, new ArrayList<>());
        } catch (HttpClientErrorException.Unauthorized unauthorized) {

            return null;
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}

