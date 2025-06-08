FROM node:22.16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev
RUN npm cache clean --force

CMD ["npm", "run", "start:dev"]
