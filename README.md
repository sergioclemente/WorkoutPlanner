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

* Configure the email info in config.js

```
config.smtp.login = "yourgmailaccount@gmail.com";
config.smtp.password = "yourgmailpassword";
```

* Starting the node server

```
node ./server.js
```


# Known Bugs
* server should log status and error more cleanly. this includes emails as well
* Fix bug with TSS/IF calculation
* Fix heroku deployment

# Feature requests
* the url generation wt=...&tp=...&ftp=...
* Initial link with url parameters should override local storage, specially for new users
* Add average speed as a profile entity
* Extract speed estimation (consider weight, altitude and drag coefficient)
* Generate zwift files
