package ru.spart.password_keeper_web.ui.views.component;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class CustomFileInputStream extends FileInputStream {
    private File file;
    public CustomFileInputStream(String fileName) throws FileNotFoundException {
        this(new File(fileName));
    }
    public CustomFileInputStream(File file) throws FileNotFoundException{
        super(file);
        this.file = file;
    }

    public void close() throws IOException {
        try {
            super.close();
        } finally {
            if(file!= null) {
                file.delete();
                file = null;
            }
        }
    }
}
