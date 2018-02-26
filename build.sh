export JS_TARGET=ES2017
# TODO: Enable this option back
# --noUnusedParameters: 
# Problem is in the server.
# --noImplicitThis --strictNullChecks --strictFunctionTypes --noImplicitAny  
export TSC_OPTS="--noImplicitReturns --removeComments --noUnusedLocals --noFallthroughCasesInSwitch --alwaysStrict"

tsc --moduleResolution node --m commonjs ${TSC_OPTS} --target ${JS_TARGET} --removeComments model.ts ui.ts model_server.ts server.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Compiled TSC files

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
echo Updated type object - Moving file

tsc --module commonjs --target ${JS_TARGET} ./tests.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Compiled Tests

node_modules/mocha/bin/mocha tests.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Ran Tests

tsc --moduleResolution node --m commonjs --target ${JS_TARGET} --jsx react app/*.tsx
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Built JSX files

node_modules/webpack/bin/webpack.js index.js --output-filename index.min.js --output-path . -p
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Bundled and minified index.min.js file

rm app/*.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Removed intermediate files

# node_modules/webpack/bin/webpack.js server.js --output-filename server.min.js
# if [[ "$?" != 0 ]]; then
# 	echo "Build error." 1>&2
# 	exit 1
# fi
# echo Combined javascript files