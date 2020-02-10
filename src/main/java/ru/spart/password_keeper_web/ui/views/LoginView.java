package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.*;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.PasswordField;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.dom.Element;

@Route(value = LoginView.ROUTE)
@PageTitle("Login")
@NpmPackage(value = "@polymer/iron-form", version = "3.0.1")
@JsModule("@polymer/iron-form/iron-form.js")
public class LoginView extends VerticalLayout {
    public static final String ROUTE = "login";

    private TextField loginTxt = new TextField("Enter Login");
    private PasswordField passwordTxt = new PasswordField("Enter Password");

    private Button submitBtn = new Button("Sign In");
    private Button registrationBtn = new Button("Registration",this::showRegistrationView);

    public LoginView() {

        loginTxt.getElement().setAttribute("name", "username");
        passwordTxt.getElement().setAttribute("name", "password");

        submitBtn.setId("submitbutton");
        registrationBtn.setId("registrationbutton");

        UI.getCurrent().getPage().executeJs("document.getElementById('submitbutton')" +
                ".addEventListener('click', () => document.getElementById('ironform').submit());");

        UI.getCurrent().getPage().executeJs("document.getElementById('ironform').style.width = '100%'");

        VerticalLayout verticalLayout = new VerticalLayout();
        verticalLayout.setDefaultHorizontalComponentAlignment(Alignment.CENTER);
        verticalLayout.setWidthFull();
        setComponentWidth();
        verticalLayout.add(loginTxt, passwordTxt, submitBtn, registrationBtn);

        Element formElement = new Element("form");
        formElement.setAttribute("method", "post");
        formElement.setAttribute("action", "login");
        formElement.appendChild(verticalLayout.getElement());

        Element ironForm = new Element("iron-form");
        ironForm.setAttribute("id", "ironform");
        ironForm.setAttribute("allow-redirect", true);
        ironForm.appendChild(formElement);

        getElement().appendChild(ironForm);
        this.setHorizontalComponentAlignment(Alignment.CENTER);

        setClassName("descriptionTxt-view");
    }

    private void showRegistrationView(ClickEvent event) {
        registrationBtn.getUI().ifPresent(ui -> ui.navigate("registration"));
    }

    private void setComponentWidth(){
        loginTxt.setWidth("20%");
        passwordTxt.setWidth("20%");
        submitBtn.setWidth("20%");
        registrationBtn.setWidth("20%");

        loginTxt.setMinWidth("150px");
        passwordTxt.setMinWidth("150px");
        submitBtn.setMinWidth("150px");
        registrationBtn.setMinWidth("150px");
    }
}
