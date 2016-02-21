tsc --module commonjs ./model.ts -d
mv model.d.ts type_definitions/model.d.ts
perl -pi -e 's/type_definitions\///g' type_definitions/model.d.ts

tsc --moduleResolution node --m commonjs --target ES5 --removeComments model.ts
tsc --moduleResolution node --m commonjs --target ES5 --removeComments ui.ts
tsc --moduleResolution node --m commonjs --target ES5 --removeComments model_server.ts

browserify model.js ui.js index.js -o index.min.js
browserify model.js ui.js workout_view.js -o workout_view.min.js

tsc --module commonjs ./tests.ts
node tests.js