package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.aspectj.weaver.ast.Not;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import ru.spart.password_keeper_web.configuration.RemoteAuthenticationProvider;
import ru.spart.password_keeper_web.configuration.yaml.YamlConfig;
import ru.spart.password_keeper_web.model.User;
import ru.spart.password_keeper_web.service.UserService;

import java.util.Collection;


@Route(value = RegistrationView.ROUTE)
@PageTitle("Registration")
public class RegistrationView extends VerticalLayout {
    public static final String ROUTE = "registration";
    private static final String FILL_ALL_FIELDS = "Please fill all fields";
    private static final String PASSWORD_CONFIRMATION_FAILED = "Password confirmation is failed, please retry the enter";
    private static final String USER_WAS_CREATED = "User was created successfully";

    private UserService userService;

    private TextField loginTxt = new TextField("Enter Login");
    private TextField passwordTxt = new TextField("Enter Password");
    private TextField confirmPasswordTxt = new TextField("Confirm Password");
    private TextField emailTxt = new TextField("Enter E-Mail");

    private Button registrationBtn = new Button("Registration",this::addUser);

    @Autowired
    public RegistrationView(UserService userService){
        this.userService = userService;

              add(loginTxt,
                    passwordTxt,
                    confirmPasswordTxt,
                    emailTxt,
                    registrationBtn);

            setHorizontalComponentAlignment(Alignment.CENTER,
                    loginTxt,
                    passwordTxt,
                    confirmPasswordTxt,
                    emailTxt,
                    registrationBtn);
        setDefaultHorizontalComponentAlignment(Alignment.CENTER);

    }


    private void addUser(ClickEvent event){
        User user = createUser();
        if (user==null)
            return;
        else{
            HttpStatus message = userService.addUser(user);
            if (message.equals(HttpStatus.OK)) {
               sendNotification(USER_WAS_CREATED);
                registrationBtn.getUI().ifPresent(ui -> ui.navigate("login"));
            }
            else
                sendNotification(message.toString());
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
                sendNotification(FILL_ALL_FIELDS);
        }
        else
            if (password.equals(confirmPassword))
                return (new User(login,password,email));
        else{
                sendNotification(PASSWORD_CONFIRMATION_FAILED);
        }
        return null;
    }

    private void sendNotification(String message) {
        Notification notification = new Notification();
        notification.setPosition(Notification.Position.MIDDLE);
        notification.show(message);
    }
}
