FROM node:24-alpine

RUN mkdir /guillaumebeaulieu.com
WORKDIR /guillaumebeaulieu.com

RUN apk add --update --virtual .tmp-deps python3 make g++ && \
    rm -rf /var/cache/apk/*

COPY package.json .
RUN npm install --quiet

COPY . .

RUN npm run build
