# 🐄 Reçber — Besi & Süt Çiftliği Yönetim Uygulaması

Reçber, besi ve süt çiftçileri için geliştirilmiş tamamen çevrimdışı çalışan bir React Native mobil uygulamasıdır. İnternet bağlantısı gerekmez, tüm veriler telefon hafızasında saklanır.

---

## 🎯 Uygulama Ne Yapar?

### Giriş Ekranı
Uygulama ilk açıldığında iki modül arasında seçim yapılır:
- **🐄 Besi** — Dana ve boğa besi takibi
- **🥛 Sürü** — Süt ineği ve laktasyon takibi

Seçim kaydedilir, bir sonraki açılışta direkt ilgili modüle girer. Ayarlardan istediğin zaman değiştirilebilir.

---

## 🐄 Besi Modülü — Ne Yapar?

### Hayvan Kaydı
Her hayvan için şu bilgiler girilir:
- İsim / takma ad
- Küpe numarası
- **Irk** (Simental, Holstein, Montofon, Angus, Limousin, Charolais, Melez, Diğer)
- Cinsiyet (Erkek / Dişi)
- Doğum tarihi
- Alış kilosu ve alış fiyatı
- **Hedef kilo** (besi sonu hedefi)
- Alındığı yer ve alış tarihi

### Haftalık Tartım Takibi
Her tartım kaydında:
- Güncel kilo girilir
- O hafta verilen yem miktarları girilir (Besi Yemi, Arpa, Saman, Silaj, Mısır, Yonca)
- Kilo ve yem tüketimi otomatik biriktirilir

### Otomatik GCAA Hesabı
**GCAA (Günlük Canlı Ağırlık Artışı)** her hayvan için otomatik hesaplanır:
- 2+ tartım varsa tartımlar arası gerçek artış kullanılır
- Tartım yoksa alış kilosu ile güncel kilo farkından hesaplanır
- Renk kodlaması: Kırmızı (< 1.0), Sarı (1.0–1.5), Yeşil (> 1.5)

### Irka Göre Performans Değerlendirmesi
Her hayvanın ırkı ve yaşına göre beklenen GCAA değerleriyle karşılaştırma yapılır:

| Durum | Açıklama |
|-------|----------|
| 🔴 Beklenenin Altında | GCAA ırk ortalaması altında |
| ✅ Normal Aralıkta | GCAA beklenen aralıkta |
| ⭐ Beklenenin Üstünde | GCAA maksimumun üzerinde |
| — Bilinmiyor | Irk veya yaş bilgisi eksik |

Değerlendirme sonucunda:
- Beklenen min/max/ideal GCAA gösterilir
- Duruma özel mesaj verilir
- Pratik tavsiye sunulur (yem rasyonu, sağlık kontrolü vb.)

> ⚠️ Bu değerler pratik referans amaçlıdır, veterinerlik hükmü değildir.

### Sat / Bekle Karar Motoru
Kullanıcı güncel piyasa fiyatını girince uygulama şu kararı verir:

**Hesap tipleri:**
- **Canlı kg fiyatı** → `satışGeliri = mevcutKilo × canlıKgFiyatı`
- **Karkas kg fiyatı** → `karkasKilo = mevcutKilo × randıman` → `satışGeliri = karkasKilo × karkasKgFiyatı`

**Karar senaryoları:**

| Durum | Karar |
|-------|-------|
| Hedef kiloya ulaştı + kar pozitif + GCAA yavaşladı | SAT ✅ |
| GCAA ırk ortalaması altı + kar pozitif + 60+ gün | SAT ⚠️ |
| Kar marjı %20+ ve 90+ günlük besi | SAT ✅ |
| 120+ gün besi + GCAA < 1.3 | SAT ⚠️ |
| Zarar var ama GCAA iyi | TAKIP ET |
| Zarar var ve GCAA düşük | SAT 🔴 |
| 30 gün daha net kar pozitif | BEKLE ✅ |
| Yeterli veri yok | TAKIP ET |

### Satış Kaydı ve Kar/Zarar
Hayvan satıldığında:
- Satış fiyatı, tarihi ve alıcı bilgisi kaydedilir
- Alış fiyatı ile karşılaştırma yapılır
- Tahmini yem maliyeti dahil net kar/zarar hesaplanır

