import os
import zipfile
import stat

def create_zip():
    zip_targets = [
        'public/hataymarket-android-studio-project.zip',
        'public/qcommerce-android-studio-project.zip',
        'dist/hataymarket-android-studio-project.zip',
        'dist/qcommerce-android-studio-project.zip'
    ]
    
    # We will build in a temporary file first
    temp_zip = 'temp_android_project.zip'
    if os.path.exists(temp_zip):
        os.remove(temp_zip)

    # Files and folders to exclude
    exclude_prefixes = (
        'android/.gradle/',
        'android/build/',
        'android/app/build/',
        'android/capacitor-android/build/',
        'android/capacitor-cordova-android-plugins/',
        'android/capacitor.settings.gradle'
    )

    with zipfile.ZipFile(temp_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        # Add root helper files
        for extra in ('capacitor.config.json', '1-APK-OLUSTUR.bat', '2-GOOGLE-PLAY-AAB-OLUSTUR.bat', 'BENI-OKU.txt'):
            if os.path.exists(extra):
                zf.write(extra, extra)

        # Add android folder
        for root, dirs, files in os.walk('android'):
            # Filter dirs
            dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'build']
            
            for file in files:
                file_path = os.path.join(root, file)
                # Normalize path with forward slashes
                rel_path = os.path.normpath(file_path).replace('\\', '/')
                
                if any(rel_path.startswith(ex) for ex in exclude_prefixes):
                    continue
                if file.endswith('.zip') or file.startswith('.'):
                    continue

                # Set standard permission bits (e.g. executable for gradlew)
                zinfo = zipfile.ZipInfo.from_file(file_path, rel_path)
                if file in ('gradlew', 'gradlew.bat'):
                    zinfo.external_attr = (stat.S_IRWXU | stat.S_IRGRP | stat.S_IXGRP | stat.S_IROTH | stat.S_IXOTH) << 16
                else:
                    zinfo.external_attr = (stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH) << 16
                
                with open(file_path, 'rb') as f:
                    zf.writestr(zinfo, f.read())

    print(f"Created {temp_zip}, size: {os.path.getsize(temp_zip)} bytes")
    
    # Copy to target destinations
    for target in zip_targets:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(temp_zip, 'rb') as src, open(target, 'wb') as dst:
            dst.write(src.read())
        print(f"Updated {target}")

    os.remove(temp_zip)
    print("All ZIPs generated successfully!")

if __name__ == '__main__':
    create_zip()
