FROM node:18 as build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY ./src ./src
RUN npm run build

FROM node:18
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=build /app/dist ./dist
CMD ["node", "./dist/app.js"]
