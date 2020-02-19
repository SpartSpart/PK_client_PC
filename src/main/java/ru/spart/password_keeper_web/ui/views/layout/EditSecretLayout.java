package ru.spart.password_keeper_web.ui.views.layout;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.html.Label;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import ru.spart.password_keeper_web.model.Secret;

public class EditSecretLayout extends VerticalLayout {

    private Label statusEditSecretLayout = new Label("");

    public TextField descriptionTxt = new TextField("Description");
    public TextField loginTxt = new TextField("Login");
    public TextField passwordTxt = new TextField("Password");

    public Button saveBtn = new Button("Save");
    public Button cancelBtn = new Button("Cancel");

        public EditSecretLayout() {

        statusEditSecretLayout.getStyle().set("font-weight","bold");

        add(statusEditSecretLayout);
        add(createSecretLayout());

        getStyle().set("border", "1px solid lightgray");
    }

   private HorizontalLayout createSecretLayout(){
       HorizontalLayout layout = new HorizontalLayout();

       layout.add(descriptionTxt);
       layout.add(loginTxt);
       layout.add(passwordTxt);

       descriptionTxt.getStyle().set("font-size", "smaller");
       loginTxt.getStyle().set("font-size", "smaller");
       passwordTxt.getStyle().set("font-size", "smaller");

       layout.add(saveBtn);
       layout.add(cancelBtn);

       layout.setVerticalComponentAlignment(Alignment.END,saveBtn);
       layout.setVerticalComponentAlignment(Alignment.END,cancelBtn);

       return layout;
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

    public void clearTextFields(){
        descriptionTxt.clear();
        loginTxt.clear();
        passwordTxt.clear();
    }

    public void changeLayoutStatus(String status){
        statusEditSecretLayout.setText(status);
    }

}
