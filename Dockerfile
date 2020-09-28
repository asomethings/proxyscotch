FROM node:lts-stretch-slim as build

WORKDIR /app
COPY package.json yarn.lock /app/

RUN yarn
# --- 

FROM node:lts-stretch-slim
WORKDIR /app

EXPOSE 80
COPY --from=build /app /app
COPY src /app/src
COPY  tsconfig.json /app/

RUN yarn build

ENTRYPOINT ["node", "dist/main.js"]