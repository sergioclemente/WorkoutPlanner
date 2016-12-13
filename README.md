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
npm install -g fixed-data-table
npm install
```

# Compiling and running

* Compile and run tests

```
./build.sh
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
* make swim workouts more readable
* add the hability for named groups (warmup/mainset/cooldown)
* change output units on sport type
* Make node.js a typescript file
* Refactor validation of parameters on server.js
* add profiles
* add histogram of zones on list of workouts
* move sending email to client side
* Bundle JS more efficiently

* Add builder for UserProfile
* Refactor Intensity
* More logging on usage
* refactor 
        getStringFromDurationUnit
        getStringFromIntensityUnit
        getDurationUnitFromString
        getIntensityUnitFromString
        getIntensityUnit
        isDurationUnit
        isIntensityUnit
        stringFormat
        DateHelper
        SpeedParser
        remove StopWatch
        remove ArrayIterator
        factory for UserProfile from UI.QueryParams
        refactor file generation to just depend on the workout.

# Where to find type definition files:
** https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/node/node.d.ts
