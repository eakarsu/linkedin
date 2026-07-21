FROM node:24.1.0-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS builder
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG NEXTAUTH_SECRET=container-build-secret-with-at-least-32-characters
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
COPY . .
RUN npx prisma generate && npm run build

FROM dependencies AS migrator
ENV NODE_ENV=production
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24.1.0-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
