# base images
FROM node:20.12.0-alpine3.19

#install the ts
RUN npm install -g typescript

#working dir
WORKDIR /src/app



# copy the file which is important to install dependencies

COPY package* /src/app/
COPY tsconfig* /src/app/

#install the dependencies
RUN npm install

#copy all the file 
COPY . /src/app/

RUN npm run build

EXPOSE 3001

#final command tha run when the file run
CMD [ "npm","start" ]