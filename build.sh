tsc --module commonjs ./model.ts -d
mv model.d.ts type_definitions/model.d.ts
perl -pi -e 's/type_definitions\///g' type_definitions/model.d.ts

tsc --module commonjs ./model.ts --removeComments
tsc --module system ./ui.ts --removeComments

tsc --module commonjs ./tests.ts
node tests.js