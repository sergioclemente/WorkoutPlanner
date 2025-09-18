#!/bin/bash

rm -rf dist/

npx tsc -p tsconfig.json
echo Compiled TSC files

npx mocha dist/test/tests.js
echo Ran Tests

# Bundle now
npx webpack --config webpack.config.js --progress
echo Bundled and minified index.min.js file
