FROM node:16.3.0-alpine

RUN apk add openjdk8

ENV JAVA_HOME /opt/jdk
ENV PATH ${PATH}:${JAVA_HOME}/bin

ARG JAR_FILE=target/password_keeper_web*.jar

WORKDIR /sec_keep_web
ARG JAR=secret-keeper-web.jar

COPY ${JAR_FILE} ./${JAR}

ENTRYPOINT ["java","-jar","./secret-keeper-web.jar"]
#CMD ["/bin/sh"]

#cp frontFiles/* node_modules/@vaadin/flow-frontend/
