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
- Add lapcount complexity
- Make long repeated series easier to read
- Derek+ is not properly calculating distance

Server
* Add authentication
* Refactor validation of parameters on server.js
* Make node.js a typescript file
* Move to kubernetes

Workout View
* Don't require a title for validating
* add the hability for named groups (warmup/mainset/cooldown) - workaround today is comments

Player:
* Fix play of music on iphone
* Implement next
* Add some sort of highlight or next

* Refactor Intensity
* refactor
        stringFormat
        DateHelper
        SpeedParser
        remove StopWatch
        remove ArrayIterator
        factory for UserProfile from UI.QueryParams
        refactor file generation to just depend on the workout.

# Where to find type definition files:
** https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/node/node.d.ts
