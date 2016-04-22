# Build model files Typescript files
tsc --moduleResolution node --m commonjs --target ES5 --removeComments model.ts ui.ts model_server.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

# Run tests
tsc --module commonjs ./tests.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

node tests.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

# Update type object
tsc --module commonjs ./model.ts -d
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

# Fix a clowny reference
mv model.d.ts type_definitions/model.d.ts
perl -pi -e 's/type_definitions\///g' type_definitions/model.d.ts

# Build JSX files
tsc --moduleResolution node --m commonjs --target ES5 --jsx react app/*.tsx
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

# Combine the files together
browserify model.js ui.js index.js app/*.js -o index.min.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

# From here on everthing will be skipped if in dev mode
if [[ "$DEV" == "true" ]]; then
	echo "Dev mode, skipping final steps" 
	exit 0
fi

# /usr/local/bin/minify --output index.min.js index.min.js
# if [[ "$?" != 0 ]]; then
# 	echo "Build error." 1>&2
# 	exit 1
# fi

