package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.ClickEvent;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.Label;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.data.value.ValueChangeMode;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import ru.spart.password_keeper_web.configuration.Principal;
import ru.spart.password_keeper_web.constants.Messages;
import ru.spart.password_keeper_web.cryptography.CryptText;
import ru.spart.password_keeper_web.model.Note;
import ru.spart.password_keeper_web.service.NoteService;
import ru.spart.password_keeper_web.ui.views.layout.EditNoteLayout;
import ru.spart.password_keeper_web.ui.views.menu.Menu;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static ru.spart.password_keeper_web.cryptography.CryptText.setKeys;

@Route(value = NoteView.ROUTE)
@PageTitle("Notes")
public class NoteView extends VerticalLayout {
    public static final String ROUTE = "notes";

    private static final String NEW_NOTE = "New Note";
    private static final String EDIT_NOTE = "Edit Note";

    private NoteService noteService;

    private Note noteForUpdate = null;

    private Menu menu = new Menu();

    private TextField filterTxt = new TextField();

    private Grid<Note> noteGrid = new Grid<>(Note.class);
    private List<Note> noteList = null;
    private Set<Note> selectedGridItems= null;
    private List<Long> listItemsToDelete = null;

    private EditNoteLayout editNoteLayout = new EditNoteLayout();

    private Button addNoteBtn = new Button("Add Note", this::addNote);
    private Button deleteNoteBtn = new Button("Delete",this::deleteNote);

    @Autowired
    public NoteView(NoteService noteService){

        this.noteService = noteService;

        setCryptoKeys();

        setSizeFull();

        editNoteLayout.setVisible(false);
        deleteNoteBtn.setEnabled(false);

        setFilterSettings();

        add(menu);
        add(filterTxt);
        add(getNoteLayout());

        setDefaultSizeNoteArea();

        UI.getCurrent().getPage().addBrowserWindowResizeListener(
                event -> {
                    int windowHeight = event.getHeight();
                    setNoteAreaHeight(windowHeight);
                });

        setBtnListeners();
        setGridSettings();

        getAllNotes();
    }

    private void setNoteAreaHeight(int windowHeight){
        final int totalHeightOfStaticPageElements = 300;
        final int minHeightOfNoteArea = 51;
        if ((windowHeight-totalHeightOfStaticPageElements) > minHeightOfNoteArea){
            int noteAreaMaxHeight = windowHeight-totalHeightOfStaticPageElements;
            editNoteLayout.noteArea.getStyle().set("max-height",noteAreaMaxHeight+"px");
      }
        else{
            editNoteLayout.noteArea.getStyle().set("max-height","50px");
            }
    }

    private void setDefaultSizeNoteArea(){
        UI.getCurrent().getPage().retrieveExtendedClientDetails(details -> {
            int windowHeight = details.getWindowInnerHeight();
            setNoteAreaHeight(windowHeight);
        });
    }



    private HorizontalLayout getNoteLayout(){
        HorizontalLayout noteLayout = new HorizontalLayout();
        VerticalLayout mainLayout = new VerticalLayout();

        HorizontalLayout btnLayout = noteAddnoteDeleteBtnLayout();
        setHorizontalComponentAlignment(Alignment.END,btnLayout);

        noteGrid.getStyle().set("padding-top", "0px");

        mainLayout.add(noteGrid);
        mainLayout.add(btnLayout);

        noteLayout.setWidthFull();
        noteLayout.setHeight("100%");
        editNoteLayout.setWidth("30%");
        editNoteLayout.setHeightFull();

        noteLayout.add(mainLayout);
        noteLayout.add(editNoteLayout);

        return noteLayout;
    }

