@echo off
chcp 65001 >nul
title HatayMarket Google Play AAB Paketi Derleyici
color 0B
cls
echo ===================================================================
echo       HATAYMARKET GOOGLE PLAY APP BUNDLE (.AAB) DERLEYICI
echo ===================================================================
echo.
echo Bu komut dosyasi Google Play Console'a dogrudan yuklenebilen
echo .aab (Android App Bundle) paketini otomatik olarak olusturur.
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

echo [2/3] Gradle ile Google Play AAB paketi derleniyor...
echo       (Lutfen bekleyin, paket hazirlaniyor...)
echo.
call gradlew.bat :app:bundleRelease

if %ERRORLEVEL% EQU 0 (
    cls
    color 0A
    echo ===================================================================
    echo       [TEBRIKLER] GOOGLE PLAY .AAB PAKETI BASARIYLA DERLENDI!
    echo ===================================================================
    echo.
    echo Google Play Console'a yuklenecek dosyanin konumu:
    echo %CD%\app\build\outputs\bundle\release\app-release.aab
    echo.
    echo Klasor simdi otomatik olarak aciliyor...
    echo ===================================================================
    echo.
    if exist "app\build\outputs\bundle\release" (
        explorer "app\build\outputs\bundle\release"
    )
) else (
    echo.
    echo [BILGI] Release keystore tanimlanmamis olabilir, debug AAB deneniyor...
    call gradlew.bat :app:bundleDebug
    if %ERRORLEVEL% EQU 0 (
        cls
        color 0A
        echo ===================================================================
        echo       [TEBRIKLER] .AAB PAKETI (DEBUG) BASARIYLA DERLENDI!
        echo ===================================================================
        echo.
        echo Konum: %CD%\app\build\outputs\bundle\debug\app-debug.aab
        echo ===================================================================
        if exist "app\build\outputs\bundle\debug" (
            explorer "app\build\outputs\bundle\debug"
        )
    ) else (
        cls
        color 0C
        echo ===================================================================
        echo                   [HATA] AAB DERLENEMEDI
        echo ===================================================================
        echo Cozum: Android Studio icinden Build ^> Generate Signed Bundle / APK
        echo menusunu kullanarak keystore secip AAB paketini cikarabilirsiniz.
        echo ===================================================================
    )
)

echo.
pause
