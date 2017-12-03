# Playing with the app

The current deployed code is been deployed at:

https://workoutplanner.herokuapp.com

# Installing dependencies

1. First of all install node js 6.5 or higher (https://nodejs.org/en/download/).
2. Then install the following dependencies (as an administrator):

```
npm install
```

# Compiling and running

* Compile and run tests

```
./build.cmd
```

* Minify (Just before submit)

```
./minify.cmd
```

* Starting the node server

```
npm start
```

* Pushing live

```
Its automatically pushed on every commit.
```

To install the protocol handler:
- Run this in a developer console window 
-- navigator.registerProtocolHandler("web+wp", "http://workoutplanner.herokuapp.com/?wh=%s", "Workout Planner handler");

# Bugs/Feature requests
- Cannot email run workout (Getting a ERR_INCOMPLETE_CHUNKED_ENCODING error)
- 1min30sec not being parsed properly. e.g. (1min30sec, 105)
- Can we add a "hint" for * intervals so that it computes IF better?

Server
* Add authentication
* Refactor validation of parameters on server.js (params.w && params.ftp && params.tpace ...)
* Make server.js a typescript file
* Reduce dependencies (mailgun, sql) to make move to kubernetes easier

Player:
* Fix play of music on iphone
* Implement next
* Add some sort of highlight or next


