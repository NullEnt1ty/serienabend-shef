FROM node:20 as build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY ./src ./src
RUN npm run build

FROM node:20
LABEL org.opencontainers.image.source=https://github.com/NullEnt1ty/serienabend-shef
LABEL org.opencontainers.image.licenses=MIT
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=build /app/dist ./dist
CMD ["node", "./dist/app.js"]
