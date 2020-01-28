package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.springframework.beans.factory.annotation.Autowired;
import ru.spart.password_keeper_web.model.Secret;
import ru.spart.password_keeper_web.service.SecretService;
import ru.spart.password_keeper_web.ui.views.layout.NewSecretLayout;

import java.util.List;

@Route(value = GridView.ROUTE)
@PageTitle("Grid")
public class GridView extends VerticalLayout {
    public static final String ROUTE = "grid";
    private static final String FILL_ALL_FIELDS = "Please fill all fields";

    private SecretService secretService;

    public static Grid<Secret> secretGrid = new Grid<>(Secret.class);

    private NewSecretLayout newSecretLayout = null;
    private HorizontalLayout buttonLayout = null;


    private Button saveBtn = new Button("Save",this::addSecret);
    private Button refreshGridBtn = new Button("Get All Secrets",this::refreshSecrets);
    private Button deleteBtn = new Button("Delete",this::deleteSecret);

    @Autowired
    public GridView(SecretService secretService){
        this.secretService = secretService;

        newSecretLayout = new NewSecretLayout();

        createButtonLayout();

        add(secretGrid);
        add(newSecretLayout);
        add(buttonLayout);

        //setHorizontalComponentAlignment(Alignment.END, saveBtn); //it works!!!!
        getAllSecrets();
    }

    private void createButtonLayout() {
        buttonLayout = new HorizontalLayout();
        buttonLayout.add(saveBtn, refreshGridBtn, deleteBtn);
    }

    public void refreshSecrets(ClickEvent event) {
        getAllSecrets();
    }

    private void getAllSecrets() {
        List<Secret> secretList = secretService.getAllSecrets();
        secretGrid.setItems(secretList);
    }

    private void addSecret(ClickEvent event){
        Secret secret = newSecretLayout.createSecret();
        if(secret==null)
            Notification.show(FILL_ALL_FIELDS);
        else {
            secretService.addSecret(secret);
            getAllSecrets();
        }
    }

    private void deleteSecret(ClickEvent event){

    }

    

}
