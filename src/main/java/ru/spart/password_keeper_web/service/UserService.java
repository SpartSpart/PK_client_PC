package ru.spart.password_keeper_web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import ru.spart.password_keeper_web.configuration.yaml.YamlConfig;
import ru.spart.password_keeper_web.model.User;

@Service
public class UserService {

    private RestTemplate restTemplate;

    private String remoteServerUrl = null;

    @Autowired
    public UserService(RestTemplateBuilder restTemplateBuilder, YamlConfig yamlConfig) {
        this.restTemplate = restTemplateBuilder.build();
        remoteServerUrl = yamlConfig.getRemoteserver()+"user";
    }

    @Transactional
    public HttpStatus addUser(User user){
        String postMappingUrl = remoteServerUrl+"/add";

        HttpEntity<User> request = new HttpEntity<>(user);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(postMappingUrl, HttpMethod.POST, request, Void.class);

        return responseEntity.getStatusCode();
    }
}
