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
import ru.spart.password_keeper_web.model.Note;
import ru.spart.password_keeper_web.model.Secret;
import ru.spart.password_keeper_web.ui.views.menu.Menu;

import java.util.ArrayList;
import java.util.List;

@Service
public class NoteService {

    private RestTemplate restTemplate;

    private String remoteServerUrl = null;

    @Autowired
    public NoteService(RestTemplateBuilder restTemplateBuilder, YamlConfig yamlConfig) {
        this.restTemplate = restTemplateBuilder.build();
        remoteServerUrl = yamlConfig.getRemoteserver()+"notes";
    }

    @Transactional
    public List<Note> getAllNotes() {

        Principal principal = Menu.principal;
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);
        HttpEntity<String> request = new HttpEntity<>(null, headers);

        ResponseEntity<List<Note>> response = restTemplate.exchange(remoteServerUrl, HttpMethod.GET, request,
                new ParameterizedTypeReference<List<Note>>() {
                });
        List<Note> decryptedSecrets = decryptNotes(response.getBody());
        return response.getStatusCode() == HttpStatus.OK ? decryptedSecrets : null;
    }

    @Transactional
    public void addNote(Note note) throws Exception {
        Principal principal = Menu.principal;
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        Note encryptedNote = encryptNote(note);

        HttpEntity<Note> request = new HttpEntity<>(encryptedNote, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl, HttpMethod.POST, request, Void.class);

        responseEntity.getStatusCode();
    }

    @Transactional
    public void deleteListNotes(List<Long> idList){
        Principal principal = Menu.principal;
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<List<Long>> request = new HttpEntity<>(idList, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+"/delete", HttpMethod.POST, request, Void.class);

        responseEntity.getStatusCode();
    }


    @Transactional
    public void updateNote(Note note) throws Exception {
        Principal principal = Menu.principal;
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        Note encryptNote = encryptNote(note);

        HttpEntity<Note> request = new HttpEntity<>(encryptNote, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+"/"+note.getId(), HttpMethod.PUT, request, Void.class);

        responseEntity.getStatusCode();
    }

    private List<Note> decryptNotes(List<Note> noteList){
        List<Note> decryptedNotes = new ArrayList<>();

        for(Note note : noteList){
            Note decryptedNote = new Note();
            decryptedNote.setId(note.getId());

            decryptedNote.setNote(CryptText.decryptString(note.getNote()));

            decryptedNotes.add(decryptedNote);
        }
        return decryptedNotes;
    }

    private Note encryptNote(Note note) throws Exception {
        Note encryptedNote = new Note();

        encryptedNote.setId(note.getId());
        encryptedNote.setNote(CryptText.encryptString(note.getNote()));

        return encryptedNote;
    }
}
