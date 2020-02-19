package ru.spart.password_keeper_web.ui.views.menu;

import com.vaadin.flow.component.contextmenu.MenuItem;
import com.vaadin.flow.component.menubar.MenuBar;
import com.vaadin.flow.component.notification.Notification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import ru.spart.password_keeper_web.configuration.Principal;

import java.util.ArrayList;

public class Menu extends MenuBar {

    public Menu() {
//    Text selected = new Text("");
//    Div message = new Div(new Text("Selected: "), selected);

        MenuItem secrets = addItem("Secrets");
        MenuItem documents = addItem("Documents");
        MenuItem signOut = addItem("Sign Out, "+getUserName()); // e -> sendNotification("Sign Out"));


        secrets.addClickListener(event -> routeToSecrets());
        documents.addClickListener(event -> routeToDocuments());
        signOut.addClickListener(event -> signOut());

//        SubMenu projectSubMenu = project.getSubMenu();
//        MenuItem users = projectSubMenu.addItem("Users");
//        MenuItem billing = projectSubMenu.addItem("Billing");
//
//        SubMenu usersSubMenu = users.getSubMenu();
//        usersSubMenu.addItem("List", e -> selected.setText("List"));
//        usersSubMenu.addItem("Add", e -> selected.setText("Add"));
//
//        SubMenu billingSubMenu = billing.getSubMenu();
//        billingSubMenu.addItem("Invoices", e -> selected.setText("Invoices"));
//        billingSubMenu.addItem("Balance Events",
//                e -> selected.setText("Balance Events"));
//
//        account.getSubMenu().addItem("Edit Profile",
//                e -> selected.setText("Edit Profile"));
//        account.getSubMenu().addItem("Privacy Settings",
//                e -> selected.setText("Privacy Settings"));
    }

    private void routeToSecrets(){
        getUI().ifPresent(ui -> ui.navigate("secrets"));
    }

    private void routeToDocuments(){
        getUI().ifPresent(ui -> ui.navigate("documents"));
    }

    private void signOut(){
        SecurityContextHolder.getContext().setAuthentication(null);
//        Principal principal = new Principal(null,null);
//        new UsernamePasswordAuthenticationToken(principal, null, new ArrayList<>());
        getUI().ifPresent(ui -> ui.navigate("login"));
    }

    private void sendNotification(String message) {
        Notification notification = new Notification();
        notification.setPosition(Notification.Position.MIDDLE);
        notification.show(message);
    }

    private String getUserName(){
        Principal principal = (Principal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getLogin().toUpperCase();
    }
}
