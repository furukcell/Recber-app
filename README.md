# 🐄 Reçber — Besi & Süt Çiftliği Yönetim Uygulaması

Reçber, besi ve süt çiftçileri için geliştirilmiş bir React Native mobil uygulamasıdır.
Hayvan takibi, yem stok yönetimi, veteriner kaydı ve sat/bekle tavsiyesi sunar.
Tamamen çevrimdışı çalışır — internet bağlantısı gerekmez.

---

## 📱 Özellikler

### 🐄 Besi Modülü
- Hayvan ekleme (isim, küpe no, alış kilo, alış fiyatı, alındığı yer)
- Haftalık tartım kaydı + yem tüketimi girişi
- Otomatik GCAA (Günlük Canlı Ağırlık Artışı) hesabı
- Satış kaydı + kar/zarar hesaplama
- Aktif / Satılan filtresi

### 🥛 Sürü Modülü
- Süt ineği ekleme (irk, laktasyon no, buzağılama tarihi)
- Sabah / akşam süt kaydı
- Laktasyon günü takibi
- Dönem yönetimi (Laktasyon / Kuru / Doğum Yakın)
- Hayvan bazlı süt verimi grafiği

### 🌾 Yem & Stok
- Yem alımı kaydı (Arpa, Saman, Silaj, Besi Yemi, Yonca, Mısır)
- Otomatik stok hesabı (alınan - verilen)
- Kritik stok uyarısı
- kg başına maliyet hesabı

### 💉 Veteriner
- Aşı takvimi kaydı (Şap, Karma, IBR vb.)
- Sağlık sorunu takibi (İştahsız, Halsiz, Öksürük, Yaralanma, İshal, Şişme)
- Sorun çözüldü işaretleme
- Hayvan bazlı sağlık geçmişi

### 📊 Raporlar
- Sat / Bekle hesap motoru (kg fiyatı girerek anlık karar)
- Aylık tartım özeti
- Genel kar/zarar özeti
- Satış geçmişi

### ⚙️ Ayarlar
- Besi ↔ Sürü modül değiştirme
- Tüm verileri sil

---

## 🗂️ Dosya Yapısı

```
Recber-app/
├── App.js                          # Navigation + modül seçim ekranı
├── app.json                        # Expo uygulama ayarları
├── eas.json                        # EAS Build ayarları
├── package.json                    # Bağımlılıklar
│
└── src/
    ├── screens/
    │   ├── HomeScreen.js           # Ana sayfa (özet kartlar)
    │   ├── HayvanlarScreen.js      # Hayvan listesi + ekleme
    │   ├── HayvanDetayScreen.js    # Hayvan detay (tartım, satış, sağlık)
    │   ├── YemScreen.js            # Yem stok + alım geçmişi
    │   ├── VeterinerScreen.js      # Aşı + sağlık sorunları
    │   ├── RaporScreen.js          # Sat/bekle + aylık + genel özet
    │   ├── AyarlarScreen.js        # Ayarlar + veri silme
    │   └── SuruScreen.js           # Süt ineği modülü
    │
    ├── components/
    │   ├── HeaderBar.js            # Üst bar (geri, başlık, aksiyon)
    │   ├── HayvanKart.js           # Hayvan liste kartı
    │   ├── StokBar.js              # Yem stok görselleştirme
    │   └── TavsiyeKutu.js          # Sat/bekle hesap motoru
    │
    ├── data/
    │   ├── storage.js              # AsyncStorage CRUD işlemleri
    │   └── constants.js            # Sabit veriler (yem tipleri, aşılar vb.)
    │
    └── theme/
        ├── colors.js               # Renk paleti
        └── typography.js           # Font stilleri
```

---

## 🎨 Tema

| Renk | Hex | Kullanım |
|------|-----|----------|
| Orman Yeşili | `#3D5A3E` | Besi modülü ana renk |
| Koyu Mavi | `#1A5276` | Sürü modülü ana renk |
| Buğday Altını | `#C9A84C` | Aksan, vurgu |
| Krem | `#F5F0E8` | Arka plan |
| Beyaz | `#FFFFFF` | Kartlar |

