FROM node:lts-stretch-slim as build

WORKDIR /app
COPY . /app

RUN yarn && yarn build
# --- 

FROM node:lts-stretch-slim
WORKDIR /app

EXPOSE 80
COPY --from=build /app /app

CMD ["node", "dist/main"]