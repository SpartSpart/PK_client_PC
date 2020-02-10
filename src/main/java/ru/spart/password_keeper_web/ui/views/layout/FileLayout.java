package ru.spart.password_keeper_web.ui.views.layout;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.upload.Upload;
import com.vaadin.flow.component.upload.receivers.MemoryBuffer;
import com.vaadin.flow.component.upload.receivers.MultiFileMemoryBuffer;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import ru.spart.password_keeper_web.model.Doc;
import ru.spart.password_keeper_web.model.FileModel;
import ru.spart.password_keeper_web.service.FileService;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;


public class FileLayout extends VerticalLayout {
    private FileService fileService;

    private Grid<FileModel> fileGrid = new Grid<>(FileModel.class);
    private Button addFileBtn = new Button("Add File");
    private Button getFileNames = new Button("Get Names", this::getAllFileNames);
    private Button saveFilesBtn = new Button("Save Files");

    private MultiFileMemoryBuffer memoryBuffer = new MultiFileMemoryBuffer();
    private Upload uploadBtn = new Upload(memoryBuffer);

    private Doc doc = null;

    @Autowired
    public FileLayout(FileService fileService) {
        this.fileService = fileService;
        setWidth("30%");
        getStyle().set("padding-top", "0px");

        add(fileGrid);
        add(addFileBtn);
        add(getFileNames);
//        add(saveFilesBtn);
        add(uploadBtn);

        saveFilesBtn.addClickListener(event -> {
            try {
                saveFiles(event);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });


        addFileBtn.addClickListener(event -> {
            try {
                addFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        });

    }



    public FileLayout() {

    }

    private void addFile() throws IOException {
        List<String> unUploadedFiles;

            if (isDoc() && memoryBuffer.getFiles().size() > 0) {
                Map<String,InputStream> fileMap = new HashMap<>();

                Set<String> fileNames = memoryBuffer.getFiles();

                for (String name : fileNames) {
                    InputStream inputStream = memoryBuffer.getInputStream(name);
                    fileMap.put(name,inputStream);
                }
                unUploadedFiles = fileService.prepareFilesForSendingToServer(fileMap,doc);
                if (unUploadedFiles.size()>0){
                    sendNotification("Files were not upload: \n"+unUploadedFiles.toString());
                }
                else
                    sendNotification("All files uploaded successfully");
            }
        }


    private List<String> getAllFileNames(ClickEvent event) {
        if (isDoc()) {
            List<String> fileNames = fileService.getAllFileNames(doc);
            for (String name : fileNames)
                sendNotification(name);
            return fileNames;
        } else
            return null;
    }

    private void saveFiles(ClickEvent event) throws IOException {
        if (isDoc()) {
            File file = new File("C:\\Users\\Pamela\\Documents\\Doc1.doc");
            //String filename = "C:\\Users\\Pamela\\Documents\\Doc1.doc";
            byte[] array = Files.readAllBytes(file.toPath());

            List<File> files = fileService.getAllFiles(doc);
            File ret = File.createTempFile("download", "tmp");
            int i = 0;
        }

    }

    private boolean isDoc() {
        if (doc == null)
            return false;
        else
            return true;
    }

    public void setDoc(Doc doc) {
        this.doc = doc;
    }

    private void sendNotification(String message) {
        Notification notification = new Notification();
        notification.setPosition(Notification.Position.MIDDLE);
        notification.show(message);
    }
}
