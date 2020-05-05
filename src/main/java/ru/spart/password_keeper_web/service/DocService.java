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
import ru.spart.password_keeper_web.model.Doc;
import ru.spart.password_keeper_web.ui.views.menu.Menu;

import java.util.List;

@Service
public class DocService {

    private RestTemplate restTemplate;

    private String remoteServerUrl = null;

    @Autowired
    public DocService(RestTemplateBuilder restTemplateBuilder, YamlConfig yamlConfig) {
        this.restTemplate = restTemplateBuilder.build();
        remoteServerUrl = yamlConfig.getRemoteserver() + "docs";
    }

    @Transactional
    public List<Doc> getAllDocs() {

        Principal principal = Menu.principal;
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);
        HttpEntity<String> request = new HttpEntity<>(null, headers);

        ResponseEntity<List<Doc>> resp = restTemplate.exchange(remoteServerUrl, HttpMethod.GET, request,
                new ParameterizedTypeReference<List<Doc>>() {
                });
        return resp.getStatusCode() == HttpStatus.OK ? resp.getBody() : null;
    }

    @Transactional
    public void addDoc(Doc doc) throws Exception{
        Principal principal = Menu.principal;
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<Doc> request = new HttpEntity<>(doc, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl, HttpMethod.POST, request, Void.class);

        responseEntity.getStatusCode();
    }

    @Transactional
    public void updateDoc(Doc doc) throws Exception {
        Principal principal = Menu.principal;
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<Doc> request = new HttpEntity<>(doc, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+"/"+doc.getId(), HttpMethod.PUT, request, Void.class);

        responseEntity.getStatusCode();
    }

    @Transactional
    public void deleteListDocs(List<Long> idList){
        Principal principal = Menu.principal;
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<List<Long>> request = new HttpEntity<>(idList, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+"/delete", HttpMethod.POST, request, Void.class);

        responseEntity.getStatusCode();
    }

}

