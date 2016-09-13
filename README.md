# Playing with the app

The current deployed code is been deployed at:

https://workoutplanner.herokuapp.com

# Installing dependencies

1. First of all install node js 6.5 or higher (https://nodejs.org/en/download/).
2. Then install the following dependencies (as an administrator):

```
npm install -g typescript
npm install -g nodemailer
npm install -g browserify
npm install -g react
npm install -g react-dom
npm install -g minifier
npm install -g mysql
npm install -g mocha
```

# Compiling and running

* Compile and run tests

```
build.sh
```

* Starting the node server

```
node ./server.js
```

* Pushing live

```
Its automatically pushed on every commit.
```

# Bugs/Feature requests
* Add builder for UserProfile
* Refactor Intensity

* Auto merge MRC intervals
* Zwift files are broken
* Change output units on sport type
* More logging on usage
* Refactor validation of parameters on server.js
* Add player

Nice to have things
* Add Url shortener
* Suggestion for learning
* [P3] Add free ride do zwift
        <FreeRide Duration="600" FlatRoad="1"/>
* [P3] Add react for generating emails
* Zwift file incorrect quotes '
* pipe (|) missing in Repeat interval
* Ajax TS
* List workouts


# Where to find type definition files:
** https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/node/node.d.ts
