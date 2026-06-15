FROM node:22-slim

WORKDIR /app

COPY cuenta_regresiva_mudanza/package.json cuenta_regresiva_mudanza/pnpm-lock.yaml cuenta_regresiva_mudanza/pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY cuenta_regresiva_mudanza/ ./
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "server:start"]
