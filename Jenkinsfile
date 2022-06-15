pipeline {
agent any
    environment {
            DOCKERHUB=credentials('dockerhub')
            TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage('Clean_Build_DEV') {
        agent {
          label "dev_agent2"
        }
            steps {
              	    sh 'mvn clean package'
            }
        }
        stage('Clean_Build_QA') {
        agent {
          label "qa_agent1"
        }
            steps {
              	    sh 'mvn clean package'
            }
        }
///
        stage ('Docker_build'){
        agent any
            steps {
                    sh 'docker build -t password-keeper-web:1.0.$TAG .'
                    sh 'docker tag password-keeper-web:1.0.$TAG spartspart/password-keeper-web:1.0.$TAG';
            }
        }
        stage ('Docker_push_dockerhub'){
        agent any
             steps {
                    sh 'echo $DOCKERHUB_PSW | docker login -u $DOCKERHUB_USR --password-stdin'
                    sh 'docker push spartspart/password-keeper-web:1.0.$TAG'
             }
        }
///
        stage ('Docker_Deploy_DEV'){
            agent {
                label "dev_agent2"
            }
            steps {
                    sh 'docker build -t password-keeper-web:1.0.$TAG .'
                    sh 'docker stop password-keeper-web || true && docker rm password-keeper-web || true'
                    sh 'docker run -d --net=host -p 8082:8082 --name password-keeper-web password-keeper-web:1.0.$TAG'
            }
        }

        stage ('Docker_Deploy_QA'){
            agent {
               label "qa_agent1"
            }
            steps {
                    sh 'docker build -t password-keeper-web:1.0.$TAG .'
                    sh 'docker stop password-keeper-web || true && docker rm password-keeper-web || true'
                    sh 'docker run -d --net=host -p 8082:8082 --name password-keeper-web password-keeper-web:1.0.$TAG'
            }
        }
    }
}
