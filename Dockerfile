FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install pm2 -g

COPY . .

CMD ["pm2-runtime", "start", "index.js"]