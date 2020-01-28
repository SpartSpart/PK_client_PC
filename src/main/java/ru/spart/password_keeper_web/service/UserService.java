package ru.spart.password_keeper_web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import ru.spart.password_keeper_web.configuration.Principal;
import ru.spart.password_keeper_web.configuration.yaml.YamlConfig;
import ru.spart.password_keeper_web.model.User;

@Service
public class UserService {

    private YamlConfig yamlConfig;

    private RestTemplate restTemplate;

    private String remoteServerUrl = null;

    @Autowired
    public UserService(RestTemplateBuilder restTemplateBuilder, YamlConfig yamlConfig) {
        this.restTemplate = restTemplateBuilder.build();
        this.yamlConfig = yamlConfig;
        remoteServerUrl = yamlConfig.getRemoteserver()+"user";
    }

    @Transactional
    public HttpStatus addUser(User user){
        String postMappingValue = "/add";

        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<User> request = new HttpEntity<>(user, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+postMappingValue, HttpMethod.POST, request, Void.class);

        return responseEntity.getStatusCode();
    }

}
