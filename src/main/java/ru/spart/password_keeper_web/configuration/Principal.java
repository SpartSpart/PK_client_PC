package ru.spart.password_keeper_web.configuration;


public class Principal {

    private final String login;
    private final String remoteSessionId;

    public Principal(String login, String remoteSessionId) {
        this.login = login;
        this.remoteSessionId = remoteSessionId;
    }


    public String getLogin() {
        return login;
    }

    public String getRemoteSessionId() {
        return remoteSessionId;
    }
}
