tsc --moduleResolution node --m commonjs --target ES2015 --jsx react redux.tsx

node_modules/webpack/bin/webpack.js redux.js --mode development --output-filename redux.min.js --output-path .