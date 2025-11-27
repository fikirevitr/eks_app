# 📱 Oniks EKS APP - EAS Build ile APK Oluşturma Rehberi

## 🎯 Genel Bakış

Bu rehber, Expo EAS Build kullanarak **ücretsiz** bir şekilde Android APK oluşturmanızı sağlar.

**Gereksinimler:**
- ✅ Expo hesabı (ücretsiz)
- ✅ Email adresi
- ✅ Terminal/Komut satırı erişimi
- ⏱️ Süre: ~20 dakika

---

## 📋 Adım 1: Expo Hesabı Oluşturma

### 1.1 Expo.dev'e Kaydolun
1. Tarayıcınızda açın: https://expo.dev/signup
2. Email adresinizi girin
3. Kullanıcı adı ve şifre belirleyin
4. "Create Account" butonuna tıklayın
5. Email'inize gelen doğrulama linkine tıklayın

**Önemli:** Kullanıcı adınızı ve şifrenizi bir yere not edin!

---

## 🔧 Adım 2: Terminal'de EAS'a Giriş Yapma

### 2.1 Terminal Açın
Emergent platformunda terminal zaten açık durumda.

### 2.2 EAS'a Login Olun
Terminalde şu komutu çalıştırın:

```bash
cd /app/frontend
npx eas-cli login
```

