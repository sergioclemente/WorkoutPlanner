#!/bin/bash

rm -rf dist/

npx tsc -p tsconfig.json
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Compiled TSC files

npx mocha dist/test/tests.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Ran Tests

# Bundle now
npx webpack --config webpack.config.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Bundled and minified index.min.js file
