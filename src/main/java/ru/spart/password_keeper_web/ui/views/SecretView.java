package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.ClickEvent;
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
import org.springframework.security.core.context.SecurityContextHolder;
import ru.spart.password_keeper_web.configuration.Principal;
import ru.spart.password_keeper_web.cryptography.Crypto;
import ru.spart.password_keeper_web.model.Secret;
import ru.spart.password_keeper_web.service.SecretService;
import ru.spart.password_keeper_web.ui.views.layout.EditSecretLayout;
import ru.spart.password_keeper_web.ui.views.menu.SecretMenu;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Route(value = SecretView.ROUTE)
@PageTitle("Secrets")
public class SecretView extends VerticalLayout {
    public static final String ROUTE = "secrets";
    private static final String FILL_ALL_FIELDS = "Please fill all fields";
    private static final String NEW_SECRET = "New Secret";
    private static final String EDIT_SECRET = "Edit Secret";
    private static final String HIDDEN_PASSWORD = "********";

    private SecretService secretService;

    private Secret secretForUpdate = null;

    private SecretMenu secretMenu = new SecretMenu();

    private TextField filterTxt = new TextField();

    private Grid<Secret> secretGrid = new Grid<>(Secret.class);
    private List<Secret> secretList = null;
    private Set<Secret> selectedGridItems= null;
    private List<Long> listItemsToDelete = null;

    private EditSecretLayout editSecretLayout = new EditSecretLayout();

    private Button addSecretBtn = new Button("Add Secret", this::addSecret);
    private Button deleteSecretBtn = new Button("Delete",this::deleteSecrets);

    @Autowired
    public SecretView(SecretService secretService){

        this.secretService = secretService;
        setCryptoKeys();

        setSizeFull();

        editSecretLayout.setVisible(false);
        deleteSecretBtn.setEnabled(false);

        setFilterSettings();
        HorizontalLayout btnLayout = secretAddsecretDeleteBtnLayout();
        setHorizontalComponentAlignment(Alignment.END,btnLayout);

        add(secretMenu);
        add(filterTxt);
        add(secretGrid);
        add(btnLayout);
        add(editSecretLayout);

        setBtnListeners();
        setGridSettings();

        getAllSecrets();
    }


