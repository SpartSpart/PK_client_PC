package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.Label;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.component.upload.Upload;
import com.vaadin.flow.component.upload.receivers.MultiFileMemoryBuffer;
import com.vaadin.flow.data.value.ValueChangeMode;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.springframework.beans.factory.annotation.Autowired;
import ru.spart.password_keeper_web.model.Doc;
import ru.spart.password_keeper_web.model.Secret;
import ru.spart.password_keeper_web.service.DocService;
import ru.spart.password_keeper_web.service.FileService;
import ru.spart.password_keeper_web.ui.views.layout.EditDocLayout;
import ru.spart.password_keeper_web.ui.views.layout.FileLayout;
import ru.spart.password_keeper_web.ui.views.menu.SecretMenu;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Route(value = DocView.ROUTE)
@PageTitle("docs")
public class DocView extends VerticalLayout {
    public static final String ROUTE = "documents";

    private static final String FILL_ALL_FIELDS = "Please fill all fields";
    private static final String NEW_DOC = "New Document";
    private static final String EDIT_DOC = "Edit Document";

    private DocService docService;
    private FileService fileService;

    private Doc docForUpdate = null;

    private SecretMenu secretMenu = new SecretMenu();

    private TextField filterTxt = new TextField();

    private Grid<Doc> docGrid = new Grid<>(Doc.class);
    private List<Doc> docList = null;
    private Set<Doc> selectedGridItems = null;
    private List<Long> listItemsToDelete = null;

    private EditDocLayout editDocLayout = new EditDocLayout();
    private FileLayout fileLayout = null;

    private Button addDocBtn = new Button("Add Document", this::addDoc);
    private Button deleteDocBtn = new Button("Delete", this::deleteDocs);


    @Autowired
    public DocView(DocService docService,FileService fileService) {

        this.docService = docService;
        this.fileService = fileService;

        fileLayout = new FileLayout(fileService);

        setSizeFull();

        editDocLayout.setVisible(false);
        deleteDocBtn.setEnabled(false);

        setFilterSettings();
        HorizontalLayout btnLayout = docAddDeleteBtnLayout();
        setHorizontalComponentAlignment(Alignment.END, btnLayout);

        HorizontalLayout gridHorizontalLayout = new HorizontalLayout();
        gridHorizontalLayout.setWidthFull();
        gridHorizontalLayout.add(docGrid,fileLayout);

        add(secretMenu);
        add(filterTxt);
        add(gridHorizontalLayout);
        add(btnLayout);
        add(editDocLayout);

        setBtnListeners();
        setGridSettings();

        getAllDocs();
    }


    private void setBtnListeners() {
        editDocLayout.saveBtn.addClickListener(event -> {
            try {
                saveDoc(event);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        editDocLayout.cancelBtn.addClickListener(event -> cancelEditDoc(event));
    }

    private HorizontalLayout docAddDeleteBtnLayout() {
        HorizontalLayout layout = new HorizontalLayout();
        layout.add(addDocBtn, deleteDocBtn);
        return layout;
    }

    private void setFilterSettings() {
        filterTxt.setPlaceholder("Filter");
        filterTxt.setClearButtonVisible(true);
        filterTxt.setValueChangeMode(ValueChangeMode.EAGER);
        filterTxt.addValueChangeListener(e -> updateList());


    }

    private void updateList() {
        if (docList != null && docList.size() > 0) {
            ArrayList<Doc> filteredDocList = new ArrayList<>();
            String text = filterTxt.getValue();
            for (Doc doc : docList)
                if (doc.getDocument().contains(text)
                        || doc.getDescription().contains(text))
                    filteredDocList.add(doc);
            docGrid.setItems(filteredDocList);
        }
        else
            docGrid.setItems(docList);
    }



    private void setGridSettings() {
        docGrid.getColumnByKey("id").setVisible(false);

        docGrid.setColumnOrder(docGrid.getColumnByKey("id"),
                docGrid.getColumnByKey("document"),
                docGrid.getColumnByKey("description"));


        docGrid.setSelectionMode(Grid.SelectionMode.MULTI);

        docGrid.addSelectionListener(selectEvent -> {
            selectedGridItems = selectEvent.getAllSelectedItems();
            if (selectedGridItems == null || selectedGridItems.size() < 1)
                deleteDocBtn.setEnabled(false);
            else
                deleteDocBtn.setEnabled(true);
        });


        docGrid.addItemDoubleClickListener(
                itemClickevent -> {
//                    editDocLayout.setVisible(true);
//                    Secret selectedSecret = itemClickevent.getItem();
//                    String password = searchPassword(selectedSecret.getId());
//                    selectedSecret.setPassword(password);
//                    editDocGridValue(selectedSecret);
                });

        docGrid.addItemClickListener(
                itemClickevent -> {
                    Doc selectedDoc = itemClickevent.getItem();
                    fileLayout.setDoc(selectedDoc);
//                    Secret selectedSecret = itemClickevent.getItem();
//                    if (selectedSecret.getPassword().equals(HIDDEN_PASSWORD)) {
//                        String password = searchPassword(selectedSecret.getId());
//                        selectedSecret.setPassword(password);
//                    } else
//                        selectedSecret.setPassword(HIDDEN_PASSWORD);
//                    docGrid.getDataProvider().refreshItem(selectedSecret);
                });

    }

    private void editDocGridValue(Doc doc) {
        editDocLayout.changeLayoutStatus(EDIT_DOC);
        editDocLayout.setVisible(true);
        editDocLayout.documentTxt.setValue(doc.getDocument());
        editDocLayout.descriptionTxt.setValue(doc.getDescription());
        docForUpdate = doc;
    }


    public void cancelEditDoc(ClickEvent event) {
        clearTextFields();
        editDocLayout.setVisible(false);
    }

    private void getAllDocs() {
        docList = docService.getAllDocs();
        docGrid.setItems(docList);
        updateList();
    }





    private void addDoc(ClickEvent event) {
        editDocLayout.changeLayoutStatus(NEW_DOC);
        editDocLayout.setVisible(true);
        docForUpdate = null;
        clearTextFields();
    }

    private void saveDoc(ClickEvent event) throws Exception {
        Doc doc = editDocLayout.createDoc();
        if (doc == null)
            sendNotification(FILL_ALL_FIELDS);
        else {
            saveToService(doc);

            getAllDocs();
            clearTextFields();
            editDocLayout.setVisible(false);
        }
    }

    private void saveToService(Doc doc) throws Exception {
        if (docForUpdate == null) {
            docService.addDoc(doc);
            sendNotification("Document saved successfully");
        } else {
            doc.setId(docForUpdate.getId());
            docService.updateDoc(doc);
            sendNotification("Document updated successfully");
        }

    }

    private void deleteDocs(ClickEvent clickEvent) {

        listItemsToDelete = new ArrayList<>();
        for (Doc doc : selectedGridItems) {
            listItemsToDelete.add(doc.getId());
        }
        deleteDialog();
    }

    private void deleteDialog() {
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
            docService.deleteListDocs(listItemsToDelete);
            getAllDocs();
            deleteDocBtn.setEnabled(false);
            editDocLayout.setVisible(false);
            dialog.close();
        });

        cancelBtn.addClickListener(event -> {
            dialog.close();
        });

        dialog.open();

    }

    private void sendNotification(String message) {
        com.vaadin.flow.component.notification.Notification notification = new com.vaadin.flow.component.notification.Notification();
        notification.setPosition(com.vaadin.flow.component.notification.Notification.Position.BOTTOM_CENTER);
        notification.show(message);
    }

    private void clearTextFields() {
        editDocLayout.clearTextFields();
    }

}