# 🐄 Reçber — Besi, Süt & Kümes Yönetim Uygulaması

Reçber; küçük ve orta ölçekli üreticiler için geliştirilmiş, **tamamen çevrimdışı çalışan** bir React Native mobil uygulamasıdır. Besi hayvanı, süt ineği ve kümes takibini tek uygulamada toplar. İnternet bağlantısı gerekmez; tüm veriler telefon hafızasında saklanır.

---

## 🎯 Uygulama Ne Yapar?

### Giriş / Modül Seçimi
Uygulama ilk açıldığında üretici kendi ihtiyacına göre modül seçer:

- **🐄 Besi** — Dana ve boğa besi takibi
- **🥛 Sürü** — Süt ineği ve laktasyon takibi
- **🐔 Kümes** — Tavuk, yumurta, yem, satış ve kayıp takibi

Seçim kaydedilir, bir sonraki açılışta doğrudan ilgili modüle girer. Ayarlardan istenildiği zaman modül değiştirilebilir.

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
Kullanıcı güncel piyasa fiyatını girince uygulama karar üretir.

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

## 🐔 Kümes Modülü — Ne Yapar?

Kümes modülü; yumurta tavuğu, etlik tavuk veya karışık küçük kümes işletmeleri için günlük üretim, yem, satış ve kayıp takibini yapar.

### Genel Özet
Kümes ana ekranında üretici şu metrikleri görür:
- Toplam tavuk sayısı
- Aktif grup sayısı
- Bugünkü yumurta adedi
- Bu ay toplanan yumurta
- Bu ay kırık yumurta
- Bu ay kayıp / ölüm
- Net kar / zarar

### Grup Yönetimi
Her kümes grubu için şu bilgiler tutulur:
- Grup adı (Örn: Arka Kümes, Kümes-1)
- Kümes tipi (Yumurta, etlik vb.)
- Irk / hat seçimi
- Başlangıç tavuk sayısı
- Mevcut tavuk sayısı
- Alış fiyatı
- Alış tarihi
- Not alanı

Gruplar uzun basma ile düzenlenebilir, arşivlenebilir, tekrar aktif edilebilir veya silinebilir.

### Yumurta Takibi
Her grup için ayrı yumurta kaydı tutulur:
- Tarih
- Yumurta adedi
- Kırık yumurta adedi
- Not

Uygulama grup bazlı yumurta geçmişini gösterir ve genel özet ekranına günlük / aylık yumurta verilerini yansıtır.

### Yem Alımı Takibi
Kümes yemleri için alım kaydı tutulur:
- Yem tipi
- Miktar (kg)
- Toplam fiyat
- Tarih
- Not

Uygulama otomatik olarak **kg başına yem maliyetini** hesaplar ve yem tiplerine göre toplam kg / toplam TL özetini gösterir.

### Satış Takibi
Kümes modülünde iki satış tipi desteklenir:
- **Yumurta satışı**
- **Tavuk satışı**

Satış kaydında:
- Adet
- Birim fiyat
- Toplam tutar
- Tarih
- Alıcı
- Not

tutulur. Adet ve birim fiyat girildiğinde toplam tutar otomatik hesaplanır; kullanıcı isterse manuel de değiştirebilir.

### Kayıp / Ölüm Takibi
Kayıp kayıtlarında:
- Grup seçimi
- Kayıp adet
- Sebep
- Tarih
- Not

tutulur. Böylece üretici hangi grupta ne kadar kayıp olduğunu görebilir.

### Finansal Özet
Kümes modülü gelir ve giderleri tek ekranda toplar:
- Yumurta satış geliri
- Tavuk satış geliri
- Yem maliyeti
- Alış maliyeti
- Net kar / zarar

### Hızlı İşlemler
Özet ekranından tek dokunuşla:
- Yumurta gir
- Satış ekle
- Yem alımı ekle
- Kayıp kaydet

işlemleri yapılabilir.

> Kümes modülü de Besi ve Sürü gibi çevrimdışı çalışır. Kayıtlar cihaz hafızasında tutulur.

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

Yedek dosyası adı örneği: `recber-yedek-2026-06-15.json`

**Yedekten Geri Yükle:**
Daha önce alınan JSON yedek dosyası seçilir, tüm veriler geri yüklenir.

**Tüm Verileri Sil:**
Onay sonrası tüm Reçber verileri silinir. Geri alınamaz.

### Modül Değiştirme
Besi, Sürü ve Kümes modülleri arasında buradan geçiş yapılır.

