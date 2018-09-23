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
-- navigator.registerProtocolHandler("web+wp", "http://<url>/?wh=%s", "Workout Planner handler");


// 
Not properly formatting

(15min, 80)4[(1km, 92)]"1'20'' rest between"(5min, 80)4[(1km, 95.8)]"1'20'' rest between"(10min, 80)



# Bugs/Feature requests
- Add 4x25 sprint on the bike swim sets
- Add specific cadence work on warmup
- Add more drills on the swim
- 1min30sec not being parsed properly. e.g. (1min30sec, 105)
- Remove TSS or TSS(R) 
- Couple of TODO's in the test.ts (They are bugs)

- Implement cadence intervals #c()
- Can we add a "hint" for * intervals so that it computes IF better?

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
* Implement next
* Add some sort of highlight or next

Bug on graph
```
(5min, *, 90rpm - Smooth pedaling)
(2min, *, 95rpm - Smooth pedaling)
(2min, *, 100rpm - Smooth pedaling)
(2min, *, 105rpm - Smooth pedaling)
(1:30min, *, 110rpm - Smooth pedaling)
(30sec, *, 120-130rpm - Maintain form)
(2min, *, 90rpm - Relax and recover)
(6sec, *, Max rev out)
(1min, *, 90rpm - Smooth pedaling)
(6sec, *, Max rev out)
(1min, *, 90rpm - Smooth pedaling)
(6sec, *, Max rev out)
(2:42min, *, 90 rpm - Relax and recover)
2[(4min, 60, cadence 80rpm), (3min, 65, cadence 90rpm), (2min, 70, cadence 100rpm), (1min, 75, cadence 110rpm)]
4[(2min, 90), (3min, 55)]
```