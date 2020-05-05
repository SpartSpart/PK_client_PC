package ru.spart.password_keeper_web.ui.views.layout;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.Anchor;
import com.vaadin.flow.component.html.Label;
import com.vaadin.flow.component.icon.Icon;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.upload.receivers.MultiFileMemoryBuffer;
import com.vaadin.flow.data.renderer.ComponentRenderer;
import com.vaadin.flow.server.StreamResource;
import elemental.json.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import ru.spart.password_keeper_web.constants.Messages;
import ru.spart.password_keeper_web.cryptography.CryptoException;
import ru.spart.password_keeper_web.model.Doc;
import ru.spart.password_keeper_web.model.FileModel;
import ru.spart.password_keeper_web.service.FileService;
import ru.spart.password_keeper_web.ui.views.component.CustomFileInputStream;
import ru.spart.password_keeper_web.ui.views.component.CustomUpload;

import java.io.*;
import java.util.*;


public class FileLayout extends HorizontalLayout {
    private FileService fileService;

    private Grid<FileModel> fileGrid = new Grid<>();
    private Set<FileModel> selectedGridItems = new HashSet<>();

    private Button addFileBtn = new Button("Add Files");
    private Button deleteBtn = new Button("Delete");
    //private Button downloadBtn = new Button("Download");

    private MultiFileMemoryBuffer memoryBuffer = new MultiFileMemoryBuffer();
    private CustomUpload upload = new CustomUpload(memoryBuffer);

    private Doc doc = null;

    @Autowired
    public FileLayout(FileService fileService) {
        this.fileService = fileService;
        setWidth("60%");
        getStyle().set("padding-top", "0px");

        setHeightFull();

        add(fileGrid);
        add(createBtnLayout());

        setGridSettings();
        }

