## Introduction

This repository contains code for job interview in Luxonis company. Job offer can be found [here](https://www.jobs.cz/rpd/1594415377). Test task assignment can be found in [ASSIGNMENT.MD](./ASSIGNMENT.md).

## Repository description

Since i applied as Frontend Developer i chose Typescript language. This repository is basic monorepo using [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces). There are following packages:

#### `/cli-client`

A game client that connects to `/server` via unix socket path. It requires username and password (more on passwords later).

#### `/common`

This workspace contains common code that is used across other workspaces.

#### `/server`

Contains server that communicates with clients. Server listens on TCP port and on UNIX socket file. It also contains simple WebSocket proxy that ensures web browser can connect to server.

#### `/spectator`

Web application that connects to `/server` using WebSockets. It displays list of connected clients and allow to see current games progress.

## Running the code

1. install node and npm

Node can be installed several ways, more info can be found [here](https://nodejs.org/en/download/package-manager)

```bash
# installs curl
apt install curl

# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh

# reinitialize bash
bash

# download and install Node.js (you may need to restart the terminal)
nvm install 19

# validate that npm and node are installed
npm -v
node -v
```

2. install dependencies

```bash
# in root of repository folder
npm ci
```

3. run packages

```bash
# in root of repository folder

# run server
npm run server

# run spectator
npm run spectator

# run client
npm run cli-client
```
