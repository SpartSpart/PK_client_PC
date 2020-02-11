package ru.spart.password_keeper_web.ui.views.component;

import com.vaadin.flow.component.ComponentEvent;
import com.vaadin.flow.component.ComponentEventListener;
import com.vaadin.flow.component.DomEvent;
import com.vaadin.flow.component.upload.Upload;
import com.vaadin.flow.component.upload.receivers.MultiFileMemoryBuffer;
import com.vaadin.flow.shared.Registration;

public class CustomUpload extends Upload {

    public CustomUpload(MultiFileMemoryBuffer memoryBuffer) {
        super(memoryBuffer);
    }

   public Registration addFileRemoveListener(ComponentEventListener<FileRemoveEvent> listener) {
        return super.addListener(FileRemoveEvent.class, listener);
    }


    @DomEvent("file-remove")
    public static class FileRemoveEvent extends ComponentEvent<Upload> {
        public FileRemoveEvent(Upload source, boolean fromClient) {
            super(source, fromClient);
        }
    }
}