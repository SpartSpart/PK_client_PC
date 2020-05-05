To depoy project:
1) install node js
2) Create jar file using gradle "package" comand
3) Create directory "web"
4) create inside to directories "jar" and "target"
5) open cmd using administrator, go cd "path to jar directory"
6) npm install or just java -jar "filename.jar"
7) It should create directories: build, config,node_modules,target,package.json,package-lock.json, webpack.config,webpack.generated
8) copy files from target to "web\target"
9) reboot cmd using administrator
10) copy files from project "node_modules\@vaadin\flow-frontend" to "web\jar\node_modules\@vaadin\flow-frontend"
11) cd "web\jar"
12) java -jar "filename.jar"
13) Good luck!=)