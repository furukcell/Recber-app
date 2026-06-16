# 🐄 Reçber — Besi, Süt, Kümes & Ambar Yönetim Uygulaması

Reçber; küçük ve orta ölçekli üreticiler için geliştirilmiş, **tamamen çevrimdışı çalışan** bir React Native mobil uygulamasıdır. Besi hayvanı, süt ineği, kümes ve yem stoğu takibini tek uygulamada toplar. İnternet bağlantısı gerekmez; tüm veriler telefon hafızasında saklanır.

---

## 🎯 Uygulama Ne Yapar?

Reçber üreticinin günlük kayıtlarını, stoklarını ve temel maliyetlerini basit şekilde takip etmesini sağlar.

### Giriş / Modül Seçimi

Uygulama ilk açıldığında üretici kendi ihtiyacına göre modül seçer:

- **🐄 Besi** — Dana ve boğa besi takibi
- **🥛 Sürü** — Süt ineği, laktasyon ve süt verimi takibi
- **🐔 Kümes** — Tavuk, yumurta, satış ve kayıp takibi

Seçim kaydedilir, bir sonraki açılışta doğrudan ilgili modüle girer. Ayarlardan istenildiği zaman modül değiştirilebilir.

### Ortak Ambar Mantığı

Reçber’de yem ve maliyet girişi merkezi olarak **Ambar / Yem Stokları** ekranından yapılır.

- Besi yemleri
- Süt yemleri
- Kümes yemleri
- Genel yemler

tek bir ortak ambar yapısında tutulur. Besi, Sürü ve Kümes ekranlarında ilgili ambar stokları ayrıca gösterilir.

---

## 🧺 Ambar / Yem Stokları

Ambar ekranı, uygulamanın ortak yem deposudur. Bu ekran **Ayarlar > Ambar / Yem Stokları** üzerinden açılır.

### Ambar Ne Yapar?

- Yem adı girilir
- Kategori seçilir: Genel, Besi, Süt, Kümes
- Toplam kg girilir
- Toplam tutar girilir
- Uygulama otomatik olarak kg maliyetini hesaplar
- Kalan kg gösterilir
- Kalan stok değeri hesaplanır
- Yem silme işlemi yapılabilir

### Ambar Kategorileri

| Kategori | Kullanım |
|---------|----------|
| Genel | Tüm modüllerde ortak görülebilen yemler |
| Besi | Besi modülünde gösterilir |
| Süt | Sürü / Süt modülünde gösterilir |
| Kümes | Kümes modülünde gösterilir |

### Modüllerde Ambar Görünümü

Ambar ayrı bir ana tab değildir. Veri girişi Ayarlar içindeki Ambar ekranından yapılır; ancak stok özeti ilgili modüllerde görünür:

| Ekran | Gösterilen Ambar Verisi |
|------|--------------------------|
| Besi / Yem ekranı | Besi + Genel yem stokları |
| Sürü ekranı | Süt + Genel yem stokları |
| Kümes özet ekranı | Kümes + Genel yem stokları |

> Hedef yapı: yem/maliyet girişi sadece Ambar’dan yapılır; Besi, Sürü ve Kümes ekranları bu ortak ambar verisini gösterir.

---

## 🐄 Besi Modülü — Ne Yapar?

### Hayvan Kaydı

Her hayvan için şu bilgiler girilir:

- İsim / takma ad
- Küpe numarası
- **Irk**: Simental, Holstein, Montofon, Angus, Limousin, Charolais, Melez, Diğer
- Cinsiyet: Erkek / Dişi
- Doğum tarihi
- Alış kilosu ve alış fiyatı
- **Hedef kilo**
- Alındığı yer ve alış tarihi

### Ücretsiz Limit

Ücretsiz sürümde en fazla **2 besi hayvanı** eklenebilir. 3. hayvan eklenmek istendiğinde Pro uyarısı gösterilir.

### Haftalık Tartım Takibi

Her tartım kaydında:

- Güncel kilo girilir
- O hafta verilen yem miktarları girilir
- Kilo ve yem tüketimi otomatik biriktirilir

### Otomatik GCAA Hesabı

**GCAA (Günlük Canlı Ağırlık Artışı)** her hayvan için otomatik hesaplanır:

