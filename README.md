# Proxyscotch

![Test](https://github.com/asomethings/proxyscotch/workflows/Test/badge.svg)
![Release](https://github.com/asomethings/proxyscotch/workflows/Release/badge.svg)

A proxy server for [Hoppscotch](https://github.com/hoppscotch/hoppscotch/). Works same as original [Proxyscotch](https://github.com/hoppscotch/proxyscotch), but based on Node.js/Typescript.

We only use yargs as dependencies to increase performance and lower file size.

## Warning ⚠️

**Not That Fast**: This server is slower than original [Proxyscotch](https://github.com/hoppscotch/proxyscotch) up to 500ms (locally tested).

## Installation

Currently it only support tray icon binaries. (I am planning on server executable with [pkg](https://github.com/vercel/pkg))

You can download binaries from github releases.

## Docker 🐳

```docker
# Pull
docker pull docker.pkg.github.com/asomethings/proxyscotch:latest

# Run
docker run asomethings/proxyscotch:latest -p 80:80
```

## Building 🏗️

1. Clone [Proxyscotch](https://github.com/asomethings/proxyscotch/)
2. Install dependencies `yarn install`

### Server

3. Build using `yarn build`
4. Run server `node dist/main.js`

### Binary (pkg)

3. Create Pacakge `yarn pkg`

## Configurations

Configurations are all optional

`node dist/main.js --token password --host 0.0.0.0 --port 12345 --allowed-origins "https://hoppscotch.io" --banned-outputs "Hello"`

- `token` - Custom token to verificate request
- `host` - Hostname of server
- `port` - Port number of server
- `allowed-origins` - Allowed origins of request
- `banned-outputs` - Banned string that wants to be filtered

### SSL (Including)

`node dist/main.js ssl --key --cert`

- `key` - SSL key file location OR SSL Key
- `cert` - SSL cert file location OR SSL Cert

## Why I'm Building This 🤔

I acknowledge that original [Proxyscotch](https://github.com/hoppscotch/proxyscotch) is blazing fast and well maintained. But since it only supports HTTP Requests(including GraphQL), I wanted to build a proxy that can support all other features of hoppscotch. Also I am planning to add UI like ngrok.

## Coming Soon 🔜

Below tasks are ordered in priority.

- [ ] <strike>Better App Configuration (Electron)</strike> Since Electron was replaced with pkg this task is removed
- [ ] HTTP/2
- [ ] Websocket
- [ ] Server Sent Events
- [ ] Socket.IO
- [ ] MQTT
