package ru.spart.password_keeper_web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import ru.spart.password_keeper_web.configuration.Principal;
import ru.spart.password_keeper_web.configuration.yaml.YamlConfig;
import ru.spart.password_keeper_web.model.Secret;

import java.util.List;

@Service
public class SecretService {

//    static final String URL_SEPARATOR = "/";

    private YamlConfig yamlConfig;

    private RestTemplate restTemplate;

    private String remoteServerUrl = null;



    @Autowired
    public SecretService(RestTemplateBuilder restTemplateBuilder, YamlConfig yamlConfig) {
        this.restTemplate = restTemplateBuilder.build();
        this.yamlConfig = yamlConfig;
        remoteServerUrl = yamlConfig.getRemoteserver()+"secrets";
    }

    @Transactional
    public List<Secret> getAllSecrets() {

        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);
        HttpEntity<String> request = new HttpEntity<>(null, headers);

        ResponseEntity<List<Secret>> resp = restTemplate.exchange(remoteServerUrl, HttpMethod.GET, request,
                new ParameterizedTypeReference<List<Secret>>() {
                });
        return resp.getStatusCode() == HttpStatus.OK ? resp.getBody() : null;
    }

    @Transactional
    public HttpStatus addSecret(Secret secret){
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<Secret> request = new HttpEntity<>(secret, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl, HttpMethod.POST, request, Void.class);

        return responseEntity.getStatusCode();
    }

    @Transactional
    public HttpStatus deleteListSecret(List<Long> idList){
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<List<Long>> request = new HttpEntity<>(idList, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+"/delete", HttpMethod.POST, request, Void.class);

        return responseEntity.getStatusCode();
    }


    @Transactional
    public HttpStatus updateSecret(Secret secret){
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<Secret> request = new HttpEntity<>(secret, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+"/"+secret.getId(), HttpMethod.PUT, request, Void.class);

        return responseEntity.getStatusCode();
    }
}
