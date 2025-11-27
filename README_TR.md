# Oniks EKS APP

Raspberry Pi cihazlarını SSH üzerinden uzaktan yönetmek için geliştirilmiş modern bir mobil uygulama.

## Özellikler

- ✨ Modern ve animasyonlu kullanıcı arayüzü
- 📱 Responsive tasarım (telefon ve tablet desteği)
- 🔧 JSON tabanlı dinamik konfig ürasyonu
- 📡 Gerçek zamanlı SSH komut çalıştırma
- 📊 Çoklu sayfa desteği (birden fazla buton grubu)
- ⚙️ Ayarlar ekranı ile kolay yapılandırma güncellemesi
- 💾 Offline çalışma desteği (local cache)
- 🎨 Özelleştirilebilir buton renkleri ve ikonlar

## Teknoloji Stack

### Frontend
- **React Native** + **Expo Router** - Modern mobil uygulama geliştirme
- **Zustand** - State management (hafif ve performanslı)
- **Axios** - HTTP istekleri
- **React Native Reanimated** - Akıcı animasyonlar
- **@expo/vector-icons** - 1000+ icon desteği

### Backend
- **FastAPI** - Hızlı ve modern Python web framework
- **Paramiko** - SSH client kütüphanesi
- **Motor** - Async MongoDB driver
- **Python-SocketIO** - Gerçek zamanlı iletişim (opsiyonel)

## Kurulum

### Gereksinimler
- Node.js 18+ ve Yarn
- Python 3.11+
- MongoDB

### Frontend Kurulumu
```bash
cd frontend
yarn install
yarn start
```

### Backend Kurulumu
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

## JSON Konfig ürasyon Formatı

Uygulamanız için aşağıdaki formatta bir JSON dosyası oluşturun:

```json
{
  "app_name": "Oniks EKS APP",
  "version": "1.0",
  "pages": [
    {
      "pageId": "page_1",
      "pageName": "Ana Kontroller",
      "pageIcon": "home",
      "order": 1
    }
  ],
  "buttons": [
    {
      "id": "btn_1",
      "pageId": "page_1",
      "order": 1,
      "title": "Sistem Yeniden Başlat",
      "subtitle": "Pi'yi restart eder",
      "icon": "refresh-circle",
      "color": "#FF5733",
      "ssh": {
        "host": "192.168.1.100",
        "port": 22,
        "username": "pi",
        "password": "raspberry",
        "command": "sudo reboot"
      }
    }
  ]
}
```

### JSON Alanları Açıklaması

#### Pages (Sayfalar)
- `pageId`: Benzersiz sayfa kimliği
- `pageName`: Sayfanın görünen adı
- `pageIcon`: Ionicons icon ismi (https://icons.expo.fyi/)
- `order`: Sayfa sıralaması (küçükten büyüğe)

#### Buttons (Butonlar)
- `id`: Benzersiz buton kimliği
- `pageId`: Bu butonun hangi sayfada görüneceği
- `order`: Buton sıralaması (küçükten büyüğe)
- `title`: Butonun başlığı
- `subtitle`: Buton açıklaması (opsiyonel)
- `icon`: Ionicons icon ismi
- `color`: Buton rengi (HEX format, ör: #FF5733)
- `ssh.host`: Raspberry Pi IP adresi
- `ssh.port`: SSH portu (genellikle 22)
- `ssh.username`: SSH kullanıcı adı
- `ssh.password`: SSH şifresi
- `ssh.command`: Çalıştırılacak komut

## Kullanım

1. **İlk Kurulum**: Uygulamayı ilk açtığınızda JSON konfig ürasyon URL'i girmeniz istenecek
2. **Konfig ürasyon Y ükleme**: URL'i girin ve "Başlat" butonuna tıklayın
3. **Ana Ekran**: Yüklenen butonlar sayfalarına göre gruplanarak gösterilecek
4. **Buton Tıklama**: Bir butona tıkladığınızda SSH komutu çalıştırılır ve sonuçlar gösterilir
5. **Ayarlar**: Sağ üst köşedeki ayarlar butonundan:
   - Konfig ürasyon URL'ini güncelleme
   - Mevcut konfigürasyonu yenileme
   - Tüm verileri temizleme

## Örnek JSON URL

Test için örnek konfig ürasyon:
```
https://pi-control.preview.emergentagent.com/api/config/sample
```

## API Endpoints

### Backend API
- `GET /api/` - Sağlık kontrolü
- `GET /api/config/sample` - Örnek konfig ürasyon
- `POST /api/ssh/execute` - SSH komutu çalıştır
- `GET /api/ssh/logs` - SSH geçmişini getir

## Güvenlik Notları

⚠️ **Önemli**: Bu uygulama eğitim ve prototip amaçlıdır. Production kullanımı için:

1. SSH şifrelerini JSON'da saklamamayın
2. SSH key-based authentication kullanın
3. API endpoint'lerine authentication ekleyin
4. HTTPS kullanın
5. Rate limiting uygulayın
6. Input validation yapın

## Mobil Uygulama Derleme

### Android APK Oluşturma
```bash
cd frontend
eas build --platform android --profile preview
```

### iOS IPA Oluşturma
```bash
cd frontend
eas build --platform ios --profile preview
```

## Sorun Giderme

### Web'de localStorage Sorunu
Web versiyonunda localStorage kullanılıyor. Tarayıcınızın localStorage'ı desteklediğinden emin olun.

### SSH Bağlantı Hatası
- Raspberry Pi'nin erişilebilir olduğundan emin olun
- SSH servisinin çalıştığını kontrol edin: `sudo systemctl status ssh`
- Firewall ayarlarını kontrol edin
- IP adresi ve port numarasını doğrulayın

### JSON Yükleme Hatası
- JSON formatının doğru olduğundan emin olun
- URL'in erişilebilir olduğunu kontrol edin
- CORS header'ların doğru ayarlandığını kontrol edin

## Lisans

MIT License

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

## İletişim

Sorularınız için issue açabilirsiniz.
