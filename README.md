# Playing with the app

The current deployed code is been deployed at:

https://intense-thicket-9526.herokuapp.com

# Installing dependencies

First of all install node js. Then install the following dependencies:


```
npm install -g typescript
npm install nodemailer
npm install browserify
npm install minifier
npm install react
npm install react-dom
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
git push heroku master
```

# Bugs/Feature requests
* [P2] Be more forgiving in the UI and show validation errors
** Pace validation
** Form validation
* Graphs as react
* Workoutimput as react
* Workoutview as react
* Add Url shortener


* [P3] server should log status and error more cleanly. this includes emails as well
* [P3] Remove distance estimation	
* [P3] Extract speed estimation (consider weight, altitude and drag coefficient)
* [P3] Refactor getMRCFile into a visitor
* [P3] Refactor ZwiftDataVisitor to move finalize() into the base
* [P3] Add free ride do zwift
        <FreeRide Duration="600" FlatRoad="1"/>
* [P3] Add react for generating emails


# Where to find type definition files:
** https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/node/node.d.ts