---

## 💰 Ücretsiz & Pro

| Özellik | Ücretsiz | Pro |
|---------|----------|-----|
| Besi hayvan sayısı | 2 baş | Sınırsız |
| Sürü / süt ineği kaydı | Sınırlı / test amaçlı | Sınırsız |
| Kümes grubu ve kayıtları | Sınırlı / test amaçlı | Sınırsız |
| Yedek al / geri yükle | ✅ | ✅ |
| Tüm hesaplama özellikleri | ✅ | ✅ |

3. hayvan veya ücretsiz sınır üstü kayıt eklenmeye çalışılınca Pro ekranı açılır.

**Pro fiyatı: 499 TL (tek seferlik)**

> Satın alma özelliği teknik borç olarak planlandı. RevenueCat + Google Play Billing entegrasyonu tamamlandıktan sonra aktif edilecek.

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
| `@recber_satislar` | Besi satış kayıtları |
| `@recber_suru` | Sürü hayvanları |
| `@recber_sut` | Süt kayıtları |
| `@recber_modul` | Aktif modül |
| `@recber_ayarlar` | Fiyat ayarları |
| `@recber_pro` | Pro durumu |
| `@recber_kumes_gruplar` | Kümes grupları |
| `@recber_kumes_yumurta` | Yumurta kayıtları |
| `@recber_kumes_yem` | Kümes yem alımları |
| `@recber_kumes_satis` | Kümes satış kayıtları |
| `@recber_kumes_kayip` | Kümes kayıp / ölüm kayıtları |

> **Önemli:** Uygulama silinirse veriler de silinir. Düzenli yedek almanız önerilir.

---

## 🗂️ Dosya Yapısı

```text
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
    │   ├── SuruScreen.js           # Süt ineği modülü
    │   └── KumesScreen.js          # Kümes, yumurta, yem, satış ve kayıp takibi
    │
    ├── components/
    │   ├── HeaderBar.js            # Üst bar
    │   ├── HayvanKart.js           # Hayvan liste kartı
    │   ├── StokBar.js              # Yem stok görselleştirme
    │   └── TavsiyeKutu.js          # Sat/bekle hesap motoru
    │
    ├── data/
    │   ├── storage.js              # AsyncStorage CRUD + JSON yedekleme
    │   └── constants.js            # Sabitler + ırk, yem, kümes listeleri
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

> RevenueCat / Google Billing eklendiğinde bağımlılıklar bu listeye ayrıca işlenecek.

---

## 🎨 Tema

| Renk | Hex | Kullanım |
|------|-----|----------|
| Orman Yeşili | `#3D5A3E` | Besi modülü ana renk |
| Koyu Mavi | `#1A5276` | Sürü modülü ana renk |
| Kümes Kahvesi | `#A0522D` | Kümes modülü ana renk |
| Buğday Altını | `#C9A84C` | Aksan, vurgu, Pro |
| Krem | `#F5F0E8` | Arka plan |
| Beyaz | `#FFFFFF` | Kartlar |

---

## 🏗️ Build Alma

### Play Store Gereksinimleri
- Target SDK: 34+ (Expo SDK 53 ile karşılanıyor)
- Minimum SDK: 24
- Package name: `com.recber.app`
- Pro ödeme için Google Play Console ürün tanımı hazırlanmalı
- Kapalı test süreci tamamlandıktan sonra üretim yayınına geçilmeli

### Codemagic ile Build
1. Codemagic → Recber-app reposunu seç
2. Build type: Android APK (test) veya AAB (Play Store)
3. Keystore ayarlarını gir
4. Build al
5. Kapalı test için AAB dosyasını Google Play Console'a yükle

---

## 🗺️ Yol Haritası

- [x] Besi modülü
- [x] Sürü / süt ineği modülü
- [x] Kümes modülü
- [x] Yem stok takibi
- [x] Veteriner modülü
- [x] Irka göre GCAA performans değerlendirmesi
- [x] Sat/bekle hesap motoru (canlı + karkas)
- [x] JSON yedek al / geri yükle
- [x] WhatsApp rapor gönderme
- [x] 2 hayvan ücretsiz + Pro placeholder
- [x] Fiyat ayarları (kalıcı)
- [ ] Pro satın alma entegrasyonu
- [ ] Google Play kapalı test
- [ ] Bildirim sistemi (tartım, aşı, süt, yumurta hatırlatıcı)
- [ ] Play Store yayını

---