    private void setBtnListeners(){
        editNoteLayout.saveBtn.addClickListener(event -> {
            try {
                saveNote(event);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        editNoteLayout.cancelBtn.addClickListener(this::cancelEditNote);
    }

    private HorizontalLayout noteAddnoteDeleteBtnLayout(){
        HorizontalLayout layout = new HorizontalLayout();
        layout.add(addNoteBtn, deleteNoteBtn);
        return layout;
    }

    private void setFilterSettings() {
        filterTxt.setPlaceholder("Filter by note");
        filterTxt.setClearButtonVisible(true);
        filterTxt.setValueChangeMode(ValueChangeMode.EAGER);
        filterTxt.addValueChangeListener(e -> updateList());
    }

    private void updateList() {
        if (noteList != null && noteList.size() > 0) {
            ArrayList<Note> filteredNoteList = new ArrayList<>();
            String text = filterTxt.getValue();
            for (Note note : noteList)
                if (note.getNote().contains(text))
                    filteredNoteList.add(note);
            noteGrid.setItems(filteredNoteList);
        } else {
            assert noteList != null;
            noteGrid.setItems(noteList);
        }
    }


    private void setGridSettings(){
        noteGrid.getColumnByKey("id").setVisible(false);

        noteGrid.setColumnOrder(
                noteGrid.getColumnByKey("id"),
                noteGrid.getColumnByKey("note"));


        noteGrid.setSelectionMode(Grid.SelectionMode.MULTI);

        noteGrid.addSelectionListener(selectEvent -> {
            selectedGridItems = selectEvent.getAllSelectedItems();
            if (selectedGridItems==null || selectedGridItems.size()<1)
                deleteNoteBtn.setEnabled(false);
            else
                deleteNoteBtn.setEnabled(true);
            });


        noteGrid.addItemDoubleClickListener(
                itemClickevent -> {
                    editNoteLayout.setVisible(true);
                    Note selectedNote = itemClickevent.getItem();
                    editNoteGridValue(selectedNote);
                });

        noteGrid.addItemClickListener(
                itemClickevent -> {

                });

    }

    private void editNoteGridValue(Note note){
        editNoteLayout.changeLayoutStatus(EDIT_NOTE);
        editNoteLayout.setVisible(true);
        editNoteLayout.noteArea.setValue(note.getNote());

        noteForUpdate = note;
    }


    private void cancelEditNote(ClickEvent event) {
        clearTextFields();
        editNoteLayout.setVisible(false);
    }

    private void getAllNotes() {
        noteList = noteService.getAllNotes();
        noteGrid.setItems(noteList);
        updateList();
    }

    private void addNote(ClickEvent event){
        editNoteLayout.changeLayoutStatus(NEW_NOTE);
        editNoteLayout.setVisible(true);
        noteForUpdate = null;
        clearTextFields();
    }

    private void saveNote(ClickEvent event) throws Exception {
        Note note = editNoteLayout.createNote();
        if(note==null)
            sendNotification(Messages.FILL_ALL_FIELDS.getMessage());
        else {
            saveToService(note);

            getAllNotes();
            clearTextFields();
            editNoteLayout.setVisible(false);
        }
    }

    private void saveToService(Note note) throws Exception {
        if(noteForUpdate ==null) {
            String message = saveNote(note);
            sendNotification(message);
        }
        else{
            String message = updateNote(note);
            sendNotification(message);
        }
    }

    private String saveNote(Note note){
        try {
            noteService.addNote(note);
        } catch (Exception e) {
            return Messages.UPLOAD_FAILED.getMessage();
        }
        return Messages.UPLOAD_SUCCESS.getMessage();
    }

    private String updateNote(Note note){
        note.setId(noteForUpdate.getId());
        try {
            noteService.updateNote(note);
        } catch (Exception e) {
            return Messages.UPDATE_FAILED.getMessage();
        }
        return Messages.UPDATE_SUCCESS.getMessage();
    }

    private void deleteNote(ClickEvent clickEvent) {

            listItemsToDelete = new ArrayList<>();
            for (Note note : selectedGridItems) {
                listItemsToDelete.add(note.getId());
            }
            deleteDialog();
    }

    private void deleteDialog()  {
        Dialog dialog  = new Dialog();
        dialog.setCloseOnEsc(false);
        dialog.setCloseOnOutsideClick(false);

        Label header = new Label("Delete selected Items?");

        Button confirmBtn = new Button("Yes");
        Button cancelBtn = new Button("No");

        VerticalLayout layout = new VerticalLayout();
        HorizontalLayout buttonLayout = new HorizontalLayout();

            buttonLayout.add(cancelBtn,confirmBtn);

            layout.add(header,buttonLayout);

            dialog.add(layout);

            confirmBtn.addClickListener(event -> {
                noteService.deleteListNotes(listItemsToDelete);
                getAllNotes();
                deleteNoteBtn.setEnabled(false);
                editNoteLayout.setVisible(false);
                dialog.close();
            });

            cancelBtn.addClickListener(event -> dialog.close());

        dialog.open();

    }

    private void sendNotification(String message) {
        Notification.show(message);
    }

    private void clearTextFields(){
        editNoteLayout.clearTextFields();
    }

    private void setCryptoKeys(){
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CryptText.setKeys(principal.getLogin());
    }
}
