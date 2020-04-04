package ru.spart.password_keeper_web.model;

public class Note {
        private Long id;
        private String note;

    public Note(Long id, String note) {
        this.id = id;
        this.note = note;
    }

    public Note(String note) {
        this.note = note;
    }

    public Note() {

    }

    public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }


        public String getNote() {
            return note;
        }

        public void setNote(String note) {
            this.note = note;
        }

}
