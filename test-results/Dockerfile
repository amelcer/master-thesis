FROM node:22-alpine

WORKDIR /app

COPY . .
RUN npm install

EXPOSE 4201

CMD ["node", "src/server.js"]
