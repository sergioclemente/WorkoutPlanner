#!/bin/bash

tsc -p tsconfig.json
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Compiled TSC files

node_modules/mocha/bin/mocha dist/tests.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Ran Tests

# Copy static files directly to dist folder
cp index.* dist/
cp canvasjs.min.js dist/
cp fixed-data-table.css dist/
cp sql/app.db dist/app.db

# Bundle now
node_modules/webpack/bin/webpack.js dist/index.js --output-filename index.min.js --output-path dist/ --mode production
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo Bundled and minified index.min.js file

# node_modules/webpack/bin/webpack.js server.js --output-filename server.min.js
# if [[ "$?" != 0 ]]; then
# 	echo "Build error." 1>&2
# 	exit 1
# fi
# echo Combined javascript files