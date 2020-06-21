#!/bin/bash

rm -rf dist/

node_modules/typescript/bin/tsc -p tsconfig.json
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Compiled TSC files

node_modules/mocha/bin/mocha dist/test/tests.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Ran Tests

# Bundle now
node_modules/webpack/bin/webpack.js --config webpack.config.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Bundled and minified index.min.js file