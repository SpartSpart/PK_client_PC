package ru.spart.password_keeper_web.ui.views.exception;

import com.vaadin.flow.component.UI;
import ru.spart.password_keeper_web.constants.Messages;
//
public class SessionEndException extends Exception {
    public SessionEndException(){
        super(Messages.SESSION_END.getMessage());
    }
}