- 2+ tartım varsa tartımlar arası gerçek artış kullanılır
- Tartım yoksa alış kilosu ile güncel kilo farkından hesaplanır
- Renk kodlaması: Kırmızı (< 1.0), Sarı (1.0–1.5), Yeşil (> 1.5)

### Irka Göre Performans Değerlendirmesi

Her hayvanın ırkı ve yaşına göre beklenen GCAA değerleriyle karşılaştırma yapılır.

| Durum | Açıklama |
|-------|----------|
| 🔴 Beklenenin Altında | GCAA ırk ortalaması altında |
| ✅ Normal Aralıkta | GCAA beklenen aralıkta |
| ⭐ Beklenenin Üstünde | GCAA maksimumun üzerinde |
| — Bilinmiyor | Irk veya yaş bilgisi eksik |

> ⚠️ Bu değerler pratik referans amaçlıdır, veterinerlik hükmü değildir.

### Sat / Bekle Karar Motoru

Kullanıcı güncel piyasa fiyatını girince uygulama karar üretir.

**Hesap tipleri:**

- Canlı kg fiyatı
- Karkas kg fiyatı
- Randıman oranı

**Karar senaryoları:**

| Durum | Karar |
|-------|-------|
| Hedef kiloya ulaştı + kar pozitif + GCAA yavaşladı | SAT ✅ |
| GCAA ırk ortalaması altı + kar pozitif + 60+ gün | SAT ⚠️ |
| Kar marjı %20+ ve 90+ günlük besi | SAT ✅ |
| 120+ gün besi + GCAA < 1.3 | SAT ⚠️ |
| Zarar var ama GCAA iyi | TAKİP ET |
| Zarar var ve GCAA düşük | SAT 🔴 |
| 30 gün daha net kar pozitif | BEKLE ✅ |
| Yeterli veri yok | TAKİP ET |

### Satış Kaydı ve Kar/Zarar

Hayvan satıldığında:

- Satış fiyatı, tarihi ve alıcı bilgisi kaydedilir
- Alış fiyatı ile karşılaştırma yapılır
- Tahmini yem maliyeti dahil net kar/zarar hesaplanır

### Veteriner Takibi

- Aşı kaydı
- Sağlık sorunu kaydı
- Sorun çözüldü işaretleme
- Hayvan bazlı sağlık geçmişi

### Besi Yem Stok Görünümü

Besi modülündeki **Yem & Stok** ekranı artık Ambar verisini gösterir.

Gösterilen bilgiler:

- Besi + Genel yem toplam kg
- Stok değeri
- Yem çeşidi sayısı
- Yem bazlı kalan kg
- Kg maliyet
- Kalan stok değeri
- Kritik stok yüzdesi

Yeni yem ve maliyet girişi bu ekrandan değil, **Ayarlar > Ambar / Yem Stokları** ekranından yapılır.

---

## 🥛 Sürü / Süt Modülü — Ne Yapar?

### İnek Kaydı

- İsim
- Küpe numarası
- Irk
- Son buzağılama tarihi
- Doğum tarihi
- Laktasyon numarası

### Ücretsiz Limit

Ücretsiz sürümde en fazla **2 süt ineği** eklenebilir. 3. inek eklenmek istendiğinde Pro uyarısı gösterilir.

### Dönem Takibi

Her inek için dönem atanabilir:

- **Laktasyon**
- **Kuru Dönem**
- **Doğum Yakın**

### Süt Kaydı

- Sabah sütü
- Akşam sütü
- Günlük toplam
- Hayvan bazlı süt geçmişi

### Özet ve Grafik

- Toplam süt verimi
- Günlük ortalama
- En yüksek gün
- Son 7 güne ait mini bar grafik

### Süt Rapor Ekranı

Sürü modülüne ayrı **Süt Rapor** ekranı eklenmiştir.

Süt Rapor ekranında:

- Bugünkü süt
- Son 7 gün ortalaması
- Aylık toplam
- En verimli inek
- İnek bazlı performans
- Dikkat edilmesi gereken düşük verimli inekler
- Paylaşılabilir rapor

gösterilir.

### Süt Yemi Stok Görünümü

Sürü ekranında Ambar’dan gelen **Süt + Genel** yem stokları gösterilir.

Gösterilen bilgiler:

- Kalan yem kg
- Stok değeri

> Sonraki geliştirme hedefi: süt kaydı sırasında satılan süt, litre fiyatı, yem kg ve yem maliyeti üzerinden kâr/zarar hesabı.

