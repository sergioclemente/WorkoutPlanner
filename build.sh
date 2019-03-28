export JS_TARGET=ES2017
# TODO: Enable this option back
# --noUnusedParameters: 
# Problem is in the server.
# --noImplicitThis --strictNullChecks --strictFunctionTypes --noImplicitAny  
export TSC_OPTS="--noImplicitReturns --removeComments --noUnusedLocals --noFallthroughCasesInSwitch --alwaysStrict"

tsc -p tsconfig.json
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Compiled TSC files

node_modules/mocha/bin/mocha tests.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Ran Tests

mv model.d.ts type_definitions/model.d.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Moving model.d.ts type

tsc --moduleResolution node --m commonjs --target ${JS_TARGET} --jsx react app/*.tsx
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Built JSX files

# Change --mode to development in order to get unminified javascript.
node_modules/webpack/bin/webpack.js index.js --output-filename index.min.js --output-path . --mode production
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