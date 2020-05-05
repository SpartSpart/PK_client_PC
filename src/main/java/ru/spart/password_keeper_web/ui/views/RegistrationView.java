package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.PasswordField;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import ru.spart.password_keeper_web.constants.Messages;
import ru.spart.password_keeper_web.model.User;
import ru.spart.password_keeper_web.service.UserService;


@Route(value = RegistrationView.ROUTE)
@PageTitle("Registration")
public class RegistrationView extends VerticalLayout {
    static final String ROUTE = "registration";

    private UserService userService;

    private TextField loginTxt = new TextField("Enter Login");
    private PasswordField passwordTxt = new PasswordField("Enter Password");
    private PasswordField confirmPasswordTxt = new PasswordField("Confirm Password");
    private TextField emailTxt = new TextField("Enter E-Mail");

    private Button registrationBtn = new Button("Registration",this::addUser);

    @Autowired
    public RegistrationView(UserService userService){
        this.userService = userService;

        setComponentWidth();

              add(loginTxt,
                    passwordTxt,
                    confirmPasswordTxt,
                    emailTxt,
                    registrationBtn);

        setDefaultHorizontalComponentAlignment(Alignment.CENTER);
    }

    private void setComponentWidth(){
        loginTxt.setWidth("20%");
        passwordTxt.setWidth("20%");
        confirmPasswordTxt.setWidth("20%");
        emailTxt.setWidth("20%");
        registrationBtn.setWidth("20%");

        loginTxt.setMinWidth("150px");
        passwordTxt.setMinWidth("150px");
        confirmPasswordTxt.setMinWidth("150px");
        emailTxt.setMinWidth("150px");
        registrationBtn.setMinWidth("150px");
    }

    private void addUser(ClickEvent event){
        User user = createUser();
        if (user==null) {
        }
        else{
            HttpStatus httpStatus = null;
            try {
                 httpStatus = userService.addUser(user);
            }
            catch (Exception e){
                httpStatus = HttpStatus.BAD_REQUEST;
            }
            if (httpStatus.equals(HttpStatus.OK)) {
               sendNotification(Messages.USER_WAS_CREATED.getMessage());
                registrationBtn.getUI().ifPresent(ui -> ui.navigate("login"));
            }
            else
                sendNotification(Messages.USER_ALREADY_EXISTS.getMessage());
        }
    }

    private User createUser(){
        String login = loginTxt.getValue();
        String password = passwordTxt.getValue();
        String confirmPassword = confirmPasswordTxt.getValue();
        String email = emailTxt.getValue();

        if (login.equals("") ||
            password.equals("") ||
            confirmPassword.equals("") ||
            email.equals("")){
                sendNotification(Messages.FILL_ALL_FIELDS.getMessage());
        }
        else
            if (password.equals(confirmPassword))
                return (new User(login,password,email));
        else{
                sendNotification(Messages.PASSWORD_CONFIRMATION_FAILED.getMessage());
        }
        return null;
    }

    private void sendNotification(String message) {
       Notification.show(message);
    }
}
