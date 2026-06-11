@echo off
setlocal enabledelayedexpansion

set BASE=C:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website

:: Combo Kits
call :convert %BASE%\content\products\SY-CK-2PC-DRL.md %BASE%\_grav-export\user\pages\02.products\combo-kits\SY-CK-2PC-DRL\product.md
call :convert %BASE%\content\products\SY-CK-2PC-GRN.md %BASE%\_grav-export\user\pages\02.products\combo-kits\SY-CK-2PC-GRN\product.md
call :convert %BASE%\content\products\SY-CK-3PC-HOM.md %BASE%\_grav-export\user\pages\02.products\combo-kits\SY-CK-3PC-HOM\product.md
call :convert %BASE%\content\products\SY-CK-3PC-OAK.md %BASE%\_grav-export\user\pages\02.products\combo-kits\SY-CK-3PC-OAK\product.md
call :convert %BASE%\content\products\SY-CK-4PC-CON.md %BASE%\_grav-export\user\pages\02.products\combo-kits\SY-CK-4PC-CON\product.md
call :convert %BASE%\content\products\SY-CK-5PC-ELE.md %BASE%\_grav-export\user\pages\02.products\combo-kits\SY-CK-5PC-ELE\product.md
call :convert %BASE%\content\products\SY-CK-6PC-20V.md %BASE%\_grav-export\user\pages\02.products\combo-kits\SY-CK-6PC-20V\product.md
call :convert %BASE%\content\products\SY-CK-8PC-PRO.md %BASE%\_grav-export\user\pages\02.products\combo-kits\SY-CK-8PC-PRO\product.md

:: Drills & Drivers
call :convert %BASE%\content\products\SY-DD-20V-BL.md %BASE%\_grav-export\user\pages\02.products\drills-drivers\SY-DD-20V-BL\product.md
call :convert %BASE%\content\products\SY-DD-CRD-HMR.md %BASE%\_grav-export\user\pages\02.products\drills-drivers\SY-DD-CRD-HMR\product.md
call :convert %BASE%\content\products\SY-DD-MIX-KIT.md %BASE%\_grav-export\user\pages\02.products\drills-drivers\SY-DD-MIX-KIT\product.md
call :convert %BASE%\content\products\SY-DD-RH-1IN.md %BASE%\_grav-export\user\pages\02.products\drills-drivers\SY-DD-RH-1IN\product.md
call :convert %BASE%\content\products\SY-DD-RH-DEM.md %BASE%\_grav-export\user\pages\02.products\drills-drivers\SY-DD-RH-DEM\product.md
call :convert %BASE%\content\products\SY-DD-RH-DEM2.md %BASE%\_grav-export\user\pages\02.products\drills-drivers\SY-DD-RH-DEM2\product.md
call :convert %BASE%\content\products\SY-DD-RHT-18V.md %BASE%\_grav-export\user\pages\02.products\drills-drivers\SY-DD-RHT-18V\product.md
call :convert %BASE%\content\products\SY-DD-SDS-PLU.md %BASE%\_grav-export\user\pages\02.products\drills-drivers\SY-DD-SDS-PLU\product.md

:: Grinders
call :convert %BASE%\content\products\SY-GR-ANG-4.5.md %BASE%\_grav-export\user\pages\02.products\grinders\SY-GR-ANG-4.5\product.md
call :convert %BASE%\content\products\SY-GR-ANG-7IN.md %BASE%\_grav-export\user\pages\02.products\grinders\SY-GR-ANG-7IN\product.md
call :convert %BASE%\content\products\SY-GR-BCH-6IN.md %BASE%\_grav-export\user\pages\02.products\grinders\SY-GR-BCH-6IN\product.md
call :convert %BASE%\content\products\SY-GR-BCH-8IN.md %BASE%\_grav-export\user\pages\02.products\grinders\SY-GR-BCH-8IN\product.md
call :convert %BASE%\content\products\SY-GR-CRD-ANG.md %BASE%\_grav-export\user\pages\02.products\grinders\SY-GR-CRD-ANG\product.md
call :convert %BASE%\content\products\SY-GR-DIE-1-4.md %BASE%\_grav-export\user\pages\02.products\grinders\SY-GR-DIE-1-4\product.md
call :convert %BASE%\content\products\SY-GR-POL-6IN.md %BASE%\_grav-export\user\pages\02.products\grinders\SY-GR-POL-6IN\product.md
call :convert %BASE%\content\products\SY-GR-STR-ANG.md %BASE%\_grav-export\user\pages\02.products\grinders\SY-GR-STR-ANG\product.md

