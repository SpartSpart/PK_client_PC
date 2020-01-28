package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;


@Route(value = RegistrationView.ROUTE)
@PageTitle("Registration")
public class RegistrationView extends VerticalLayout {
    public static final String ROUTE = "registration";

    private TextField login = new TextField("Enter Login");
    private TextField password = new TextField("Enter Password");
    private TextField confirmPassword = new TextField("Confirm Password");
    private TextField email = new TextField("Enter E-Mail");

    private Button registrationBtn = new Button("Registration",this::addUser);

    public RegistrationView(){
            add(login,
                password,
                confirmPassword,
                email,
                registrationBtn);

            setHorizontalComponentAlignment(Alignment.END);
    }


    private void addUser(ClickEvent event){

        //action of registration button clicked
        registrationBtn.getUI().ifPresent(ui -> ui.navigate("grid"));

    }
}
