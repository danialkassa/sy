@echo off
setlocal enabledelayedexpansion
set ROOT=C:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\_grav-export\user\pages\02.products

for /r "%ROOT%" %%f in (product.md) do (
    set "tmp=%%f.tmp"
    > "!tmp!" (
        for /f "usebackq tokens=1,* delims=: " %%a in ("%%f") do (
            if "%%a"=="name" (
                echo title: %%b
            ) else if "%%a"=="slug" (
                rem skip
            ) else (
                set "val=%%a: %%b"
                set "val=!val:../images/=!"
                echo !val!
            )
        )
    )
    if exist "!tmp!" move /y "!tmp!" "%%f" >nul
)

echo Done fixing all product files.
