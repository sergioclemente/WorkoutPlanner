# Build model files Typescript files
JS_TARGET="ES6"

tsc --moduleResolution node --m commonjs --target ${JS_TARGET} --removeComments model.ts ui.ts model_server.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo "Compiled TSC files"

tsc --module commonjs --target ${JS_TARGET} ./tests.ts
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo "Compiled Tests"

node --harmony tests.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
echo "Ran Tests"

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
tsc --moduleResolution node --m commonjs --target ${JS_TARGET} --jsx react app/*.tsx
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

# Combine the files together
# TODO: be smart so it doesnt have to browserify/minify for each page
browserify model.js ui.js index.js app/*.js -o index.min.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

browserify model.js ui.js workouts_view.js app/*.js -o workouts_view.min.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi


# From here on everthing will be skipped if in dev mode
if [[ "$DEV" == "true" ]]; then
	echo "Dev mode, skipping final steps" 
	exit 0
fi

/usr/local/bin/minify --output index.min.js index.min.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi

/usr/local/bin/minify --output workouts_view.min.js workouts_view.min.js
if [[ "$?" != 0 ]]; then
	echo "Build error." 1>&2
	exit 1
fi
