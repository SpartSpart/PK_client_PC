package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.Label;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.data.value.ValueChangeMode;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.springframework.beans.factory.annotation.Autowired;
import ru.spart.password_keeper_web.constants.Messages;
import ru.spart.password_keeper_web.model.Doc;
import ru.spart.password_keeper_web.service.DocService;
import ru.spart.password_keeper_web.service.FileService;
import ru.spart.password_keeper_web.ui.views.layout.EditDocLayout;
import ru.spart.password_keeper_web.ui.views.layout.FileLayout;
import ru.spart.password_keeper_web.ui.views.menu.Menu;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Route(value = DocView.ROUTE)
@PageTitle("documents")
public class DocView extends VerticalLayout {
    static final String ROUTE = "documents";

    private static final String NEW_DOC = "New Document";
    private static final String EDIT_DOC = "Edit Document";

    private DocService docService;
    private FileService fileService;

    private Doc docForUpdate = null;

    private Menu menu = new Menu();

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
        gridHorizontalLayout.setSizeFull();
        gridHorizontalLayout.add(docGrid,fileLayout);

        add(menu);
        add(filterTxt);
        add(gridHorizontalLayout);
        add(btnLayout);
        add(editDocLayout);

        setBtnListeners();
        setGridSettings();

        getAllDocs();

        setDefaultSizeUploadListFiles();

