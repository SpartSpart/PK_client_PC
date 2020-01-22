package ru.spart.password_keeper_web.ui.views;

import ch.qos.logback.core.joran.action.Action;
import com.vaadin.flow.component.*;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.component.formlayout.FormLayout;
import com.vaadin.flow.component.html.NativeButton;
import com.vaadin.flow.component.login.AbstractLogin;
import com.vaadin.flow.component.login.LoginForm;
import com.vaadin.flow.component.login.LoginI18n;
import com.vaadin.flow.component.login.LoginOverlay;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.PasswordField;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.BeforeEnterEvent;
import com.vaadin.flow.router.BeforeEnterObserver;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.dom.Element;

import java.util.Collections;

//LoginForm
//@Tag("sa-login-view")
//@Route(value = LoginView.ROUTE)
//@PageTitle("Login")
//public class LoginView extends VerticalLayout implements BeforeEnterObserver {
//    public static final String ROUTE = "login";
//
//    private LoginForm login = new LoginForm();
//    Button registrationButton = new Button("Registration");
//
//    public LoginView() {
//        login.setAction("login");
//        add(login);
//        add(registrationButton);
//    }
//
//    @Override
//    public void beforeEnter(BeforeEnterEvent event) {
//        // inform the user about an authentication error
//        // (yes, the API for resolving query parameters is annoying...)
//        if (!event.getLocation().getQueryParameters().getParameters().getOrDefault("error", Collections.emptyList()).isEmpty()) {
//            login.setError(true);
//        }
//    }
//}

//Custom Java form

@Route(value = LoginView.ROUTE)
@PageTitle("Login")
@NpmPackage(value = "@polymer/iron-form", version = "3.0.1")
@JsModule("@polymer/iron-form/iron-form.js")
public class LoginView extends VerticalLayout {
    public static final String ROUTE = "login";
    private Button submitButton = new Button("Login");
    private Button registrationButton = new Button("Registration",this::showRegistrationView);

    public LoginView() {
        TextField userNameTextField = new TextField("Login");
        userNameTextField.getElement().setAttribute("name", "username");
        PasswordField passwordField = new PasswordField("Password");
        passwordField.getElement().setAttribute("name", "password");

        submitButton.setId("submitbutton");

        registrationButton.setId("registrationbutton");
        UI.getCurrent().getPage().executeJs("document.getElementById('submitbutton').addEventListener('click', () => document.getElementById('ironform').submit());");

        FormLayout formLayout = new FormLayout();
        formLayout.add(userNameTextField, passwordField, submitButton,registrationButton);

        Element formElement = new Element("form");
        formElement.setAttribute("method", "post");
        formElement.setAttribute("action", "login");
        formElement.appendChild(formLayout.getElement());

        Element ironForm = new Element("iron-form");
        ironForm.setAttribute("id", "ironform");
        ironForm.setAttribute("allow-redirect", true);
        ironForm.appendChild(formElement);

        getElement().appendChild(ironForm);
        this.setHorizontalComponentAlignment(Alignment.CENTER);



        setClassName("login-view");
    }

    private void showRegistrationView(ClickEvent event) {
        registrationButton.getUI().ifPresent(ui -> ui.navigate("grid"));


//        NativeButton button = new NativeButton("Navigate to company");
//        button.addClickListener((ClickEvent<NativeButton> e) -> {
//            button.getUI().ifPresent(ui -> ui.navigate("company"));
//        });

    }
}

//LoginOverlayForm

//@Tag("sa-login-view")
//@Route(value = LoginView.ROUTE)
//@PageTitle("Login")
//public class LoginView extends VerticalLayout implements BeforeEnterObserver  {
//    public static final String ROUTE = "login";
//
//    private LoginOverlay login = new LoginOverlay();
//
//    public LoginView(){
//        login.setAction("login");
//        login.setOpened(true);
//        login.setTitle("Spring Secured Vaadin");
//        login.setDescription("Login Overlay Example");
//
//        getElement().appendChild(login.getElement());
//    }
//
//    @Override
//    public void beforeEnter(BeforeEnterEvent event) {
//        login.setError(event.getLocation().getQueryParameters().getParameters().containsKey("error"));
//    }
//}