    private void setBtnListeners(){
        editSecretLayout.saveBtn.addClickListener(event -> {
            try {
                saveSecret(event);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        editSecretLayout.cancelBtn.addClickListener(event -> cancelEditSecret(event));
    }

    private HorizontalLayout secretAddsecretDeleteBtnLayout(){
        HorizontalLayout layout = new HorizontalLayout();
        layout.add(addSecretBtn,deleteSecretBtn);
        return layout;
    }

    private void setFilterSettings() {
        filterTxt.setPlaceholder("Filter by description");
        filterTxt.setClearButtonVisible(true);
        filterTxt.setValueChangeMode(ValueChangeMode.EAGER);
        filterTxt.addValueChangeListener(e -> updateList());


    }

    private void updateList() {
        if (secretList!=null && secretList.size()>0) {
            ArrayList<Secret> filteredSecretList = new ArrayList<>();
            String text = filterTxt.getValue();
            for (Secret secret : secretList)
                if (secret.getDescription().contains(text))
                    filteredSecretList.add(secret);
                secretGrid.setItems(hidePassword(filteredSecretList));
        }
        else
            secretGrid.setItems(hidePassword(secretList));
    }



    private void setGridSettings(){
        secretGrid.getColumnByKey("id").setVisible(false);

        secretGrid.setColumnOrder(secretGrid.getColumnByKey("id"),
                secretGrid.getColumnByKey("description"),
                secretGrid.getColumnByKey("login"),
                secretGrid.getColumnByKey("password"));

        secretGrid.setSelectionMode(Grid.SelectionMode.MULTI);

        secretGrid.addSelectionListener(selectEvent -> {
            selectedGridItems = selectEvent.getAllSelectedItems();
            if (selectedGridItems==null || selectedGridItems.size()<1)
                deleteSecretBtn.setEnabled(false);
            else
                deleteSecretBtn.setEnabled(true);
            });


        secretGrid.addItemDoubleClickListener(
                itemClickevent -> {
                    editSecretLayout.setVisible(true);
                    Secret selectedSecret = itemClickevent.getItem();
                    String password = searchPassword(selectedSecret.getId());
                    selectedSecret.setPassword(password);
                    editSecretGridValue(selectedSecret);
                });

        secretGrid.addItemClickListener(
                itemClickevent -> {
                    Secret selectedSecret = itemClickevent.getItem();
                    if (selectedSecret.getPassword().equals(HIDDEN_PASSWORD)){
                        String password = searchPassword(selectedSecret.getId());
                        selectedSecret.setPassword(password);
                    }
                    else
                        selectedSecret.setPassword(HIDDEN_PASSWORD);
                    secretGrid.getDataProvider().refreshItem(selectedSecret);
                });

    }

    private void editSecretGridValue(Secret secret){
        editSecretLayout.changeLayoutStatus(EDIT_SECRET);
        editSecretLayout.setVisible(true);
        editSecretLayout.descriptionTxt.setValue(secret.getDescription());
        editSecretLayout.loginTxt.setValue(secret.getLogin());
        editSecretLayout.passwordTxt.setValue(secret.getPassword());
        secretForUpdate = secret;
    }


    public void cancelEditSecret(ClickEvent event) {
        clearTextFields();
        editSecretLayout.setVisible(false);
    }

    private void getAllSecrets() {
        secretList = secretService.getAllSecrets();
        secretGrid.setItems(hidePassword(secretList));
        updateList();
    }

    private List<Secret> hidePassword(List<Secret> secretList){
        List<Secret> secretListWithHiddenPassword = new ArrayList<>();
        //  Collections.copy(secretListWithHiddenPassword,secretList);
        for(Secret secret : secretList){
            Secret hidenSecret = new Secret(
                    secret.getId(),
                    secret.getDescription(),
                    secret.getLogin(),
                    HIDDEN_PASSWORD);
            secretListWithHiddenPassword.add(hidenSecret);
        }
        return secretListWithHiddenPassword;
    }

    private String searchPassword(long id){
        String password = HIDDEN_PASSWORD;
        for(Secret secret : secretList){
            if (secret.getId()==id){
                password = secret.getPassword();
                break;
            }
        }
        return password;
    }

    private void addSecret(ClickEvent event){
        editSecretLayout.changeLayoutStatus(NEW_SECRET);
        editSecretLayout.setVisible(true);
        secretForUpdate = null;
        clearTextFields();
    }

    private void saveSecret(ClickEvent event) throws Exception {
        Secret secret = editSecretLayout.createSecret();
        if(secret==null)
            sendNotification(FILL_ALL_FIELDS);
        else {
            saveToService(secret);

            getAllSecrets();
            clearTextFields();
            editSecretLayout.setVisible(false);
        }
    }

    private void saveToService(Secret secret) throws Exception {
        if(secretForUpdate==null) {
            secretService.addSecret(secret);
            sendNotification("Secret saved successfully");
        }
        else{
            secret.setId(secretForUpdate.getId());
            secretService.updateSecret(secret);
            sendNotification("Secret updated successfully");
        }

    }

    private void deleteSecrets(ClickEvent clickEvent) {

            listItemsToDelete = new ArrayList<>();
            for (Secret secret : selectedGridItems) {
                listItemsToDelete.add(secret.getId());
            }
            deleteDialog();
    }

    private void deleteDialog()  {
        Dialog dialog  = new Dialog();
        dialog.setCloseOnEsc(false);
        dialog.setCloseOnOutsideClick(false);

        Label header = new Label("Delete selected Items?");

        Button confirmBtn = new Button("Yes");
        Button cancelBtn = new Button("No");

        VerticalLayout layout = new VerticalLayout();
        HorizontalLayout buttonLayout = new HorizontalLayout();

            buttonLayout.add(cancelBtn,confirmBtn);

            layout.add(header,buttonLayout);

            dialog.add(layout);

            confirmBtn.addClickListener(event -> {
                secretService.deleteListSecret(listItemsToDelete);
                getAllSecrets();
                deleteSecretBtn.setEnabled(false);
                editSecretLayout.setVisible(false);
                dialog.close();
            });

            cancelBtn.addClickListener(event -> {
                dialog.close();
            });

        dialog.open();

    }

    private void sendNotification(String message) {
        Notification notification = new Notification();
        notification.setPosition(Notification.Position.BOTTOM_CENTER);
        notification.show(message);
    }

    private void clearTextFields(){
        editSecretLayout.clearTextFields();
    }

    private void setCryptoKeys(){
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Crypto.setKeys(principal.getLogin());
}

}
