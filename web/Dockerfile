# Build context is the repo root (pnpm workspace lockfile lives there).
FROM node:24-alpine AS build
RUN npm install -g pnpm@11.10.0
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY web/package.json web/
RUN pnpm install --frozen-lockfile --filter web
COPY web web
RUN pnpm --filter web build

FROM nginx:1.29-alpine
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/web/dist/web/browser /usr/share/nginx/html
EXPOSE 80
