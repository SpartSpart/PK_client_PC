FROM node:16.3.0-alpine

#RUN apk update && \
#    apk upgrade
RUN apk add openjdk8

ENV JAVA_HOME /opt/jdk
ENV PATH ${PATH}:${JAVA_HOME}/bin

WORKDIR /sec_keep_web
ARG JAR_FILE=target/*.jar
ARG JAR=secret-keeper-web.jar
ARG PACKAGE_JSON=./package.json
ARG FRONT_END_VAADING_FILES=frontFiles
ARG VAADIN=vaadin
ARG TARGET=./target

ADD ${TARGET} ./${TARGET}

COPY ${JAR_FILE} ./${TARGET}/${JAR}
COPY ${PACKAGE_JSON} ${PACKAGE_JSON}
COPY ${FRONT_END_VAADING_FILES} ./frontFiles
COPY ${VAADIN} ./vaadin

RUN npm i
RUN mkdir node_modules/@vaadin/flow-frontend
RUN rm -r node_modules/@vaadin
RUN cp -a vaadin node_modules
RUN mv node_modules/vaadin ./@vaadin
RUN cp -a vaadin node_modules
#RUN cp frontFiles/* node_modules/@vaadin/flow-frontend
RUN cp -a node_modules target

ENTRYPOINT ["java","-jar","./target/secret-keeper-web.jar"]
#CMD ["/bin/sh"]

#cp frontFiles/* node_modules/@vaadin/flow-frontend/
