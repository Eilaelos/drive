# Build from the repository root:
#   docker build -f bots/darkwar-redeem-bot/Dockerfile -t darkwar-redeem-bot .
FROM node:20-alpine
WORKDIR /app
COPY tools/darkwar-autoredeem/redeem.mjs tools/darkwar-autoredeem/redeem.mjs
COPY bots/darkwar-redeem-bot/package*.json bots/darkwar-redeem-bot/
RUN cd bots/darkwar-redeem-bot && npm install --omit=dev --no-audit --no-fund
COPY bots/darkwar-redeem-bot/src bots/darkwar-redeem-bot/src
WORKDIR /app/bots/darkwar-redeem-bot
ENV DATA_FILE=/data/db.json
RUN mkdir -p /data && chown node:node /data
VOLUME /data
USER node
CMD ["node", "src/index.js"]
