package ru.spart.password_keeper_web.ui.views.menu;

import com.vaadin.flow.component.contextmenu.MenuItem;
import com.vaadin.flow.component.menubar.MenuBar;
import com.vaadin.flow.component.notification.Notification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import ru.spart.password_keeper_web.configuration.Principal;
import ru.spart.password_keeper_web.ui.views.exception.SessionEndException;

import java.util.ArrayList;

public class Menu extends MenuBar {

    public static Principal principal = null;

    public Menu() {

        try {
            principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            MenuItem secrets = addItem("Secrets");
            MenuItem documents = addItem("Documents");
            MenuItem notes = addItem("Notes");
            MenuItem signOut = addItem("Sign Out, " + getUserName());

            secrets.addClickListener(event -> routeToSecrets());
            documents.addClickListener(event -> routeToDocuments());
            notes.addClickListener(event -> routeToNotes());
            signOut.addClickListener(event -> signOut());
        }
        catch (Exception e){
            getUI().ifPresent(ui -> ui.navigate("login"));
            sendNotification(e.toString());
        }
    }

    private void routeToSecrets(){
        getUI().ifPresent(ui -> ui.navigate("secrets"));
    }

    private void routeToDocuments(){
        getUI().ifPresent(ui -> ui.navigate("documents"));
    }

    private void routeToNotes(){
        getUI().ifPresent(ui -> ui.navigate("notes"));
    }

    private void signOut(){
        SecurityContextHolder.getContext().setAuthentication(null);
        principal = null;
        getUI().ifPresent(ui -> ui.navigate("login"));
    }

    private void sendNotification(String message) {
        Notification notification = new Notification();
        notification.setPosition(Notification.Position.MIDDLE);
        notification.show(message);
    }

    private String getUserName(){
        Principal principal = Menu.principal;
        return principal.getLogin().toUpperCase();
    }
}