---

## 🐔 Kümes Modülü — Ne Yapar?

Kümes modülü; yumurta tavuğu, etlik tavuk veya karışık küçük kümes işletmeleri için günlük üretim, satış ve kayıp takibini yapar.

### Ücretsiz Limit

Ücretsiz sürümde toplam en fazla **20 tavuk** takip edilebilir.

Limit grup sayısına göre değil, toplam aktif tavuk sayısına göre çalışır.

Örnek:

| Mevcut | Yeni Eklenen | Sonuç |
|--------|--------------|-------|
| 10 tavuk | 10 tavuk | Ücretsiz |
| 10 tavuk | 11 tavuk | Pro uyarısı |
| 20 tavuk | 1 tavuk | Pro uyarısı |

Mevcut grup düzenlenerek tavuk sayısı artırıldığında da toplam 20 sınırı kontrol edilir.

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

- Grup adı
- Kümes tipi
- Irk / hat seçimi
- Başlangıç tavuk sayısı
- Mevcut tavuk sayısı
- Alış fiyatı
- Alış tarihi
- Not

Gruplar uzun basma ile düzenlenebilir, arşivlenebilir, tekrar aktif edilebilir veya silinebilir.

### Yumurta Takibi

Her grup için ayrı yumurta kaydı tutulur:

- Tarih
- Yumurta adedi
- Kırık yumurta adedi
- Not

### Satış Takibi

Kümes modülünde iki satış tipi desteklenir:

- Yumurta satışı
- Tavuk satışı

Satış kaydında adet, birim fiyat, toplam tutar, tarih, alıcı ve not tutulur.

### Kayıp / Ölüm Takibi

Kayıp kayıtlarında:

- Grup seçimi
- Kayıp adet
- Sebep
- Tarih
- Not

tutulur.

### Kümes Yemi Stok Görünümü

Kümes özet ekranında Ambar’dan gelen **Kümes + Genel** yem stokları gösterilir.

Gösterilen bilgiler:

- Kalan yem kg
- Stok değeri

Yeni yem ve maliyet girişi Kümes ekranından değil, **Ayarlar > Ambar / Yem Stokları** ekranından yapılır.

### Finansal Özet

Kümes modülü gelir ve giderleri tek ekranda toplar:

- Yumurta satış geliri
- Tavuk satış geliri
- Yem maliyeti
- Alış maliyeti
- Net kar / zarar

> Kümes finansal hesabının Ambar yem kullanım kayıtlarıyla daha güçlü hale getirilmesi sonraki teknik geliştirme hedefidir.

---

## 📊 Raporlar — Ne Yapar?

### Besi Raporları

- Sat / Bekle kararı
- Canlı kg veya karkas kg fiyatı
- Randıman oranı
- Aylık tartım sayısı
- Toplam yem
- Aktif hayvan durumu
- Satış geçmişi
- WhatsApp raporu

### Süt Raporları

- Günlük süt toplamı
- Son 7 gün ortalaması
- Aylık süt toplamı
- En verimli inek
- Düşük verim uyarıları
- Paylaşılabilir süt raporu

### Kümes Raporları

- Toplam tavuk
- Yumurta üretimi
- Kayıp sayısı
- Satış gelirleri
- Net kar / zarar

---

## ⚙️ Ayarlar — Ne Yapar?

### Ambar / Yem Stokları

Ayarlar ekranına **Ambar / Yem Stokları** girişi eklenmiştir.

Bu ekrandan:

- Yem eklenir
- Kategori seçilir
- Toplam kg girilir
- Toplam tutar girilir
- Kg maliyeti otomatik hesaplanır
- Kalan kg ve stok değeri takip edilir

### Fiyat Ayarları

Varsayılan fiyatlar burada ayarlanır:

- Canlı kg fiyatı
- Karkas kg fiyatı
- Randıman oranı

### Veri Yönetimi

**Yedek Al:**

Tüm uygulama verileri tek bir JSON dosyasına yazılır.

**Yedekten Geri Yükle:**

Daha önce alınan JSON yedek dosyası seçilir, tüm veriler geri yüklenir.

**Tüm Verileri Sil:**

Onay sonrası tüm Reçber verileri silinir. Geri alınamaz.

### Gizlilik / KVKK

Ayarlar ekranına **Gizlilik / KVKK** ekranı eklenmiştir.