    private void setGridSettings() {
        fileGrid.setMaxHeight("100%");
        fileGrid.setHeight("auto");
        fileGrid.setWidth("70%");

        fileGrid.addColumn(new ComponentRenderer<>(item ->  {
            Anchor download = new Anchor(new StreamResource(item.getFileName(), () -> createFileResource(item)), "");

            download.getElement().setAttribute("download", true);
            download.add(new Button(new Icon(VaadinIcon.DOWNLOAD_ALT)));
            add(download);
            return download;
        })).setHeader("Download").setResizable(true);

        fileGrid.addColumn(FileModel::getFileName).setHeader("fileName").setResizable(true);

        fileGrid.getColumns().forEach(column -> column.setAutoWidth(true));

        fileGrid.setSelectionMode(Grid.SelectionMode.MULTI);

        fileGrid.addSelectionListener(selectEvent -> {
            selectedGridItems = selectEvent.getAllSelectedItems();
            if (selectedGridItems == null || selectedGridItems.size() < 1) {
                deleteBtn.setEnabled(false);
                //downloadBtn.setEnabled(false);
            }
            else {
                deleteBtn.setEnabled(true);
                //downloadBtn.setEnabled(true);
            }
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
//        downloadBtn.setWidth("100%");
//        downloadBtn.setEnabled(false);

        btnLayout.add(upload);
        btnLayout.add(addFileBtn);
        btnLayout.add(deleteBtn);
//        btnLayout.add(downloadBtn);

        deleteBtn.addClickListener(this::deleteFiles);

        addFileBtn.addClickListener(event -> {
            try {
                addFiles();

                memoryBuffer.getFiles().clear();
                upload.getElement().executeJs("this.files=[]");

                addFileBtn.setEnabled(false);
            } catch (IOException e) {
                e.printStackTrace();
            } catch (CryptoException e) {
                e.printStackTrace();
            }
        });
        upload.addSucceededListener(event -> {
           if (isDoc())
               addFileBtn.setEnabled(true);
        });

        upload.getElement().addEventListener("file-remove", event -> {
            JsonObject eventData = event.getEventData();
            String removedFile = eventData.getString("event.detail.file.name");
            memoryBuffer.getFiles().remove(removedFile);
            if (memoryBuffer.getFiles().size()<1)
                addFileBtn.setEnabled(false);
        }).addEventData("event.detail.file.name");

//        downloadBtn.addClickListener(event -> {
//            if (selectedGridItems.size()>0) {
//                for (FileModel file : selectedGridItems) {
//                    try {
//                        getFile(file);
//                    }catch (Exception e){
//                        sendNotification(Messages.DOWNLOAD_FAILED.getMessage());
//                    }
//                }
//                fileGrid.deselectAll();
//                downloadBtn.setEnabled(false);
//            }
//        });


        return btnLayout;
    }

    private FileInputStream createFileResource(FileModel fileModel){
        File file = fileService.getSingleFile(fileModel,doc);
        InputStream inputStream = null;

        try {
           inputStream = new CustomFileInputStream(file);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        return (FileInputStream) inputStream;
    }


    private void getFile(FileModel fileModel) throws Exception {
       String downloadPath = fileService.getDownloadPath(doc,false);
        File file = new File(downloadPath+fileModel.getFileName());
        if (file.exists())
            fileExistsDialog(fileModel);
        else
            getFileFromServer(fileModel);
    }


    private void getFileFromServer(FileModel fileModel) throws Exception{
        sendNotification(fileService.getFileMultiSelected(fileModel,doc));


    }

    private void addFiles() throws IOException, CryptoException {
        List<String> unUploadedFiles;

            if (isDoc() && memoryBuffer.getFiles().size() > 0) {
                Map<String,InputStream> fileDataMap = new HashMap<>();

                Set<String> fileNames = memoryBuffer.getFiles();

                for (String name : fileNames) {
                    InputStream inputStream = memoryBuffer.getInputStream(name);
                    fileDataMap.put(name,inputStream);
                }

                unUploadedFiles = fileService.prepareFilesForSendingToServer(fileDataMap,doc);
                if (unUploadedFiles.size()>0){
                    sendNotification(Messages.UPLOAD_FAILED.getMessage()+": \n"+unUploadedFiles.toString());
                }
                else
                    sendNotification(Messages.UPLOAD_SUCCESS.getMessage());
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

        cancelBtn.addClickListener(event -> dialog.close());

        dialog.open();
    }

    private void fileExistsDialog(FileModel fileModel) {
        Dialog dialog = new Dialog();
        dialog.setCloseOnEsc(false);
        dialog.setCloseOnOutsideClick(false);

        Label header = new Label("File already exists!");
        Label question = new Label("Override: "+fileModel.getFileName()+"?");
        Button confirmBtn = new Button("Yes");
        Button cancelBtn = new Button("No");

        VerticalLayout layout = new VerticalLayout();
        HorizontalLayout buttonLayout = new HorizontalLayout();

        buttonLayout.add(cancelBtn, confirmBtn);

        layout.add(header, question, buttonLayout);

        dialog.add(layout);

        confirmBtn.addClickListener(event -> {
            try {
                getFileFromServer(fileModel);
            } catch (Exception e) {
                sendNotification(Messages.DOWNLOAD_FAILED.getMessage());
            }

            dialog.close();
        });

        cancelBtn.addClickListener(event -> dialog.close());

        dialog.open();
    }

    private boolean isDoc() {
        return doc != null;
    }

    public void setDoc(Doc doc) {
        this.doc = doc;
    }

    private void sendNotification(String message) {
        Notification.show(message);
    }

    public void getAllFileInfo() {
        if (isDoc()) {
            List<FileModel> fileInfoList = fileService.getAllFileInfo(doc);
            fileGrid.setItems(fileInfoList);
            fileGrid.recalculateColumnWidths();
        }
        else {
            fileGrid.setItems();
            refreshGrid();
        }
    }

    private void refreshGrid(){
        fileGrid.getDataProvider().refreshAll();
        fileGrid.recalculateColumnWidths();
    }

    public void setEnableAddBtn(boolean enabled){
        if (memoryBuffer.getFiles().size()>0)
            addFileBtn.setEnabled(enabled);
    }
}
