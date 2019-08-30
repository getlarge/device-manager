FROM keymetrics/pm2:latest-alpine

ENV NODE_NAME device-manager

RUN mkdir -p /home/node/$NODE_NAME

COPY src /home/node/$NODE_NAME/src/
COPY package*.json /home/node/$NODE_NAME/
COPY ecosystem.config.js /home/node/$NODE_NAME/
COPY favicon.ico /home/node/$NODE_NAME/
RUN mkdir -p /home/node/$NODE_NAME/storage

WORKDIR /home/node/$NODE_NAME

ENV NPM_CONFIG_LOGLEVEL warn
# RUN npm install
RUN npm ci 
RUN npm run build

CMD ["pm2-runtime", "ecosystem.config.js"]

# USER node