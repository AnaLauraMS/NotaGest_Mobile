FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache bash curl gcompat libstdc++

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_ENV=development
ENV EXPO_USE_DEVTOOLS=false
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

EXPOSE 8081

CMD ["npx", "expo", "start", "--host", "lan"]
