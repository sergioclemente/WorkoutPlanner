tsc --module commonjs ./model.ts -d
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

mv model.d.ts type_definitions/model.d.ts
perl -pi -e 's/type_definitions\///g' type_definitions/model.d.ts

# Build regular Typescript files
tsc --moduleResolution node --m commonjs --target ES5 --removeComments model.ts ui.ts model_server.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

# Build JSX files
tsc --moduleResolution node --m commonjs --target ES5 --jsx react app/*.tsx
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

browserify model.js ui.js index.js app/*.js -o index.min.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

tsc --module commonjs ./tests.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

node tests.js