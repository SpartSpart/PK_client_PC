package ru.spart.password_keeper_web.constants;

public enum Messages {

    UPLOAD_FAILED("Upload data is failed"),
    UPLOAD_SUCCESS("Upload data successfully done"),

    UPDATE_FAILED("Update data is failed"),
    UPDATE_SUCCESS("Update data successfully done"),

    DOWNLOAD_FAILED("Download data is failed"),
    DOWNLOAD_SUCCESS("Download data successfully done"),

    FILL_ALL_FIELDS("Please fill all fields"),
    CHECK_DOC_NAME("Check document name"),

    PASSWORD_CONFIRMATION_FAILED("Password confirmation is failed"),

    USER_WAS_CREATED("User was created successfully"),

    UNACCEPTABLE_SYMBOLS("Unacceptable symbols"),

    NAME_ALREADY_EXISTS("Name is already exists"),

    USER_ALREADY_EXISTS("User already exists. Choose another Login");

    private final String message;

    Messages(String message) {
        this.message = message;
    }

    public String getMessage(){
        return message.toString();
    }
}
