package ru.spart.password_keeper_web.ui.views.layout;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.textfield.TextField;
import ru.spart.password_keeper_web.model.Secret;
import ru.spart.password_keeper_web.service.SecretService;
import ru.spart.password_keeper_web.ui.views.GridView;

public class NewSecretLayout extends HorizontalLayout {

    public TextField descriptionTxt = new TextField("Description");
    public TextField loginTxt = new TextField("Login");
    public TextField passwordTxt = new TextField("Password");


        public NewSecretLayout() {

       add(descriptionTxt);
       add(loginTxt);
       add(passwordTxt);
    }

    public Secret createSecret(){
        String description = descriptionTxt.getValue();
        String login = loginTxt.getValue();
        String password = passwordTxt.getValue();

        if (description.equals("") ||
                login.equals("") ||
                password.equals(""))
            return null;
        else
            return new Secret(description,login,password);
    }
}
