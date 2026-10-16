FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
ENV GAME_IP=185.207.214.14
ENV PORT=53
EXPOSE 53/udp
CMD ["node", "server.js"]
