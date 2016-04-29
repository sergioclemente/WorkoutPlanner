# Playing with the app

The current deployed code is been deployed at:

https://intense-thicket-9526.herokuapp.com

# Installing dependencies

First of all install node js. Then install the following dependencies:


```
npm install -g typescript
npm install nodemailer
npm install browserify
npm install react
npm install react-dom
npm install minifier
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
* Add Url shortener
* [P3] Refactor getMRCFile into a visitor
* [P3] Refactor ZwiftDataVisitor to move finalize() into the base
* [P3] Add free ride do zwift
        <FreeRide Duration="600" FlatRoad="1"/>
* [P3] Add react for generating emails
* Change output units on sport type
* Suggestion for learning
* More logging on usage
* Refactor validation of parameters on server.js
* Ability to save workouts


# Where to find type definition files:
** https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/node/node.d.ts
