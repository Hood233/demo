# Rate Diary – Android APK

`RateDiary.apk` ko phone mein daal kar install karo:
1. APK file phone par download karo (GitHub se, ya WhatsApp/Drive par bhej kar).
2. File kholo. Phone "unknown apps" ki permission maange to **Allow** karo.
3. **Install** dabao. Play Protect warning aaye to "Install anyway" chuno (app Play Store se nahi hai, isliye).

- Android 7.0 ya usse naya phone chahiye.
- Data sirf phone mein save hota hai. App uninstall karoge to data chala jayega – beech beech mein "Excel (CSV) download" dabakar list WhatsApp/Drive par bhej kar rakh lo.
- Internet ki zaroorat nahi.

## Dobara build karna
Android SDK ki zaroorat nahi. Java 17+ aur Python 3 chahiye, aur `TOOLS` folder mein:
`android.jar` (com.google.android:android:4.1.1.4), `dx.jar` (com.jakewharton.android.repackaged:dalvik-dx:16.0.1),
`apksig.jar` (com.android.tools.build:apksig:2.3.0) – teeno Maven Central par hain.

```
TOOLS=/path/to/tools python3 build.py
```
App ka page `../supplier-rates/index.html` se liya jata hai. Update ke liye `build.py` mein `VCODE` badhao.
`release.p12` wahi signing key hai jisse update purani app ke upar install hota hai – ise mat badlo.
