# base
FROM oven/bun:1 as base
WORKDIR /usr/src/app


# install
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production


# pre release
FROM install AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY ./src ./src
COPY package.json tsconfig.json ./
ENV NODE_ENV=production
RUN bun typecheck


# release
FROM base AS release
LABEL org.opencontainers.image.source=https://github.com/NullEnt1ty/serienabend-shef
LABEL org.opencontainers.image.licenses=MIT
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/package.json .

USER bun
EXPOSE 3306/tcp
ENTRYPOINT ["bun", "start"]
