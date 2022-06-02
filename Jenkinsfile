pipeline {
    agent any

    stages {
        stage('Clean_Build') {
            steps {
              	    sh 'mvn clean package'
            }
        }
        stage ('Docker job'){
            steps {
                    sh 'docker build -t password-keeper-web:1.0.0 .'
                    sh 'docker stop password-keeper-web || true && docker rm password-keeper-web || true'
                    sh 'docker run -it --net=host -p 8082:8082 --name password-keeper-web password-keeper-web:1.0.0'
            }
        }
    }
}