### 2.3 Giriş Bilgilerini Girin
- **Username or email:** [Expo hesabınızın email'i veya kullanıcı adı]
- **Password:** [Şifreniz]

**Doğrulama:** Başarılı giriş sonrası şöyle bir mesaj görmelisiniz:
```
✔ Logged in as [kullanıcı-adınız]
```

---

## 🏗️ Adım 3: EAS Projesini Konfigüre Etme

### 3.1 EAS Build'i Başlat
```bash
cd /app/frontend
npx eas-cli build:configure
```

Bu komut:
- ✅ `eas.json` dosyası zaten mevcut (biz oluşturduk)
- ✅ Projenizi Expo hesabınıza bağlar
- ✅ Android konfigürasyonunu hazırlar

**Sorular Gelirse:**
- "Would you like to create a new project?" → **Yes** seçin
- "Project name?" → **oniks-eks-app** (veya istediğiniz isim)
- "Android package name?" → **com.oniksbilgi.eksapp** (otomatik gelir)

---

## 📦 Adım 4: APK Build'i Başlatma

### 4.1 Preview Build Başlat (APK)
```bash
npx eas-cli build --platform android --profile preview
```

**Bu komut:**
- Cloud'da Android build sürecini başlatır
- APK dosyası oluşturur (AAB değil)
- Ücretsiz hesapta çalışır

### 4.2 Build Seçenekleri

Komut çalıştıktan sonra size birkaç soru sorulabilir:

**1. "Generate a new Android Keystore?"**
```
✔ Yes
```
*(İlk build için evet deyin, otomatik keystore oluşturulur)*

**2. "Would you like to automatically create an EAS project?"**
```
✔ Yes
```

**3. "Run build on EAS servers?"**
```
✔ Yes
```

### 4.3 Build İlerlemesini Takip Etme

Build başladıktan sonra şöyle bir çıktı göreceksiniz:

```
✔ Build started
Build ID: [bir-id-numarası]
Build URL: https://expo.dev/accounts/[kullanıcı-adı]/projects/oniks-eks-app/builds/[build-id]

You can monitor the build at the URL above.
```

---

## ⏱️ Adım 5: Build'in Tamamlanmasını Bekleme

### 5.1 Build Durumunu Kontrol Etme

**Yöntem 1 - Terminal:**
```bash
npx eas-cli build:list
```

**Yöntem 2 - Web (Önerilen):**
1. Build URL'ini tarayıcınızda açın (yukarıda verilen link)
2. Build ilerlemesini canlı olarak izleyin

### 5.2 Build Aşamaları

Build sırasında şu aşamaları göreceksiniz:

1. ⏳ **Queued** - Sırada bekliyor
2. 🔄 **In Progress** - Build alınıyor
   - Installing dependencies
   - Building JavaScript bundle
   - Compiling Android app
3. ✅ **Finished** - Tamamlandı!

**Toplam Süre:** 10-20 dakika

---

## 📥 Adım 6: APK'yı İndirme

### 6.1 Build Tamamlandığında

Build tamamlandığında terminal'de şöyle bir mesaj göreceksiniz:

```
✔ Build finished
APK: https://expo.dev/artifacts/eas/[artifact-id].apk
```

### 6.2 APK'yı İndirin

**Yöntem 1 - Direkt Link:**
1. Terminal'deki APK linkini kopyalayın
2. Tarayıcınızda açın
3. APK otomatik indirilir

**Yöntem 2 - Expo Dashboard:**
1. https://expo.dev adresine gidin
2. "Projects" → "oniks-eks-app" → "Builds" sekmesine tıklayın
3. En son build'i bulun
4. "Download" butonuna tıklayın

### 6.3 APK Dosya Bilgileri
- **Dosya Adı:** `build-[tarih].apk`
- **Boyut:** ~50-80 MB
- **Format:** Android APK
- **Minimum Android:** 6.0 (API 23)

---

## 📱 Adım 7: APK'yı Telefona Yükleme

### 7.1 APK'yı Telefona Aktarma

**Yöntem 1 - USB Kablo:**
1. Telefonu bilgisayara USB ile bağlayın
2. APK dosyasını telefona kopyalayın

**Yöntem 2 - Email/Cloud:**
1. APK'yı kendinize email ile gönderin
2. Telefondan email'i açıp APK'yı indirin

**Yöntem 3 - QR Kod:**
Expo dashboard'da build sayfasında QR kod gösterilir, telefonla taratabilirsiniz.

### 7.2 "Bilinmeyen Kaynak" İzni Verme

Android'de APK yüklemek için izin gerekir:

1. APK'ya tıklayın
2. "Bu kaynağa izin verilmedi" uyarısı gelirse:
3. "Ayarlar"a gidin
4. "Bu kaynağa izin ver" seçeneğini açın
5. Geri dönüp APK'yı yükleyin

### 7.3 Uygulamayı Yükleme

1. APK dosyasına tıklayın
2. "Yükle" butonuna basın
3. Yükleme tamamlanınca "Aç" deyin

---

## ✅ Başarı Kontrolü

Uygulama yüklendikten sonra:

1. ✅ Uygulama telefon ana ekranında görünür
2. ✅ İkon: EKS logosu
3. ✅ Uygulama adı: "Oniks EKS APP"
4. ✅ İlk açılışta splash screen görünür
5. ✅ Konfigürasyon girişi yapabilirsiniz

---

## 🔄 Yeni Versiyon Oluşturma

Kodda değişiklik yaptığınızda yeni APK oluşturmak için:

```bash
cd /app/frontend

# Versiyon numarasını artırın (opsiyonel)
# app.json dosyasında "version" değerini değiştirin

# Yeni build başlatın
npx eas-cli build --platform android --profile preview
```

---

## 💡 İpuçları ve Notlar

### Ücretsiz Plan Limitleri
- ✅ Ayda 30 build hakkı
- ✅ APK boyutu limiti yok
- ✅ Keystore otomatik yönetimi
- ✅ Build loglarına erişim

### Build Hızlandırma
- İlk build: 15-20 dakika
- Sonraki build'ler: 10-15 dakika (cache sayesinde)

### Keystore Yönetimi
- EAS otomatik keystore oluşturur ve saklar
- Play Store'a yükleme yaparken aynı keystore kullanılır
- Keystore'u kaybetme endişesi yok!

### Build Profilleri
`eas.json` dosyasında 3 profil var:
- **development:** Development build (Expo Go gibi)
- **preview:** Test APK (sizin kullandığınız)
- **production:** Production APK (Play Store için)

---

## 🆘 Sık Karşılaşılan Sorunlar

### "Invalid credentials"
**Çözüm:** `eas login` komutunu tekrar çalıştırın

### "Build failed"
**Çözüm:** Build URL'ini açın ve logları kontrol edin

### "Project not found"
**Çözüm:** `eas build:configure` komutunu tekrar çalıştırın

### "Quota exceeded"
**Çözüm:** Aylık 30 build limitini aştınız, önümüzdeki ay bekleyin

---

## 📞 Destek

### Expo Dokümantasyon
https://docs.expo.dev/build/setup/

### Expo Discord
https://chat.expo.dev/

### Build Dashboard
https://expo.dev/accounts/[kullanıcı-adınız]/projects/oniks-eks-app

---

## 🎉 Özet Komutlar

Tüm süreci tek seferde çalıştırmak için:

```bash
# 1. Frontend klasörüne git
cd /app/frontend

# 2. EAS'a login ol
npx eas-cli login

# 3. Build başlat
npx eas-cli build --platform android --profile preview

# 4. Build durumunu kontrol et
npx eas-cli build:list
```

---

## ✨ Tamamdır!

Artık profesyonel bir Android APK'nız var! 

**Sonraki Adımlar:**
- 🧪 APK'yı test edin
- 🔧 Gerekirse düzeltmeler yapın
- 🚀 Yeni versiyon build alın
- 📱 Play Store'a yükleyin (opsiyonel)

**Başarılar!** 🎊
