FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-bookworm-slim
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY ./package.json ./
COPY ./src ./src
COPY ./scripts/healthcheck.js ./scripts/healthcheck.js

RUN mkdir -p /app/logs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
CMD ["node" , "scripts/healthcheck.js"]

EXPOSE 3000
CMD [ "npm", "start" ]
