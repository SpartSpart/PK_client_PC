package ru.spart.password_keeper_web.configuration.yaml;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties ("spring.server")
public class YamlConfig {

    private String remoteserver;
    private String localserver;

    public void setRemoteserver(String remoteserver) {
        this.remoteserver = remoteserver;
    }

    public String getRemoteserver() {
        return remoteserver;
    }

    public void setLocalserver(String localserver) {
        this.localserver = localserver;
    }

    public String getLocalserver() {
        return localserver;
    }
}
