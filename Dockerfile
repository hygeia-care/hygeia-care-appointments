FROM node:16-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json . 

RUN npm install

COPY bin/ ./bin
COPY public ./public
COPY routes/ ./routes
COPY models/ ./models
COPY tests/ ./tests
COPY app.js .
COPY verifyJWTToken.js .
COPY services/ ./services

EXPOSE 3335

CMD npm start

