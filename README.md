# Glimpse Client

[![Build Status](https://travis-ci.org/Glimpse/Glimpse.Client.Prototype.svg?branch=master)](https://travis-ci.org/Glimpse/Glimpse.Client.Prototype)

Glimpse provides real time diagnostics & insights to the fingertips of
hundreds of thousands of developers daily. This is the client which runs in the
browser, which the user interacts with and reports back to the server.

# Contribute

The main purpose of this repository is to continue to evolve Glimpse.Client core,
making it faster and easier to use. If you're interested in helping with
that, then keep reading. If you're not interested in helping right now that's
ok too. :) Any feedback you have about using the Glimpse Client would be
greatly appreciated.

## Build

The process to build `glimpse.[xyz].js` (and its related files) is built
entirely on top of node.js, using many libraries you may already be familiar
 with.

### Prerequisites

The Glimpse Client heavily relies on `Node` and `npm` for its
build process. Hence,

* You have `node` [installed](nodejs.org) at v0.10.0+ (it might work at lower versions, we just haven't tested).

### Cloning Repository

Assuming you have [Git](http://git-scm.com/) installed, clone a copy of the
Glimpse.Client git repo by running:

```sh
git clone https://github.com/Glimpse/Glimpse.Client.Prototype.git
```

### Getting Running

Open a command prompt in the Glimpse.Client.Prototype directory.

**Install dependencies**

To install or update dependencies, run:

```sh
npm install
```

To install TypeScript type definitions, run:

```sh
typings install
```

**Compile the Client**

To build and package glimpse, run:

```sh
npm run build
```

At this point, you should now have a `dist` directory populated
with the packaged files.

**Compile the Client and start Dev environement**

If you are actively developing the client, the `start` task will provide you with
everything you need:

```sh
npm start
```

This does everything that `npm run build` does, but also sets starts up a dev
server, starts watchers which will recompile the Client as changes are made and
live reload those changes into the test app.

If you want to see the client in action with a "fake server", you can modify the `FAKE_SERVER` setting  to `true` in the `webpack.config.js` file.

### Test Running

To run tests:

```sh
npm run test
```

## Components

The Glimpse client is broken into 3 primary components or applications:

 - **Glimpse Application** - Pages that detailed data will be viewed through
 - **Glimpse Agent** - Lightweight agent that will send data back from the client to the server
 - **Glimpse Display** - Display that sits in the users site and provides ongoing feedback (aka HUD)

 *More details coming*
 
 ---
 
 This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
