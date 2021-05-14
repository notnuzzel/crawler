FROM keymetrics/pm2:latest-alpine
COPY ["package.json", "yarn.lock", "pm2.json", "./"]
ENV NPM_CONFIG_LOGLEVEL warn
RUN yarn install --pure-lockfile
COPY . .
RUN yarn build
RUN ls -al -R
CMD [ "pm2-runtime", "start", "pm2.json" ]
