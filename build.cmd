@set JS_TARGET=ES6

call tsc --moduleResolution node --m commonjs --target %JS_TARGET% --removeComments model.ts ui.ts model_server.ts
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Compiled TSC files

call tsc --module commonjs --target %JS_TARGET% ./tests.ts
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Compiled Tests

call mocha tests.js
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Ran Tests

call tsc --module commonjs --target %JS_TARGET% ./model.ts -d
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Updated type object

move model.d.ts type_definitions/model.d.ts
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Fixing reference - Moving file

call perl -p -i.bak -e 's/type_definitions\///g' type_definitions/model.d.ts
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Fixing reference - Applying regex

del type_definitions\model.d.ts.bak
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Fixing reference - Deleting backup file

set jsx_files=none
@call:get_files app\*.tsx jsx_files 
call tsc --moduleResolution node --m commonjs --target %JS_TARGET% --jsx react %jsx_files%
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Built JSX files

@set js_files=none
@call :get_files app\*.js js_files 

call browserify model.js ui.js index.js %js_files% -o index.min.js
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)

call browserify model.js ui.js workouts_view.js %js_files% -o workouts_view.min.js
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)

call browserify model.js ui.js player.js %js_files% -o player.min.js
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Combined javascript files

del "app\*.js"
@if  %ERRORLEVEL% NEQ 0 (goto build_fail)
@echo Removed intermediate files

@echo DID NOT MINIFY FILES

@echo Build succeeded
@exit /b 0


:get_files
    set "files="
    for %%F in (%~1) do call set files=%%files%% "%%F"
    set %~2=%files%
    goto:eof

:build_fail
    echo Build Error
    exit /b 1