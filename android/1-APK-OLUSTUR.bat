@echo off
chcp 65001 >nul
title Q-Commerce APK Derleyici
color 0A
cls
echo ===================================================================
echo               Q-COMMERCE ANDROID APK OLUSTURUCU
echo ===================================================================
echo.
echo [1/3] Calisma dizini ayarlaniyor...
cd /d "%~dp0"
if exist "android\gradlew.bat" (
    cd android
)

if not exist "gradlew.bat" (
    echo [HATA] gradlew.bat bulunamadi! Lutfen bu dosyayi 'android' klasorunde calistirin.
    pause
    exit /b 1
)

echo [2/3] Gradle ile APK derleme islemi baslatildi...
echo       (Ilk calistirmada bagimliliklar indirilecegi icin 1-3 dakika surebilir)
echo.
call gradlew.bat :app:assemble

if %ERRORLEVEL% EQU 0 (
    cls
    color 0A
    echo ===================================================================
    echo                [TEBRIKLER] APK BASARIYLA OLUSTURULDU!
    echo ===================================================================
    echo.
    echo APK Konumu:
    echo %CD%\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Klasor simdi otomatik olarak aciliyor...
    echo ===================================================================
    echo.
    if exist "app\build\outputs\apk\debug" (
        explorer "app\build\outputs\apk\debug"
    )
) else (
    cls
    color 0C
    echo ===================================================================
    echo                   [HATA] APK DERLENEMEDI
    echo ===================================================================
    echo.
    echo Cozum Adimlari:
    echo 1. Android Studio'yu acip File ^> Open ile bu "android" klasorunu secin.
    echo 2. Gradle senkronizasyonunun (sag ustteki fil simgesi) bitmesini bekleyin.
    echo    .\gradlew assemble
    echo    veya Android Studio icinde: Build ^> Make Project (Ctrl+F9)
    echo ===================================================================
)

echo.
pause
