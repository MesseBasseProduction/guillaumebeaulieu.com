FROM node:16
RUN mkdir /guillaumebeaulieu.com
WORKDIR /guillaumebeaulieu.com
COPY package.json .
RUN npm install --quiet
COPY . .
RUN npm run build
