[![CI](https://github.com/sergioclemente/WorkoutPlanner/actions/workflows/ci.yml/badge.svg)](https://github.com/sergioclemente/WorkoutPlanner/actions/workflows/ci.yml)

# Installing dependencies

1. Install node js 6.9 or higher (https://nodejs.org/en/download/).
2. Open the command line as an administrator and type:

```
npm install --dev
```

# Compiling and running

* Compile and run tests

```
npm test
```

* Starting the node server

```
npm start
```

To install the protocol handler:
- Run this in a developer console window 
-- navigator.registerProtocolHandler("web+wp", "http://<url>/?wh=%s", "Workout Planner handler");

# Bugs/Feature requests
Server
* Refactor validation of parameters on server.js (params.w && params.ftp && params.tpace ...)

Model
* Use collections (import * as Collections from 'typescript-collections';)
			// TODO: Start using the hashtable here.
			let m = new Collections.Dictionary<string, DurationUnit>();
			m["mi"] = DistanceUnit.Miles;
typescript-collections": "^1.3.2"

Player:
* Fix play of music on iphone
* Add some sort of highlight or next