- Verilerin cihazda saklandığı açıklanır
- Bulut sunucu kullanılmadığı belirtilir
- Kullanıcının veri silme/yedekleme sorumluluğu anlatılır

### Uygulama Hakkında

Ayarlar ekranına **Uygulama Hakkında** ekranı eklenmiştir.

- Uygulamanın amacı
- Çevrimdışı çalışma yapısı
- Modül bilgileri
- Geliştirici / destek iletişimi

---

## 💰 Ücretsiz & Pro

| Özellik | Ücretsiz | Pro |
|---------|----------|-----|
| Besi hayvan sayısı | 2 baş | Sınırsız |
| Süt ineği sayısı | 2 inek | Sınırsız |
| Kümes toplam tavuk sayısı | 20 tavuk | Sınırsız |
| Ambar / yem stokları | ✅ Sınırsız | ✅ Sınırsız |
| Yedek al / geri yükle | ✅ | ✅ |
| GCAA ve performans hesapları | ✅ | ✅ |
| Sat / Bekle motoru | ✅ | ✅ |
| Süt raporu | ✅ | ✅ |
| Kümes finansal özet | ✅ | ✅ |

Ücretsiz limitler aşılmaya çalışıldığında Pro uyarısı gösterilir.

**Planlanan Pro fiyatı: 499 TL (tek seferlik)**

> Satın alma özelliği teknik borç olarak planlandı. RevenueCat + Google Play Billing entegrasyonu tamamlandıktan sonra aktif edilecek.

---

## 💾 Veri Saklama

Uygulama **AsyncStorage** kullanır. Tüm veriler cihaz hafızasında saklanır.

| Storage Key | İçerik |
|-------------|--------|
| `@recber_hayvanlar` | Besi hayvanları |
| `@recber_haftalik` | Haftalık tartım kayıtları |
| `@recber_yemler` | Eski besi yem alım kayıtları / geçmiş uyumluluk |
| `@recber_asilar` | Aşı takvimi |
| `@recber_saglik` | Sağlık sorunları |
| `@recber_satislar` | Besi satış kayıtları |
| `@recber_suru` | Sürü hayvanları |
| `@recber_sut` | Süt kayıtları |
| `@recber_ambar_yemleri` | Ortak Ambar yem stokları |
| `@recber_yem_kullanimlari` | Ambar yem kullanım kayıtları |
| `@recber_modul` | Aktif modül |
| `@recber_ayarlar` | Fiyat ayarları |
| `@recber_pro` | Pro durumu |
| `@recber_kumes_gruplar` | Kümes grupları |
| `@recber_kumes_yumurta` | Yumurta kayıtları |
| `@recber_kumes_yem` | Eski kümes yem alım kayıtları / geçmiş uyumluluk |
| `@recber_kumes_satis` | Kümes satış kayıtları |
| `@recber_kumes_kayip` | Kümes kayıp / ölüm kayıtları |

> **Önemli:** Uygulama silinirse veriler de silinir. Düzenli yedek alınması önerilir.

---

## 🗂️ Dosya Yapısı

```text
Recber-app/
├── App.js                          # Navigation + modül seçim ekranı
├── app.json                        # Expo uygulama ayarları
├── eas.json                        # EAS Build ayarları
├── codemagic.yaml                  # Codemagic Android build ayarları
├── package.json                    # Bağımlılıklar
│
└── src/
    ├── screens/
    │   ├── HomeScreen.js           # Ana sayfa
    │   ├── HayvanlarScreen.js      # Besi hayvan listesi + Pro limit
    │   ├── HayvanDetayScreen.js    # Besi hayvan detayı
    │   ├── YemScreen.js            # Besi için Ambar stok görünümü
    │   ├── VeterinerScreen.js      # Aşı + sağlık sorunları
    │   ├── RaporScreen.js          # Sat/bekle + aylık + genel + WhatsApp
    │   ├── AyarlarScreen.js        # Ayarlar + Ambar + KVKK + Hakkında
    │   ├── AmbarScreen.js          # Ortak yem stoku ve maliyet girişi
    │   ├── HakkimizdaScreen.js     # Uygulama hakkında ekranı
    │   ├── KvkkEkrani.js           # KVKK / gizlilik açıklaması
    │   ├── SuruScreen.js           # Süt ineği modülü + Ambar stok özeti
    │   ├── SuruRaporScreen.js      # Süt raporu
    │   └── KumesScreen.js          # Kümes modülü + Ambar stok özeti
    │
    ├── components/
    │   ├── HeaderBar.js            # Üst bar
    │   ├── HayvanKart.js           # Hayvan liste kartı
    │   ├── StokBar.js              # Eski stok görselleştirme / geçmiş uyumluluk
    │   └── TavsiyeKutu.js          # Sat/bekle hesap motoru
    │
    ├── data/
    │   ├── storage.js              # AsyncStorage CRUD + Ambar + JSON yedekleme
    │   └── constants.js            # Sabitler + ırk, yem, kümes listeleri
    │
    ├── utils/
    │   ├── hesaplama.js            # Tüm hesaplama fonksiyonları
    │   └── proLimits.js            # Ücretsiz / Pro limit kuralları
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
| Ambar Kahvesi | `#8E5A2A` | Ambar / yem stokları |
| Buğday Altını | `#C9A84C` | Aksan, vurgu, Pro |
| Krem | `#F5F0E8` | Arka plan |
| Beyaz | `#FFFFFF` | Kartlar |

