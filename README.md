# Installing dependencies

First of all install node js. Then install the following dependencies:


```
npm install -g typescript
npm install nodemailer
```

# Compiling and running

* Compile

```
tsc --module commonjs ./MyMath.ts ./model.ts ./tests.ts
```

* Running the tests

```
node tests.js
```

* Starting the node server

```
node ./server.js
```

* Pushing live

```
git push heroku master
```

# Known Bugs
* server should log status and error more cleanly. this includes emails as well
* Fix bug with TSS/IF calculation

# Feature requests
* the url generation wt=...&tp=...&ftp=...
* Initial link with url parameters should override local storage, specially for new users
* Add average speed as a profile entity
* Extract speed estimation (consider weight, altitude and drag coefficient)
* Refactor getMRCFile into a visitor
* Refactor ZwiftDataVisitor to move finalize() into the base
* Add training zones
* Fix running training zones

```
Z2:
(1min, 77)
(1min, 87)

Z3:
(1min, 88)
(1min, 94)

Z4:
(1min, 95)
(1min, 101)
```