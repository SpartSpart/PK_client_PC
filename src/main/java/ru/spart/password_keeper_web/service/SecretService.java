package ru.spart.password_keeper_web.service;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import ru.spart.password_keeper_web.model.Secret;

import java.util.List;

@Service
public class SecretService {

    static final String EMP_URL_PREFIX = "http://localhost:8080/secrets";
    static final String URL_SEP = "/";

    private RestTemplate restTemplate;

    public SecretService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    @Transactional
    public List<Secret> getAllSecrets() {
        String sessionId = (String) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);
        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<List<Secret>> resp = restTemplate.exchange(EMP_URL_PREFIX, HttpMethod.GET,request,
                new ParameterizedTypeReference<List<Secret>>(){});
        return resp.getStatusCode() == HttpStatus.OK ? resp.getBody() : null;
    }
}
