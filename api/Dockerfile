# Build context is the repo root (pnpm workspace lockfile lives there).
FROM node:24-alpine AS build
RUN npm install -g pnpm@11.10.0
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY api/package.json api/
COPY api/prisma api/prisma
COPY api/prisma.config.ts api/
RUN pnpm install --frozen-lockfile --filter api
COPY api/tsconfig.json api/
COPY api/src api/src
RUN pnpm --filter api build

FROM node:24-alpine
WORKDIR /repo/api
ENV NODE_ENV=production
# pnpm links api/node_modules into /repo/node_modules/.pnpm, so both are copied.
# Dev dependencies are kept so the Prisma CLI can run migrations on startup.
COPY --from=build /repo/node_modules /repo/node_modules
COPY --from=build /repo/api/node_modules ./node_modules
COPY --from=build /repo/api/dist ./dist
COPY api/package.json api/prisma.config.ts ./
COPY api/prisma ./prisma
EXPOSE 3000
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/server.js"]
