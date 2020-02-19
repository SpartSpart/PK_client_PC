package ru.spart.password_keeper_web.ui.views.layout;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.html.Label;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import ru.spart.password_keeper_web.model.Doc;

import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class EditDocLayout extends VerticalLayout {
    private Label statusEditDocLayout = new Label("");

    public TextField documentTxt = new TextField("Document");
    public TextField descriptionTxt = new TextField("Description");

    public Button saveBtn = new Button("Save");
    public Button cancelBtn = new Button("Cancel");

    public EditDocLayout() {

        statusEditDocLayout.getStyle().set("font-weight","bold");

        add(statusEditDocLayout);
        add(createEditLayout());

        getStyle().set("border", "1px solid lightgray");
    }

    private HorizontalLayout createEditLayout(){
        HorizontalLayout layout = new HorizontalLayout();

        layout.add(documentTxt);
        layout.add(descriptionTxt);

        documentTxt.getStyle().set("font-size", "smaller");
        descriptionTxt.getStyle().set("font-size", "smaller");

        layout.add(saveBtn);
        layout.add(cancelBtn);

        layout.setVerticalComponentAlignment(Alignment.END,saveBtn);
        layout.setVerticalComponentAlignment(Alignment.END,cancelBtn);

        return layout;
    }

    public Doc createDoc(){
        String document = documentTxt.getValue();
        String description = descriptionTxt.getValue();

        if (document.equals(""))
            return null;
        else
            return new Doc(document,description);
    }

    public void clearTextFields(){
        documentTxt.clear();
        descriptionTxt.clear();
    }



    public String getDocName(){
        return documentTxt.getValue();
    }

    public void changeLayoutStatus(String status){
        statusEditDocLayout.setText(status);
    }

}




