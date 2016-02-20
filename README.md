# Playing with the app

The current deployed code is been deployed at:

https://intense-thicket-9526.herokuapp.com

# Installing dependencies

First of all install node js. Then install the following dependencies:


```
npm install -g typescript
npm install nodemailer
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
* [P3] server should log status and error more cleanly. this includes emails as well
* [P3] Add average speed as a profile entity
* [P3] Extract speed estimation (consider weight, altitude and drag coefficient)
* [P3] Refactor getMRCFile into a visitor
* [P3] Refactor ZwiftDataVisitor to move finalize() into the base
* [P3] Add free ride do zwift
        <FreeRide Duration="600" FlatRoad="1"/>
* [P3] Add react for generating emails
* [P3] Fix running training zones (Still missing zone chart)

# Where to find type definition files:
** https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/node/node.d.ts
