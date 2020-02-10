package ru.spart.password_keeper_web.model;

public class Doc {
    private Long id;
    private String document;
    private String description;

    public Doc(){

    }

    public Doc(String document, String description) {
        this.document = document;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(String document) {
        this.document = document;
    }
}

