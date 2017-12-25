export JS_TARGET=ES6
export TSC_OPTS="--noUnusedParameters --noImplicitReturns"

tsc --moduleResolution node --m commonjs ${TSC_OPTS} --target ${JS_TARGET} --removeComments model.ts ui.ts model_server.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Compiled TSC files

tsc --module commonjs --target ${JS_TARGET} ./tests.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Compiled Tests

# mocha tests.js
# if [[ "$?" != 0 ]]; then
# 	echo "Build error." 1>&2
# 	exit 1
# fi
# echo Ran Tests

tsc --module commonjs --target ${JS_TARGET} ./model.ts -d
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Updated type object

mv model.d.ts type_definitions/model.d.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Fixing reference - Moving file

perl -p -i.bak -e 's/type_definitions\///g' type_definitions/model.d.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Fixing reference - Applying regex

tsc --moduleResolution node --m commonjs --target ${JS_TARGET} --jsx react app/*.tsx
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Built JSX files

browserify model.js ui.js index.js app/*.js -o index.min.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Combined javascript files

rm app/*.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Removed intermediate files

node node_modules/babili/bin/babili.js --no-comments --compact true --minified --out-file index.min.js index.min.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Minified index.min.js