        UI.getCurrent().getPage().addBrowserWindowResizeListener(
                event -> {
                    int windowHeight = event.getHeight();
                    setUploadListFilesElementHeight(windowHeight);
                });
    }

    private void setUploadListFilesElementHeight(int windowHeight){
        final int totalHeightOfStaticPageElements = 677;
        final int minHeightOfUploadListFilesElement = 51;
        if ((windowHeight-totalHeightOfStaticPageElements) > minHeightOfUploadListFilesElement){
            int listHeight = windowHeight-totalHeightOfStaticPageElements;
            UI.getCurrent().getPage().executeJs("document.querySelectorAll('vaadin-upload')[0].shadowRoot.childNodes[4].style.display = 'block'");
            UI.getCurrent().getPage().executeJs("document.querySelectorAll('vaadin-upload')[0].shadowRoot.childNodes[4].style.overflowY = 'scroll'");
            UI.getCurrent().getPage().executeJs("document.querySelectorAll('vaadin-upload')[0].shadowRoot.childNodes[4].style.maxHeight = '" + listHeight + "px'");
            UI.getCurrent().getPage().executeJs("document.querySelectorAll('vaadin-upload')[0].shadowRoot.childNodes[4].style.minHeight = '0px'");
        }
        else{
            UI.getCurrent().getPage().executeJs("document.querySelectorAll('vaadin-upload')[0].shadowRoot.childNodes[4].style.display = 'block'");
            UI.getCurrent().getPage().executeJs("document.querySelectorAll('vaadin-upload')[0].shadowRoot.childNodes[4].style.overflowY = 'scroll'");
            UI.getCurrent().getPage().executeJs("document.querySelectorAll('vaadin-upload')[0].shadowRoot.childNodes[4].style.minHeight = '50px'");
            UI.getCurrent().getPage().executeJs("document.querySelectorAll('vaadin-upload')[0].shadowRoot.childNodes[4].style.maxHeight = '50px'");
        }
    }

    private void setDefaultSizeUploadListFiles(){
        UI.getCurrent().getPage().retrieveExtendedClientDetails(details -> {
           int windowHeight = details.getWindowInnerHeight();
           setUploadListFilesElementHeight(windowHeight);
        });
    }

    private void setBtnListeners() {
        editDocLayout.saveBtn.addClickListener(event -> {
            if (isCorrectDocName()) {
                try {
                    saveDoc(event);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });

        editDocLayout.cancelBtn.addClickListener(this::cancelEditDoc);
    }

    private boolean isCorrectDocName() {
        String docName = editDocLayout.getDocName();
        if (isDocNameNotExists(docName)){

            Pattern pattern = Pattern.compile("^[a-zA-ZА-Яа-я0-9_.\\- ]+$");
            Matcher matcher = pattern.matcher(docName);

            if(matcher.find())
                return true;
            else
                if (docName.equals(""))
                    sendNotification(Messages.FILL_ALL_FIELDS.getMessage());
                else
                    sendNotification(Messages.UNACCEPTABLE_SYMBOLS.getMessage());
        }
        else{
            sendNotification(Messages.NAME_ALREADY_EXISTS.getMessage());
        }

        return false;
    }

    private boolean isDocNameNotExists(String docName){
        if (docList!=null){
            if (docForUpdate == null){
                for (Doc doc : docList) {
                    if (doc.getDocument().equals(docName))
                        return false;
                }
            }
            else {
                for (Doc doc : docList) {
                    if (doc.getDocument().equals(docName) && !docForUpdate.getDocument().equals(docName))
                        return false;
                }
            }
        }
    return true;
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
        else {
            assert docList != null;
            docGrid.setItems(docList);
        }
    }

    private void setGridSettings() {
        docGrid.setHeight("auto");

        docGrid.getColumnByKey("id").setVisible(false);

        docGrid.setColumnOrder(docGrid.getColumnByKey("id"),
                docGrid.getColumnByKey("document"),
                docGrid.getColumnByKey("description"));

        docGrid.addSelectionListener(selectEvent -> {
            selectedGridItems = selectEvent.getAllSelectedItems();
            if (selectedGridItems == null || selectedGridItems.size() < 1) {
                deleteDocBtn.setEnabled(false);
                fileLayout.setDoc(null);
                fileLayout.getAllFileInfo();
                fileLayout.setEnableAddBtn(false);
            }

            else {
                deleteDocBtn.setEnabled(true);
                Doc selectedDoc = selectEvent.getFirstSelectedItem().get();
                fileLayout.setDoc(selectedDoc);
                fileLayout.getAllFileInfo();
                fileLayout.setEnableAddBtn(true);
            }
        });


        docGrid.addItemDoubleClickListener(
                itemClickevent -> {
                    Doc selectedDoc = itemClickevent.getItem();
                    editDocGridValue(selectedDoc);
                });

    }

    private void editDocGridValue(Doc doc) {
        editDocLayout.changeLayoutStatus(EDIT_DOC);
        editDocLayout.setVisible(true);
        editDocLayout.documentTxt.setValue(doc.getDocument());
        editDocLayout.descriptionTxt.setValue(doc.getDescription());
        docForUpdate = doc;
    }


    private void cancelEditDoc(ClickEvent event) {
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
            sendNotification(Messages.CHECK_DOC_NAME.getMessage());
        else {
            addOrUdateSecretToService(doc);

            getAllDocs();
            clearTextFields();
            editDocLayout.setVisible(false);
        }
    }

    private void addOrUdateSecretToService(Doc doc) {
        String message;
        if (docForUpdate == null) {
            message = saveDoc(doc);
            sendNotification(message);
        } else {
            message = updateDoc(doc);
            sendNotification(message);
        }
    }

    private String saveDoc(Doc doc){
        try {
            docService.addDoc(doc);
        } catch (Exception e) {
            return Messages.UPLOAD_FAILED.getMessage();
        }
        return Messages.UPLOAD_SUCCESS.getMessage();
    }

    private String updateDoc(Doc doc){
        try {
            doc.setId(docForUpdate.getId());
            docService.updateDoc(doc);
        } catch (Exception e) {
            return Messages.UPDATE_FAILED.getMessage();
        }
        return Messages.UPDATE_SUCCESS.getMessage();
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

        cancelBtn.addClickListener(event -> dialog.close());

        dialog.open();
    }

    private void sendNotification(String message) {
      Notification.show(message);
    }

    private void clearTextFields() {
        editDocLayout.clearTextFields();
    }
}