---

## 🏗️ Build Alma

### Play Store Gereksinimleri

- Target SDK: 35 hedeflenir
- Minimum SDK: 24
- Package name: `com.recber.app`
- Pro ödeme için Google Play Console ürün tanımı hazırlanmalı
- Kapalı test süreci tamamlandıktan sonra üretim yayınına geçilmeli

### Codemagic ile Build

1. Codemagic → Recber-app reposunu seç
2. Android build workflow başlat
3. Expo prebuild çalışır
4. Gradle release APK/AAB üretir
5. Keystore base64 dosyaya çevrilerek imzalama yapılır
6. Kapalı test için AAB dosyası Google Play Console'a yüklenir

---

## 🗺️ Yol Haritası

- [x] Besi modülü
- [x] Sürü / süt ineği modülü
- [x] Kümes modülü
- [x] Ortak Ambar / yem stok ekranı
- [x] Besi ekranında Ambar stok görünümü
- [x] Sürü ekranında Ambar stok görünümü
- [x] Kümes ekranında Ambar stok görünümü
- [x] Süt Rapor ekranı
- [x] Veteriner modülü
- [x] Irka göre GCAA performans değerlendirmesi
- [x] Sat/bekle hesap motoru
- [x] JSON yedek al / geri yükle
- [x] WhatsApp rapor gönderme
- [x] Ücretsiz limit altyapısı
- [x] Besi 2 hayvan limiti
- [x] Süt 2 inek limiti
- [x] Kümes 20 tavuk limiti
- [x] KVKK / Gizlilik ekranı
- [x] Uygulama Hakkında ekranı
- [ ] Ambar yem kullanım kayıtlarını Besi/Süt/Kümes günlük işlemlerine tam bağlama
- [ ] Süt için yem maliyeti + litre süt kâr/zarar hesabı
- [ ] Kümes için yumurta geliri - yem maliyeti net hesabını Ambar kullanımına bağlama
- [ ] Pro satın alma entegrasyonu
- [ ] Google Play kapalı test
- [ ] Bildirim sistemi
- [ ] Play Store yayını

---

## 🧱 Teknik Borçlar / Yapılacaklar

### Ambar Entegrasyonu

- [x] Ambar storage keyleri eklendi
- [x] Ambar CRUD fonksiyonları eklendi
- [x] Ambar ekranı oluşturuldu
- [x] Ayarlar ekranından Ambar’a giriş eklendi
- [x] Besi, Sürü ve Kümes ekranlarında Ambar stok özeti gösterildi
- [ ] Eski yem alım sistemleriyle migration planı yapılacak
- [ ] Yem kullanım kayıtları günlük işlemlere bağlanacak
- [ ] Raporlar Ambar maliyetleriyle güçlendirilecek

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
- [ ] Besi, Sürü, Kümes ve Ambar gerçek cihazlarda test edilecek
- [ ] Pro ekranı, ödeme placeholder ve ücretsiz limit akışları test edilecek
- [ ] Yedek al / geri yükle akışı test edilecek
- [ ] Kritik crash yoksa üretim başvurusu yapılacak

### Veri ve Güvenlik

