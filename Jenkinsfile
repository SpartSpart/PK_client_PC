pipeline {
    agent none

    stages {
        stage('Clean_Build_QA') {
        agent {
                label "qa_agent1"
        }
            steps {
              	    sh 'mvn clean package'
            }
        }
        stage ('Docker_Job_QA'){
        agent {
                label "qa_agent1"
        }
            steps {
                    sh 'docker build -t password-keeper-web:1.0.1 .'
                    sh 'docker stop password-keeper-web || true && docker rm password-keeper-web || true'
                    sh 'docker run -d --net=host -p 8082:8082 --name password-keeper-web password-keeper-web:1.0.1'
            }
        }
                stage('Clean_Build_DEV') {
                agent {
                        label "dev_agent2"
                }
                    steps {
                      	    sh 'mvn clean package'
                    }
                }
                stage ('Docker_Job_DEV'){
                agent {
                        label "dev_agent2"
                }
                    steps {
                            sh 'docker build -t password-keeper-web:1.0.1 .'
                            sh 'docker stop password-keeper-web || true && docker rm password-keeper-web || true'
                            sh 'docker run -d --net=host -p 8082:8082 --name password-keeper-web password-keeper-web:1.0.1'
                    }
                }
    }
}
