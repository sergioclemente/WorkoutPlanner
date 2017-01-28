node .\node_modules\babili\bin\babili.js --no-comments --compact true --minified --out-file index.min.js index.min.js
if  %ERRORLEVEL% NEQ 0 (goto build_fail)

node .\node_modules\babili\bin\babili.js --no-comments --compact true --minified --out-file workouts_view.min.js workouts_view.min.js
if  %ERRORLEVEL% NEQ 0 (goto build_fail)

echo Minification succeeded
exit /b 0

:build_fail
    echo Minification Error
    exit /b 1