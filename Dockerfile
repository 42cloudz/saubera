# Saubera: one Node container. Astro prerenders the pages, server.mjs serves them and the form API.
# Data (SQLite) lives in /data, in the cluster a persistent volume.

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Unit tests, typecheck and the production build.
RUN npm test && npx astro check && npm run build && npm prune --omit=dev

FROM node:24-slim
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data NODE_NO_WARNINGS=1
WORKDIR /app
COPY --from=build /app/package.json /app/server.mjs ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8080
VOLUME /data
CMD ["node", "server.mjs"]
