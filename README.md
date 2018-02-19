# Playing with the app

The current deployed code is been deployed at:

https://workoutplanner.herokuapp.com

# Installing dependencies

1. First of all install node js 6.5 or higher (https://nodejs.org/en/download/).
2. Then install the following dependencies (as an administrator):

```
npm install --dev
```

# Compiling and running

* Compile and run tests

```
./build.sh
```

* Starting the node server

```
npm start
```

To install the protocol handler:
- Run this in a developer console window 
-- navigator.registerProtocolHandler("web+wp", "http://workoutplanner.herokuapp.com/?wh=%s", "Workout Planner handler");

# Bugs/Feature requests
- 1min30sec not being parsed properly. e.g. (1min30sec, 105)
- pretty print on the intervals is not very good for repeat and complex intervals
- Can we add a "hint" for * intervals so that it computes IF better?

Server
* Refactor validation of parameters on server.js (params.w && params.ftp && params.tpace ...)
* Make server.js a typescript file

Model
* Fix pretty print
* Macros are not properly replacing content
* Use collections (import * as Collections from 'typescript-collections';)
			// TODO: Start using the hashtable here.
			let m = new Collections.Dictionary<string, DurationUnit>();
			m["mi"] = DistanceUnit.Miles;
typescript-collections": "^1.3.2"

Player:
* Fix play of music on iphone
* Implement next
* Add some sort of highlight or next