### Veteriner Takibi
- Aşı kaydı (Şap, Karma, IBR, BVD, Clostridial, Parazit)
- Sağlık sorunu kaydı (İştahsız, Halsiz, Öksürük, Yaralanma, İshal, Şişme)
- Sorun çözüldü işaretleme
- Hayvan bazlı sağlık geçmişi

### Yem Stok Takibi
- Arpa, Saman, Silaj, Besi Yemi, Yonca, Mısır alımları kaydedilir
- Kalan stok otomatik hesaplanır (alınan - verilen)
- Kritik stok uyarısı (%10 altında kırmızı uyarı)
- Alım başına kg maliyeti gösterilir

---

## 🥛 Sürü Modülü — Ne Yapar?

### İnek Kaydı
- İsim, küpe no, ırk
- Son buzağılama tarihi (laktasyon günü buradan hesaplanır)
- Doğum tarihi
- Laktasyon numarası

### Dönem Takibi
Her inek için dönem atanabilir:
- **Laktasyon** — Aktif süt verimi
- **Kuru Dönem** — Kuruda bekleyen
- **Doğum Yakın** — Yaklaşan doğum

### Süt Kaydı
- Sabah ve akşam ayrı ayrı girilir
- Günlük toplam otomatik hesaplanır
- Hayvan bazlı tüm kayıtlar listelenir

### Özet ve Grafik
- Toplam süt verimi
- Günlük ortalama
- En yüksek gün
- Son 7 güne ait mini bar grafik

---

## 📊 Raporlar — Ne Yapar?

### Sat/Bekle Sekmesi
- Aktif hayvanlardan birini seç
- Canlı kg veya karkas kg fiyatı gir
- Randıman oranı ayarla
- Anında karar al (SAT / BEKLE / TAKIP ET)
- Irk performansı da hesaba katılır

### Bu Ay Sekmesi
- Aylık tartım sayısı ve toplam yem
- Tüm aktif hayvanların durumu (kilo artışı, GCAA)
- Son tartım kayıtları

### Genel Sekmesi
- Toplam satış geliri
- Toplam alış ve yem maliyeti
- Net kar/zarar (satılan hayvanlar üzerinden)
- Tüm satış geçmişi

### WhatsApp Raporu
Rapor ekranındaki WhatsApp butonuna basınca otomatik metin oluşturulur:
- Tüm aktif hayvanların kilo ve GCAA durumu
- Aylık yem özeti
- Finansal özet
- WhatsApp, mesaj uygulaması veya notlar ile paylaşılabilir

---

## ⚙️ Ayarlar — Ne Yapar?

### Fiyat Ayarları
Varsayılan fiyatlar burada ayarlanır ve kalıcı kaydedilir:
- Canlı kg fiyatı (varsayılan: 300 TL)
- Karkas kg fiyatı (varsayılan: 600 TL)
- Randıman oranı (varsayılan: 0.55)

Rapor ekranında bu değerler otomatik yüklenir.

### Veri Yönetimi

**Yedek Al:**
Tüm uygulama verileri tek bir JSON dosyasına yazılır. Dosya WhatsApp, Google Drive, e-posta vb. ile paylaşılabilir veya telefona kaydedilebilir.

Yedek dosyası adı: `recber-yedek-2026-06-15.json`

**Yedekten Geri Yükle:**
Daha önce alınan JSON yedek dosyası seçilir, tüm veriler geri yüklenir.

**Tüm Verileri Sil:**
Onay sonrası tüm Reçber verileri silinir. Geri alınamaz.

### Modül Değiştirme
Besi ve Sürü modülü arasında buradan geçiş yapılır.

---

## 💰 Ücretsiz & Pro

| Özellik | Ücretsiz | Pro |
|---------|----------|-----|
| Hayvan sayısı | 2 baş | Sınırsız |
| Tüm diğer özellikler | ✅ | ✅ |

3. hayvan eklenmeye çalışılınca Pro ekranı açılır.

**Pro fiyatı: 499 TL (tek seferlik)**

