uno build android -c Release
$data = Get-Content .\build\Android\Release\app\src\main\AndroidManifest.xml  | % { $_ -replace '<uses-permission android:name="android.permission.CALL_PHONE" />', "" }| % { $_ -replace "\r", "" }
$data | Out-File .\build\Android\Release\app\src\main\AndroidManifest.xml
.\build\Android\Release\build.bat
Invoke-Item .\build\Android\Release