:: Impact Tools
call :convert %BASE%\content\products\SY-IT-DRV-1-4.md %BASE%\_grav-export\user\pages\02.products\impact-tools\SY-IT-DRV-1-4\product.md
call :convert %BASE%\content\products\SY-IT-DRV-20V.md %BASE%\_grav-export\user\pages\02.products\impact-tools\SY-IT-DRV-20V\product.md
call :convert %BASE%\content\products\SY-IT-DRV-BRUS.md %BASE%\_grav-export\user\pages\02.products\impact-tools\SY-IT-DRV-BRUS\product.md
call :convert %BASE%\content\products\SY-IT-RCH-20V.md %BASE%\_grav-export\user\pages\02.products\impact-tools\SY-IT-RCH-20V\product.md
call :convert %BASE%\content\products\SY-IT-WRN-18V.md %BASE%\_grav-export\user\pages\02.products\impact-tools\SY-IT-WRN-18V\product.md
call :convert %BASE%\content\products\SY-IT-WRN-20V.md %BASE%\_grav-export\user\pages\02.products\impact-tools\SY-IT-WRN-20V\product.md
call :convert %BASE%\content\products\SY-IT-WRN-3-4.md %BASE%\_grav-export\user\pages\02.products\impact-tools\SY-IT-WRN-3-4\product.md
call :convert %BASE%\content\products\SY-IT-WRN-CRD.md %BASE%\_grav-export\user\pages\02.products\impact-tools\SY-IT-WRN-CRD\product.md

:: Sanders
call :convert %BASE%\content\products\SY-SA-BLT-3X21.md %BASE%\_grav-export\user\pages\02.products\sanders\SY-SA-BLT-3X21\product.md
call :convert %BASE%\content\products\SY-SA-CRD-ORB.md %BASE%\_grav-export\user\pages\02.products\sanders\SY-SA-CRD-ORB\product.md
call :convert %BASE%\content\products\SY-SA-DSK-5IN.md %BASE%\_grav-export\user\pages\02.products\sanders\SY-SA-DSK-5IN\product.md
call :convert %BASE%\content\products\SY-SA-DTL-2.4.md %BASE%\_grav-export\user\pages\02.products\sanders\SY-SA-DTL-2.4\product.md
call :convert %BASE%\content\products\SY-SA-ORB-5IN.md %BASE%\_grav-export\user\pages\02.products\sanders\SY-SA-ORB-5IN\product.md
call :convert %BASE%\content\products\SY-SA-ORB-6IN.md %BASE%\_grav-export\user\pages\02.products\sanders\SY-SA-ORB-6IN\product.md
call :convert %BASE%\content\products\SY-SA-PLN-3.25.md %BASE%\_grav-export\user\pages\02.products\sanders\SY-SA-PLN-3.25\product.md
call :convert %BASE%\content\products\SY-SA-SHT-1-4.md %BASE%\_grav-export\user\pages\02.products\sanders\SY-SA-SHT-1-4\product.md

:: Saws
call :convert %BASE%\content\products\SY-SW-BAND-9IN.md %BASE%\_grav-export\user\pages\02.products\saws\SY-SW-BAND-9IN\product.md
call :convert %BASE%\content\products\SY-SW-CIR-6.5.md %BASE%\_grav-export\user\pages\02.products\saws\SY-SW-CIR-6.5\product.md
call :convert %BASE%\content\products\SY-SW-CIR-714.md %BASE%\_grav-export\user\pages\02.products\saws\SY-SW-CIR-714\product.md
call :convert %BASE%\content\products\SY-SW-JIG-VAR.md %BASE%\_grav-export\user\pages\02.products\saws\SY-SW-JIG-VAR\product.md
call :convert %BASE%\content\products\SY-SW-MIT-10IN.md %BASE%\_grav-export\user\pages\02.products\saws\SY-SW-MIT-10IN\product.md
call :convert %BASE%\content\products\SY-SW-OSC-MUL.md %BASE%\_grav-export\user\pages\02.products\saws\SY-SW-OSC-MUL\product.md
call :convert %BASE%\content\products\SY-SW-REC-12A.md %BASE%\_grav-export\user\pages\02.products\saws\SY-SW-REC-12A\product.md
call :convert %BASE%\content\products\SY-SW-TAB-10IN.md %BASE%\_grav-export\user\pages\02.products\saws\SY-SW-TAB-10IN\product.md

echo ALL PRODUCTS CONVERTED
goto :eof

:convert
set "src=%~1"
set "dst=%~2"
(for /f "usebackq delims=" %%l in ("%src%") do (
    set "line=%%l"
    setlocal enabledelayedexpansion
    if "!line:~0,5!"=="name:" (echo title:!line:~5!) else if "!line:~0,5!"=="slug:" (rem skip) else (set "line=!line:../images/=!" & echo !line!)
    endlocal
)) > "%dst%"
echo   %~n1 done
goto :eof