> Satın alma özelliği yakında aktif olacak.

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
| `@recber_modul` | Aktif modül |
| `@recber_ayarlar` | Fiyat ayarları |
| `@recber_pro` | Pro durumu |

> **Önemli:** Uygulama silinirse veriler de silinir. Düzenli yedek almanız önerilir.

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
    │   ├── HayvanlarScreen.js      # Hayvan listesi + ekleme + Pro modal
    │   ├── HayvanDetayScreen.js    # Detay (özet, performans, tartım, sağlık)
    │   ├── YemScreen.js            # Yem stok + alım geçmişi
    │   ├── VeterinerScreen.js      # Aşı + sağlık sorunları
    │   ├── RaporScreen.js          # Sat/bekle + aylık + genel + WhatsApp
    │   ├── AyarlarScreen.js        # Ayarlar + yedek + fiyatlar
    │   └── SuruScreen.js           # Süt ineği modülü
    │
    ├── components/
    │   ├── HeaderBar.js            # Üst bar
    │   ├── HayvanKart.js           # Hayvan liste kartı
    │   ├── StokBar.js              # Yem stok görselleştirme
    │   └── TavsiyeKutu.js          # Sat/bekle hesap motoru
    │
    ├── data/
    │   ├── storage.js              # AsyncStorage CRUD + JSON yedekleme
    │   └── constants.js            # Sabitler + ırk performans tablosu
    │
    ├── utils/
    │   └── hesaplama.js            # Tüm hesaplama fonksiyonları
    │
    └── theme/
        ├── colors.js               # Renk paleti
        └── typography.js           # Font stilleri
```

---

## 📦 Bağımlılıklar

```json
{
  "expo": "~53.0.0",
  "expo-document-picker": "~13.0.0",
  "expo-file-system": "~18.0.0",
  "expo-sharing": "~13.0.0",
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

## 🎨 Tema

| Renk | Hex | Kullanım |
|------|-----|----------|
| Orman Yeşili | `#3D5A3E` | Besi modülü ana renk |
| Koyu Mavi | `#1A5276` | Sürü modülü ana renk |
| Buğday Altını | `#C9A84C` | Aksan, vurgu, Pro |
| Krem | `#F5F0E8` | Arka plan |
| Beyaz | `#FFFFFF` | Kartlar |

---

## 🏗️ Build Alma

### Play Store Gereksinimleri
- Target SDK: 34+ (Expo SDK 53 ile karşılanıyor)
- Minimum SDK: 24
- Package name: `com.recber.app`

### Codemagic ile Build
1. Codemagic → Recber-app reposunu seç
2. Build type: Android APK (test) veya AAB (Play Store)
3. Keystore ayarlarını gir
4. Build al

---

## 🗺️ Yol Haritası

- [x] Besi modülü
- [x] Sürü / süt ineği modülü
- [x] Yem stok takibi
- [x] Veteriner modülü
- [x] Irka göre GCAA performans değerlendirmesi
- [x] Sat/bekle hesap motoru (canlı + karkas)
- [x] JSON yedek al / geri yükle
- [x] WhatsApp rapor gönderme
- [x] 2 hayvan ücretsiz + Pro placeholder
- [x] Fiyat ayarları (kalıcı)
- [ ] Pro satın alma entegrasyonu
- [ ] Bildirim sistemi (tartım hatırlatıcı)
- [ ] Play Store yayını

---

## 🧪 Test Senaryosu

Build öncesi şu akış test edilmeli:

1. Uygulama açılır → Besi seçilir
2. Hayvan eklenir (ırk, doğum tarihi, hedef kilo dahil)
3. Tartım girilir
4. Yem kaydı girilir
5. Sağlık/aşı kaydı girilir
6. Hayvan detayında performans sekmesi kontrol edilir
7. Rapor → Sat/Bekle → kg fiyatı girilir → karar alınır
8. Uygulama kapatılıp açılır → veriler duruyor
9. Ayarlar → Yedek Al → dosya paylaşılır
10. Tüm Verileri Sil
11. Ayarlar → Yedekten Geri Yükle → veriler geri gelir

---

*Reçber v1.0.0 — Besi & Süt Çiftliği Yönetim Uygulaması*
*Tamamen çevrimdışı • AsyncStorage • Expo SDK 53*
