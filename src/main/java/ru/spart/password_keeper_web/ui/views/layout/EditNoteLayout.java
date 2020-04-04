package ru.spart.password_keeper_web.ui.views.layout;

import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.html.Label;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.component.textfield.TextField;
import ru.spart.password_keeper_web.model.Note;

public class EditNoteLayout extends VerticalLayout {

    private Label statusEditNoteLayout = new Label("");

    //public TextField noteTxt = new TextField("Note");

    public TextArea noteArea = new TextArea("Note Area");

    public Button saveBtn = new Button("Save");
    public Button cancelBtn = new Button("Cancel");

        public EditNoteLayout() {

        statusEditNoteLayout.getStyle().set("font-weight","bold");
        setWidthFull();


        add(statusEditNoteLayout);

        noteArea.setWidthFull();
        noteArea.setId("noteArea");
        noteArea.getStyle().set("font-size", "smaller");
        //noteArea.getElement().getChild(0).getStyle().set("height","200px");
        add(noteArea);

        add(createBtnLayout());

        getStyle().set("border", "1px solid lightgray");
    }

   private HorizontalLayout createBtnLayout(){
       HorizontalLayout layout = new HorizontalLayout();

       layout.add(saveBtn);
       layout.add(cancelBtn);

       setHorizontalComponentAlignment(Alignment.END,saveBtn);
       setHorizontalComponentAlignment(Alignment.END,cancelBtn);
       layout.setVerticalComponentAlignment(Alignment.END,saveBtn);
       layout.setVerticalComponentAlignment(Alignment.END,cancelBtn);

       return layout;
   }

    public Note createNote(){
        String note = noteArea.getValue();

        if (note.equals(""))
            return null;
        else
            return new Note(note);
    }

    public void clearTextFields(){
        noteArea.clear();
    }

    public void changeLayoutStatus(String status){
        statusEditNoteLayout.setText(status);
    }

}
