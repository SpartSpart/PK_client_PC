package ru.spart.password_keeper_web.service;

import com.vaadin.flow.component.upload.receivers.MemoryBuffer;
import com.vaadin.flow.component.upload.receivers.MultiFileMemoryBuffer;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.lang.Nullable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import ru.spart.password_keeper_web.configuration.Principal;
import ru.spart.password_keeper_web.configuration.yaml.YamlConfig;
import ru.spart.password_keeper_web.model.Doc;
import ru.spart.password_keeper_web.model.FileModel;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileAttribute;
import java.util.*;

@Service
public class FileService {
    private YamlConfig yamlConfig;

    private RestTemplate restTemplate;

    private String remoteServerUrl = null;


    @Autowired
    public FileService(RestTemplateBuilder restTemplateBuilder, YamlConfig yamlConfig) {
        this.restTemplate = restTemplateBuilder.build();
        this.yamlConfig = yamlConfig;
        remoteServerUrl = yamlConfig.getRemoteserver() + "files";
    }

    @Transactional
    public List<FileModel> getAllFileInfo(Doc doc) {

        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);
        HttpEntity<Void> request = new HttpEntity<>(null, headers);
        String url = remoteServerUrl + "/info/" + doc.getId();
        ResponseEntity<List<FileModel>> responseEntity = restTemplate.exchange(url, HttpMethod.GET, request,
                new ParameterizedTypeReference<List<FileModel>>() {
                });
        return responseEntity.getStatusCode() == HttpStatus.OK ? responseEntity.getBody() : null;
    }

    @Transactional
    @Nullable
    public String getFile(FileModel fileModel,Doc doc) throws IOException {

        String homeDir = System.getProperty("user.home");
        String downloadDir = homeDir+"\\Downloads\\";

        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM));
        HttpEntity<Void> request = new HttpEntity<>(null, headers);
        String url = remoteServerUrl + "/" + fileModel.getId();
        ResponseEntity<byte[]> responseEntity = restTemplate.exchange(url, HttpMethod.GET, request, byte[].class);

        if (responseEntity.getStatusCode() == HttpStatus.OK) {
            String downloadPath = downloadDir+doc.getDocument();
            createDownloadDirectoryNamedDoc(downloadPath);

            Files.write(Paths.get(downloadPath+"\\"+fileModel.getFileName()), responseEntity.getBody());
            return "Saved: " + downloadPath +"\\"+ fileModel.getFileName();
        }
        else
            return responseEntity.getStatusCode().toString();
    }

    @Transactional
    public List<String> addFiles(List<File> files, Doc doc) throws IOException {

        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        for (File file : files) {
            body.add("files", new FileSystemResource(file));
        }

        HttpEntity<MultiValueMap<String, Object>> requestEntity
                = new HttpEntity<>(body, headers);

        ResponseEntity<List<String>> responseEntity = restTemplate.exchange(remoteServerUrl + "/" + doc.getId(),
                HttpMethod.POST, requestEntity,
                new ParameterizedTypeReference<List<String>>() {
                });

        deleteTempFiles(files);

        return responseEntity.getBody();
    }

    public HttpStatus deleteListFiles(List<Long> idList) {
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String sessionId = principal.getRemoteSessionId();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Cookie", sessionId);

        HttpEntity<List<Long>> request = new HttpEntity<>(idList, headers);

        ResponseEntity <Void> responseEntity = restTemplate.exchange(remoteServerUrl+"/delete", HttpMethod.POST, request, Void.class);

        return responseEntity.getStatusCode();
    }


   public List<String> prepareFilesForSendingToServer(Map<String, InputStream> fileMap, Doc doc) throws IOException {
        List<File> files = new ArrayList<>();

        List<String> unUploadedFiles = new ArrayList<>();

        Path path = Files.createTempFile("temp", ".txt");
        String tempPath = path.getParent().toString();

        new File(path.toString()).delete();

        Set<String> fileNames = fileMap.keySet();

        for (String name : fileNames){
               InputStream inputStream = fileMap.get(name);
               File file = new File (tempPath+"/"+name);
               Files.write(Paths.get(file.getAbsolutePath()), IOUtils.toByteArray(inputStream));
               files.add(file);
        }

        unUploadedFiles = addFiles(files,doc);
         return unUploadedFiles;
   }

   private void deleteTempFiles(List<File> files){
        for (File file : files)
            file.delete();
   }

   private void createDownloadDirectoryNamedDoc(String path){
       File docDirectory = new File(path);
       if (!docDirectory.exists())
           docDirectory.mkdirs();
   }



}