- [ ] Yedek dosyasında uygulama sürüm bilgisi tutulacak
- [ ] Eski yedeklerden geri yükleme için migration kontrolü eklenecek
- [ ] AsyncStorage veri bozulmalarına karşı try/catch ve kullanıcı uyarısı güçlendirilecek
- [ ] Silme işlemlerinde yanlışlık riskine karşı ikinci onay / geri al mantığı değerlendirilecek
- [ ] Hesap silme / veri silme açıklaması için Play Console’a uygun web sayfası hazırlanacak

### Ürün Tavsiyeleri

- [ ] Ana ekrana “Bugün yapılacaklar” kartı eklenebilir
- [ ] Kümes için yumurta verim oranı eklenebilir: günlük yumurta / mevcut tavuk
- [ ] Kümes için tavuk başı yem maliyeti eklenebilir
- [ ] Sürü için doğum yaklaşan inek uyarısı eklenebilir
- [ ] Besi için son tartımdan kaç gün geçti uyarısı eklenebilir
- [ ] Tüm modüller için WhatsApp'a kısa günlük rapor paylaşımı eklenebilir
- [ ] Pro ekranında “tek seferlik ödeme, bulut yok, veri telefonda” mesajı net anlatılmalı

---

## 🧪 Test Senaryosu

Build öncesi şu akış test edilmeli:

### Ambar Testi

1. Ayarlar → Ambar / Yem Stokları açılır
2. Genel yem eklenir
3. Besi yemi eklenir
4. Süt yemi eklenir
5. Kümes yemi eklenir
6. Kg maliyetinin otomatik hesaplandığı kontrol edilir
7. Kalan kg ve stok değeri kontrol edilir
8. Yem silme akışı kontrol edilir

### Besi Testi

1. Uygulama açılır → Besi seçilir
2. Ayarlar → Ambar’dan Besi veya Genel yem eklenir
3. Besi → Yem ekranında bu stok görünür
4. Hayvan eklenir
5. 3. hayvan eklenmek istenir → Pro uyarısı çıkar
6. Tartım girilir
7. Sağlık/aşı kaydı girilir
8. Hayvan detayında performans sekmesi kontrol edilir
9. Rapor → Sat/Bekle → kg fiyatı girilir → karar alınır

### Sürü Testi

1. Sürü modülü seçilir
2. Ayarlar → Ambar’dan Süt veya Genel yem eklenir
3. Sürü ekranında süt yemi stok kartı görünür
4. İnek kaydı eklenir
5. 3. inek eklenmek istenir → Pro uyarısı çıkar
6. Sabah ve akşam süt kaydı girilir
7. Süt Rapor ekranı kontrol edilir

### Kümes Testi

1. Kümes modülü seçilir
2. Ayarlar → Ambar’dan Kümes veya Genel yem eklenir
3. Kümes özet ekranında kümes yemi stok kartı görünür
4. Yeni kümes grubu eklenir
5. Toplam 20 tavuk sınırı test edilir
6. 21. tavuk eklenmek istenir → Pro uyarısı çıkar
7. Yumurta kaydı girilir
8. Satış eklenir
9. Kayıp / ölüm kaydı girilir
10. Grup uzun basma ile düzenle / arşivle / sil akışları kontrol edilir

### Genel Test

1. Uygulama kapatılıp açılır → veriler duruyor
2. Ayarlar → Yedek Al → dosya paylaşılır
3. Tüm Verileri Sil
4. Ayarlar → Yedekten Geri Yükle → veriler geri gelir
5. Ücretsiz limit aşılınca Pro ekranı açılır
6. İnternet yokken uygulama ana özellikleri çalışmaya devam eder

---

## 📌 Güncel Durum

Reçber şu anda temel ürün olarak:

- Besi kaydı
- Süt / Sürü kaydı
- Kümes kaydı
- Ortak Ambar
- Pro limitleri
- KVKK / Hakkında ekranları
- JSON yedekleme
- Çevrimdışı çalışma

özelliklerini içerir.

Market öncesi ana eksikler:

- Pro ödeme entegrasyonu
- Google Play kapalı test
- Ambar yem kullanım kayıtlarının tüm raporlara tam bağlanması
- Gerçek cihazlarda kapsamlı test

---

*Reçber v1.1.0 — Besi, Süt, Kümes & Ambar Yönetim Uygulaması*  
*Tamamen çevrimdışı • AsyncStorage • Expo SDK 53*
