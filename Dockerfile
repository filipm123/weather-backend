FROM node:18.8.0

WORKDIR /usr/src/app

COPY . . 

RUN npm install

CMD ["npm", "run" ,"start:dev"]

