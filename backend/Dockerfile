FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN mkdir -p data

EXPOSE 3001
CMD ["node", "dist/index.js"]
