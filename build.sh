# tsc --module commonjs ./model.ts -d
# TODO: preprocess the file to remove reference to type_definitions
# mv model.d.ts type_definitions/model.d.ts

tsc --module commonjs ./model.ts --removeComments
tsc --module system ./ui.ts --removeComments

tsc --module commonjs ./tests.ts
node tests.js