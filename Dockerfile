FROM node:14
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production
COPY . .
CMD [ "pm2", "start", "worker/index.js", "--name", "worker" ]