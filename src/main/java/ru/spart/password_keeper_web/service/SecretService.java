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
import ru.spart.password_keeper_web.cryptography.CryptText;
import ru.spart.password_keeper_web.model.Secret;

import java.util.ArrayList;
import java.util.List;

@Service
public class SecretService {

    private RestTemplate restTemplate;

    private String remoteServerUrl = null;

    @Autowired
    public SecretService(RestTemplateBuilder restTemplateBuilder, YamlConfig yamlConfig) {
        this.restTemplate = restTemplateBuilder.build();
        remoteServerUrl = yamlConfig.getRemoteserver()+"secrets";
    }

    @Transactional
    public List<Secret> getAllSecrets() {

        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);
        HttpEntity<String> request = new HttpEntity<>(null, headers);

        ResponseEntity<List<Secret>> response = restTemplate.exchange(remoteServerUrl, HttpMethod.GET, request,
                new ParameterizedTypeReference<List<Secret>>() {
                });
        List<Secret> decryptedSecrets = decryptSecrets(response.getBody());
        return response.getStatusCode() == HttpStatus.OK ? decryptedSecrets : null;
    }

    @Transactional
    public void addSecret(Secret secret) throws Exception {
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        Secret encryptedSecret = encryptSecret(secret);

        HttpEntity<Secret> request = new HttpEntity<>(encryptedSecret, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl, HttpMethod.POST, request, Void.class);

        responseEntity.getStatusCode();
    }

    @Transactional
    public void deleteListSecret(List<Long> idList){
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<List<Long>> request = new HttpEntity<>(idList, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+"/delete", HttpMethod.POST, request, Void.class);

        responseEntity.getStatusCode();
    }


    @Transactional
    public void updateSecret(Secret secret) throws Exception {
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        Secret encryptSecret = encryptSecret(secret);

        HttpEntity<Secret> request = new HttpEntity<>(encryptSecret, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+"/"+secret.getId(), HttpMethod.PUT, request, Void.class);

        responseEntity.getStatusCode();
    }

    private List<Secret> decryptSecrets(List<Secret> secretList){
        List<Secret> decryptedSecrets = new ArrayList<>();

        for(Secret secret : secretList){
            Secret decryptedSecret = new Secret();
            decryptedSecret.setId(secret.getId());

            decryptedSecret.setDescription(CryptText.decryptString(secret.getDescription()));
            decryptedSecret.setLogin(CryptText.decryptString(secret.getLogin()));
            decryptedSecret.setPassword(CryptText.decryptString(secret.getPassword()));
            decryptedSecrets.add(decryptedSecret);
        }
        return decryptedSecrets;
    }

    private Secret encryptSecret(Secret secret) throws Exception {
        Secret encryptedSecret = new Secret();

        encryptedSecret.setId(secret.getId());
        encryptedSecret.setDescription(CryptText.encryptString(secret.getDescription()));
        encryptedSecret.setLogin(CryptText.encryptString(secret.getLogin()));
        encryptedSecret.setPassword(CryptText.encryptString(secret.getPassword()));

        return encryptedSecret;
    }
}
