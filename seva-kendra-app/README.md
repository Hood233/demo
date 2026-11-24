# Seva Kendra App (Android)

Online form-fill center (PAN, Passport, BC/SC certificate, Niwas, Aay Praman, Exam form)
aur stationery dukaan ke liye Android app.

## App mein kya hai

| Screen | Kaam |
|---|---|
| 🏠 Home | Saari services, suchna banner, stationery, Call / WhatsApp / Map buttons |
| 📝 Service | Kaam chuno (Naya / Correction…), documents ki photo/PDF lagao, naam-mobile bharo, fees dekho |
| 💳 Pay | UPI app (GPay / PhonePe / Paytm) amount bhar kar khulta hai |
| 📤 Submit | Form ki details + saare documents seedha dukaan ke **WhatsApp** par chale jaate hain |
| 📋 Meri Apps | Customer ke bheje hue form, ID ke saath, aur "status poochho" button |
| 🛒 Shop | Stationery, cart, Pickup / Home delivery, WhatsApp par order |
| 👤 Profile | Customer ka naam/mobile/pata save (form mein apne aap bhar jaata hai) |

Is pehle version mein koi server ya monthly kharcha nahi hai. Saare order aapke WhatsApp par aate hain.

## Apni dukaan ki settings (sirf ek file)

`app/src/main/java/com/sevakendra/app/data/ShopConfig.kt` kholo aur badlo:

- `SHOP_NAME`: dukaan ka naam
- `OWNER_WHATSAPP`: jis number par order aayein, `91` + 10 digit (jaise `919812345678`)
- `OWNER_CALL`: call ke liye number
- `UPI_ID`: aapki UPI ID (jaise `sharma@okaxis`)
- `ADDRESS`, `TIMINGS`, `NOTICE_TITLE`, `NOTICE_TEXT`
- `services`: har service ke documents, sarkari fees aur seva charge
- `products`: stationery ka naam aur daam

App mein dikhayi gayi fees sirf example hain. Apne hisaab se sahi fees zaroor bharein.

## APK kaise banayein

1. [Android Studio](https://developer.android.com/studio) install karo.
2. **File → Open** karke `seva-kendra-app` folder kholo aur Gradle sync hone do.
3. **Build → Build App Bundle(s) / APK(s) → Build APK(s)** chalao.
4. APK yahan banega: `app/build/outputs/apk/debug/app-debug.apk`. Ise phone par bhejo aur install karo.

Play Store par daalne ke liye **Build → Generate Signed App Bundle** se `.aab` file banao.

Command line se build karna ho (Android SDK install hona chahiye):

```bash
./gradlew assembleDebug
```

## Screens check karna (bina phone ke)

```bash
./gradlew recordPaparazziDebug   # app/src/test/snapshots/images/ mein screenshots banenge
./gradlew verifyPaparazziDebug   # design badla to test fail hoga
```

## Requirements

- Android 8.0 (API 26) ya usse naya
- Customer ke phone mein WhatsApp aur koi UPI app

## Aage kya add ho sakta hai (version 2)

- Firebase backend: owner app se status badlo aur customer ko live dikhe
- Payment gateway (Razorpay), jisse payment apne aap verify ho
- Certificate ki PDF app mein hi download ho
- Owner/Admin app: aaj ke orders aur kamai ka hisaab