---

## 💾 Veri Saklama

Uygulama **AsyncStorage** kullanır. Tüm veriler cihaz hafızasında saklanır.

| Storage Key | İçerik |
|-------------|--------|
| `@recber_hayvanlar` | Besi hayvanları |
| `@recber_haftalik` | Haftalık tartım kayıtları |
| `@recber_yemler` | Yem alımları |
| `@recber_asilar` | Aşı takvimi |
| `@recber_saglik` | Sağlık sorunları |
| `@recber_satislar` | Satış kayıtları |
| `@recber_suru` | Sürü hayvanları |
| `@recber_sut` | Süt kayıtları |
| `@recber_modul` | Aktif modül (besi/sürü) |

**Önemli:** Uygulama silinirse veriler de silinir. İnternet bağlantısı gerekmez.

---

## 📦 Bağımlılıklar

```json
{
  "expo": "~53.0.0",
  "react": "18.3.2",
  "react-native": "0.76.7",
  "@react-navigation/native": "^6.1.17",
  "@react-navigation/bottom-tabs": "^6.5.20",
  "@react-navigation/stack": "^6.3.29",
  "react-native-screens": "~4.4.0",
  "react-native-safe-area-context": "4.12.0",
  "@react-native-async-storage/async-storage": "2.1.0",
  "@expo/vector-icons": "^14.0.2",
  "react-native-gesture-handler": "~2.20.2"
}
```

---

## 🔧 Sat / Bekle Hesap Motoru

`TavsiyeKutu.js` içindeki karar mantığı:

| Durum | Karar |
|-------|-------|
| GCAA < 1.0 kg/gün | **SAT** — Verim çok düşük |
| Kar marjı ≥ %20 + 90 günden fazla | **SAT** — İyi getiri noktası |
| 120 günden fazla + GCAA < 1.3 | **SAT** — Verim yavaşlıyor |
| Beklenen satış < toplam maliyet | **SAT** — Zarar büyüyor |
| 30 gün daha net kar pozitif | **BEKLE** — Beklemek kazandırır |
| Henüz erken aşama | **BEKLE** — Takip et |

Kullanıcıdan sadece **güncel canlı ağırlık fiyatı (TL/kg)** istenir.
Hesap tamamen yerel yapılır, internet gerekmez.

---

## 🏗️ Build Alma

### Codemagic ile Android APK/AAB

1. Codemagic'e bağlan → `Recber-app` reposunu seç
2. Build type: **Android APK** (test) veya **Android AAB** (Play Store)
3. Keystore ayarlarını gir
4. Build al

### Play Store Gereksinimleri

- Target SDK: 34+ (Expo SDK 53 ile karşılanıyor)
- Minimum SDK: 24
- Package name: `com.recber.app`

---

## 📋 Geliştirme Notları

- Tüm Firebase REST API çağrıları yerine AsyncStorage kullanılmıştır
- Navigation: Bottom Tab (5 sekme) + Stack Navigator
- Modül seçimi ilk açılışta yapılır, ayarlardan değiştirilebilir
- `App.js` sadece navigation kodu içerir, iş mantığı screen'lerde
- Besi modülünde `HayvanlarStack`, Sürü modülünde `SuruScreen` gösterilir

---

## 🗺️ Yol Haritası

- [x] Besi modülü
- [x] Sürü modülü  
- [x] Yem stok takibi
- [x] Veteriner modülü
- [x] Sat/bekle hesap motoru
- [ ] WhatsApp rapor gönderme
- [ ] JSON veri yedekleme
- [ ] Bildirim sistemi (tartım hatırlatıcı)
- [ ] Play Store yayını

---

*Reçber v1.0.0 — Besi & Süt Çiftliği Yönetim Uygulaması*