## 🧱 Teknik Borçlar / Yapılacaklar

### Ödeme ve Pro Entegrasyonu
- [ ] RevenueCat hesabı açılacak ve proje oluşturulacak
- [ ] Google Play Console içinde tek seferlik Pro ürün tanımlanacak
- [ ] RevenueCat ürün eşleştirmesi yapılacak
- [ ] Android Billing / Google Play Billing bağlantısı test edilecek
- [ ] `@recber_pro` durumu gerçek satın alma sonucu ile senkronize edilecek
- [ ] Satın alma başarılı olunca Pro kilidi açılacak
- [ ] Satın alımı geri yükle butonu eklenecek
- [ ] Satın alma başarısız / iptal / internet yok durumları kullanıcıya net gösterilecek

### Google Play Kapalı Test
- [ ] Internal test veya closed testing kanalı oluşturulacak
- [ ] Test kullanıcı listesi hazırlanacak
- [ ] İlk AAB kapalı teste yüklenecek
- [ ] Besi, Sürü ve Kümes modülleri gerçek cihazlarda test edilecek
- [ ] Pro ekranı, ödeme placeholder ve ücretsiz limit akışları test edilecek
- [ ] Yedek al / geri yükle akışı test edilecek
- [ ] Kritik crash yoksa üretim başvurusu yapılacak

### Veri ve Güvenlik
- [ ] Yedek dosyasında uygulama sürüm bilgisi tutulacak
- [ ] Eski yedeklerden geri yükleme için migration kontrolü eklenecek
- [ ] AsyncStorage veri bozulmalarına karşı try/catch ve kullanıcı uyarısı güçlendirilecek
- [ ] Silme işlemlerinde yanlışlık riskine karşı ikinci onay / geri al mantığı değerlendirilecek

### Ürün Tavsiyeleri
- [ ] Ana ekrana “Bugün yapılacaklar” kartı eklenebilir: tartım, aşı, yumurta girişi, süt girişi
- [ ] Kümes için yumurta verim oranı eklenebilir: `günlük yumurta / mevcut tavuk`
- [ ] Kümes için tavuk başı yem maliyeti eklenebilir
- [ ] Sürü için doğum yaklaşan inek uyarısı eklenebilir
- [ ] Besi için son tartımdan kaç gün geçti uyarısı eklenebilir
- [ ] Tüm modüller için WhatsApp'a kısa günlük rapor paylaşımı eklenebilir
- [ ] Pro ekranında “tek seferlik ödeme, bulut yok, veri telefonda” mesajı net anlatılmalı

---

## 🧪 Test Senaryosu

Build öncesi şu akış test edilmeli:

### Besi Testi
1. Uygulama açılır → Besi seçilir
2. Hayvan eklenir (ırk, doğum tarihi, hedef kilo dahil)
3. Tartım girilir
4. Yem kaydı girilir
5. Sağlık/aşı kaydı girilir
6. Hayvan detayında performans sekmesi kontrol edilir
7. Rapor → Sat/Bekle → kg fiyatı girilir → karar alınır

### Sürü Testi
1. Sürü modülü seçilir
2. İnek kaydı eklenir
3. Laktasyon / kuru dönem bilgisi kontrol edilir
4. Sabah ve akşam süt kaydı girilir
5. Özet ve mini grafik kontrol edilir

### Kümes Testi
1. Kümes modülü seçilir
2. Yeni kümes grubu eklenir
3. Yumurta kaydı girilir
4. Kırık yumurta adedi girilir
5. Yem alımı eklenir ve kg fiyatı kontrol edilir
6. Yumurta satışı eklenir
7. Tavuk satışı eklenir
8. Kayıp / ölüm kaydı girilir
9. Özet ekranında toplam tavuk, yumurta, yem maliyeti ve net kar/zarar kontrol edilir
10. Grup uzun basma ile düzenle / arşivle / sil akışları kontrol edilir

### Genel Test
1. Uygulama kapatılıp açılır → veriler duruyor
2. Ayarlar → Yedek Al → dosya paylaşılır
3. Tüm Verileri Sil
4. Ayarlar → Yedekten Geri Yükle → veriler geri gelir
5. Ücretsiz limit aşılınca Pro ekranı açılır
6. İnternet yokken uygulama ana özellikleri çalışmaya devam eder

---

*Reçber v1.1.0 — Besi, Süt & Kümes Yönetim Uygulaması*  
*Tamamen çevrimdışı • AsyncStorage • Expo SDK 53*
