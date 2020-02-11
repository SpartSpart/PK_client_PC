package ru.spart.password_keeper_web.ui.views.layout;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.Label;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.page.PendingJavaScriptResult;
import com.vaadin.flow.component.upload.Upload;
import com.vaadin.flow.component.upload.receivers.MultiFileMemoryBuffer;
import com.vaadin.flow.dom.DomEvent;
import com.vaadin.flow.dom.DomEventListener;
import elemental.json.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import ru.spart.password_keeper_web.model.Doc;
import ru.spart.password_keeper_web.model.FileModel;
import ru.spart.password_keeper_web.service.FileService;
import ru.spart.password_keeper_web.ui.views.component.CustomUpload;

import java.io.*;
import java.util.*;


public class FileLayout extends HorizontalLayout {
    private FileService fileService;

    private Grid<FileModel> fileGrid = new Grid<>(FileModel.class);
    private List<FileModel> fileInfoList = new ArrayList<>();
    private Set<FileModel> selectedGridItems = new HashSet<>();

    private Button addFileBtn = new Button("Add Files");
    private Button deleteBtn = new Button("Delete");

    private MultiFileMemoryBuffer memoryBuffer = new MultiFileMemoryBuffer();
    private CustomUpload uploadBtn = new CustomUpload(memoryBuffer);

    private Doc doc = null;

    @Autowired
    public FileLayout(FileService fileService) {
        this.fileService = fileService;
        setWidth("40%");
        getStyle().set("padding-top", "0px");

        add(fileGrid);
        add(createBtnLayout());

        setGridSettings();

        }

    private void setGridSettings() {
        fileGrid.getColumnByKey("id").setVisible(false);
        fileGrid.getColumnByKey("doc_id").setVisible(false);
        fileGrid.getColumnByKey("filePath").setVisible(false);

        fileGrid.setSelectionMode(Grid.SelectionMode.MULTI);

        fileGrid.addSelectionListener(selectEvent -> {

            selectedGridItems = selectEvent.getAllSelectedItems();
            if (selectedGridItems == null || selectedGridItems.size() < 1) {
                deleteBtn.setEnabled(false);
            }
            else
                deleteBtn.setEnabled(true);
        });
    }

    private VerticalLayout createBtnLayout(){
        VerticalLayout btnLayout = new VerticalLayout();
        btnLayout.getStyle().set("padding-top", "0px");
        btnLayout.setWidth("45%");
        btnLayout.setMaxHeight("100%");

        addFileBtn.setWidth("100%");
        addFileBtn.setEnabled(false);
        deleteBtn.setWidth("100%");
        deleteBtn.setEnabled(false);

        btnLayout.add(uploadBtn);
        btnLayout.add(addFileBtn);
        btnLayout.add(deleteBtn);

        deleteBtn.addClickListener(event -> {
            deleteFiles(event);
        });

        addFileBtn.addClickListener(event -> {
            try {
                addFiles();

                memoryBuffer.getFiles().clear();
                uploadBtn.getElement().executeJs("this.files=[]");

                addFileBtn.setEnabled(false);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });

        uploadBtn.addSucceededListener(event -> {
           if (isDoc())
               addFileBtn.setEnabled(true);
        });

        uploadBtn.getElement().addEventListener("file-remove", event -> {
            JsonObject eventData = event.getEventData();
            String removedFile = eventData.getString("event.detail.file.name");
            memoryBuffer.getFiles().remove(removedFile);
            if (memoryBuffer.getFiles().size()<1)
                addFileBtn.setEnabled(false);
        }).addEventData("event.detail.file.name");

        return btnLayout;
    }

    public FileLayout() {

    }

    private void addFiles() throws IOException {
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
            getAllFileInfo();
            refreshGrid();
        }


    private void deleteFiles(ClickEvent clickEvent) {
    List<Long> listItemsToDelete = new ArrayList<>();
        for (FileModel fileModel : selectedGridItems) {
            listItemsToDelete.add(fileModel.getId());
        }
        deleteDialog(listItemsToDelete);
    }

    private void deleteDialog(List<Long> listItemsToDelete) {
        Dialog dialog = new Dialog();
        dialog.setCloseOnEsc(false);
        dialog.setCloseOnOutsideClick(false);

        Label header = new Label("Delete selected Items?");

        Button confirmBtn = new Button("Yes");
        Button cancelBtn = new Button("No");

        VerticalLayout layout = new VerticalLayout();
        HorizontalLayout buttonLayout = new HorizontalLayout();

        buttonLayout.add(cancelBtn, confirmBtn);

        layout.add(header, buttonLayout);

        dialog.add(layout);

        confirmBtn.addClickListener(event -> {
            fileService.deleteListFiles(listItemsToDelete);
            getAllFileInfo();

            refreshGrid();

            deleteBtn.setEnabled(false);

            dialog.close();
        });

        cancelBtn.addClickListener(event -> {
            dialog.close();
        });

        dialog.open();

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

    public void getAllFileInfo() {
        if (isDoc()) {
            fileInfoList = fileService.getAllFileInfo(doc);
            fileGrid.setItems(fileInfoList);
        }
        else {
            fileGrid.setItems();
            refreshGrid();
        }
    }

    private void refreshGrid(){
        fileGrid.getDataProvider().refreshAll();
    }

    public void setEnableAddBtn(boolean enabled){
        if (memoryBuffer.getFiles().size()>0)
            addFileBtn.setEnabled(enabled);
    }
}
