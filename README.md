# 🐄 Reçber — Besi, Süt/Sürü, Kümes ve Ortak Ambar Uygulaması

**Reçber**, küçük ve orta ölçekli üreticiler için geliştirilen, **çevrimdışı çalışan** bir React Native / Expo mobil uygulamasıdır.

Uygulama; **besi hayvanı**, **süt/sürü**, **kümes**, **yem stoğu**, **rasyon**, **maliyet**, **veteriner** ve **temel gelir takibini** tek çatı altında toplar.

İnternet bağlantısı zorunlu değildir. Veriler cihaz hafızasında saklanır.

---

## 🎯 Ana Amaç

Reçber’in amacı üreticinin günlük kayıtlarını basit, anlaşılır ve hızlı şekilde tutmasını sağlamaktır.

Uygulama şu sorulara cevap vermeyi hedefler:

* Hangi hayvan kaç kilo oldu?
* Günlük canlı ağırlık artışı iyi mi?
* Satmalı mıyım, beklemeli miyim?
* Ambarımda hangi yemden ne kadar kaldı?
* Rasyonla ne kadar yem tüketildi?
* Süt verimi ne durumda?
* Kümes yumurta, satış ve kayıp durumu ne?
* Yem, stok ve gelir/maliyet takibi nasıl gidiyor?

---

## 🧭 Modül Mantığı

Uygulama tek kurulumla farklı üretici tiplerine hizmet eder.

Desteklenen modüller:

| Modül           | Açıklama                                                           |
| --------------- | ------------------------------------------------------------------ |
| **Besi**        | Dana / boğa besi takibi, tartım, rasyon, veteriner, satış kararı   |
| **Süt/Sürü**    | Süt ineği, laktasyon, süt kaydı, sürü rasyonu                      |
| **Kümes**       | Tavuk grupları, yumurta kaydı, satış, kayıp ve kümes stok görünümü |
| **Ortak Ambar** | Tüm yem ve stok kayıtlarının merkezi yönetimi                      |

Aktif modül **Ayarlar** ekranından değiştirilir. Ana sayfada hızlı süt/besi geçişi kaldırılmıştır; modül değişimi tek yerden, Ayarlar’dan yapılır.

---

## 🧺 Ortak Ambar Mantığı

Reçber’de yem ve stok girişi merkezi olarak **Ayarlar > Ambar / Yem Stokları** ekranından yapılır.

Besi, Süt/Sürü ve Kümes ekranları kendi stoklarını Ambar’dan okur.

### Ambar Kategorileri

| Kategori          | Kullanım                                               |
| ----------------- | ------------------------------------------------------ |
| **Besi**          | Sadece besi tarafında gösterilecek yemler              |
| **Süt/Sürü**      | Süt ve sürü tarafında gösterilecek yemler              |
| **Kümes**         | Kümes tarafında gösterilecek yemler                    |
| **Genel / Ortak** | Besi, Süt/Sürü ve Kümes tarafında ortak görünen yemler |

### Önemli Not

**Genel / Ortak** seçilen yem tüm modüllerde görünür. Bu yüzden saman, silaj, yonca gibi yemlerde kullanıcı yanlışlıkla Genel / Ortak seçerse uygulama uyarı verir.

Yeni yem eklerken varsayılan kategori aktif modüle göre gelir:

| Aktif Modül | Varsayılan Ambar Kategorisi |
| ----------- | --------------------------- |
| Besi        | Besi                        |
| Sürü / Süt  | Süt/Sürü                    |
| Kümes       | Kümes                       |

---

## 🐄 Besi Modülü

Besi modülü hayvan bazlı takip için geliştirilmiştir.

### Özellikler

* Hayvan kaydı
* Küpe numarası
* Irk, cinsiyet, doğum tarihi
* Alış kilosu ve alış fiyatı
* Hedef kilo
* Haftalık / dönemsel tartım kaydı
* Günlük canlı ağırlık artışı hesabı
* Irka göre performans değerlendirmesi
* Sat / bekle karar motoru
* Hayvan satış kaydı
* Veteriner / sağlık takibi
* Rasyon sekmesi
* Ambar stok görünümü

### Rasyon Sistemi

Besi tarafında yem tüketimi için rasyon sistemi kullanılır.

* Hayvana özel bireysel rasyon tanımlanabilir
* “Tüm Besi Hayvanları” için grup rasyonu tanımlanabilir
* Bireysel rasyon varsa öncelikli çalışır
* Rasyon kalemleri Ambar’daki gerçek yemlerden seçilir
* Uygulama açıldığında geçen gün kadar yem Ambar’dan düşülür
* Hayvan satıldığında bireysel rasyon otomatik sonlandırılır

---

## 🥛 Süt / Sürü Modülü

Süt/Sürü modülü süt ineği ve laktasyon takibi için hazırlanmıştır.

### Özellikler

* İnek kaydı
* Küpe numarası
* Irk
* Laktasyon / kuru dönem / doğum yakın dönemi
* Sabah ve akşam süt kaydı
* Günlük toplam süt verimi
* Son 7 gün grafik görünümü
* Sürü rasyonu
* Süt/Sürü ambar stok görünümü
* Süt litre fiyatı ile gelir hesabı altyapısı

### Süt Fiyatı

Ayarlar ekranında **Süt Litre Fiyatı** girilebilir. Süt gelir hesaplarında bu değer kullanılmak üzere eklenmiştir.

---

## 🐔 Kümes Modülü

Kümes modülü tavuk grupları, yumurta, satış ve kayıp takibi için kullanılır.

### Özellikler

* Kümes grubu ekleme
* Irk / tip seçimi
* Mevcut tavuk sayısı
* Yumurta kaydı
* Kırık yumurta ve not girişi
* Satış kaydı
* Kayıp kaydı
* Kümes finans görünümü
* Kümes yem stok görünümü

### Kümes Yem Mantığı

Kümes tarafında artık ayrı yem alımı yapılmaz.

Yem girişi sadece **Ortak Ambar** üzerinden yapılır. Kümes Yem sekmesi, Ambar’daki **Kümes + Genel / Ortak** yem stoklarını salt okunur şekilde gösterir.

Bu sayede yem girişi tek yerde toplanır ve modül içi eski yem alımı karışıklığı önlenir.

### Kümes Fiyatları

Ayarlar ekranına şu fiyat alanları eklenmiştir:

* Yumurta adet fiyatı
* Tavuk canlı kg fiyatı
* Tavuk et kg fiyatı

Yumurta gelir hesabında yumurta adet fiyatı kullanılabilir. Tavuk kg fiyatları ise kg verisi mevcutsa kullanılmalıdır; kg verisi yoksa uydurma hesap yapılmamalıdır.

---

## ⚙️ Ayarlar

Ayarlar ekranında uygulamanın ana kontrol alanları bulunur.

### Aktif Modül

Aktif modül buradan değiştirilir:

* Besi
* Süt/Sürü
* Kümes

### Fiyat Ayarları

Ayarlar ekranında tüm modüllere ait temel fiyatlar girilebilir:

| Fiyat Alanı           | Kullanım                           |
| --------------------- | ---------------------------------- |
| Besi Canlı Kg Fiyatı  | Besi canlı satış/tahmin hesapları  |
| Besi Karkas Kg Fiyatı | Besi karkas satış/tahmin hesapları |
| Süt Litre Fiyatı      | Süt gelir hesapları                |
| Yumurta Adet Fiyatı   | Kümes yumurta gelir hesabı         |
| Tavuk Canlı Kg Fiyatı | Kümes canlı tavuk değer hesabı     |
| Tavuk Et Kg Fiyatı    | Kümes et/karkas değer hesabı       |

### Diğer Ayarlar

* Ambar / Yem Stokları
* Yedekleme / geri yükleme
* Pro ekranı
* Uygulama bilgileri

---

## 💎 Pro / Ödeme Sistemi

Reçber’de ücretsiz kullanım limitleri ve Pro sürüm mantığı vardır.

### Ücretsiz Limitler

| Modül    | Ücretsiz Limit |
| -------- | -------------- |
| Besi     | 2 besi hayvanı |
| Süt/Sürü | 2 süt ineği    |
| Kümes    | 20 tavuk       |

Limitler aşıldığında kullanıcı Pro ekranına yönlendirilir.

### Pro Entegrasyonu

RevenueCat / `react-native-purchases` altyapısı eklenmiştir.

Pro tarafında beklenen yapı:

* RevenueCat ürünleri panelden tanımlanır
* Google Play ürün ID’leri RevenueCat ile eşleştirilir
* Pro satın alma başarılı olunca limitler kaldırılır
* Geri yükleme / restore purchases desteklenir

> Not: Pro entegrasyonu kod tarafında eklenmiştir; gerçek mağaza testi için Google Play ürünleri, RevenueCat entitlement ve build testi tamamlanmalıdır.

---

## 🛠️ Teknolojiler

* React Native
* Expo SDK 53 hedefi
* AsyncStorage
* React Navigation
* Expo Vector Icons
* RevenueCat / react-native-purchases
* Android target SDK 35

---

## 📦 Android / Google Play Hazırlığı

Android ayarları güncel hedefe çekilmiştir:

| Alan              | Değer            |
| ----------------- | ---------------- |
| Package           | `com.recber.app` |
| Slug              | `recber`         |
| targetSdkVersion  | 35               |
| compileSdkVersion | 35               |
| minSdkVersion     | 24               |

### EAS Build

`eas.json` production profili Android için **AAB / app-bundle** üretir.

### Codemagic

Codemagic Android release workflow APK ve AAB üretmeye ayarlanmıştır.

Beklenen Play Store çıktısı:

```txt
android/app/build/outputs/bundle/release/*.aab
```

---

## 🚀 Kurulum

```bash
git clone https://github.com/furukcell/Recber-app.git
cd Recber-app
npm install --legacy-peer-deps
npx expo start --clear
```

---

## ✅ Build Öncesi Kontrol

Build almadan önce şu komutların çalıştırılması önerilir:

```bash
npx expo-doctor
npx expo install --fix
npx expo prebuild --clean --platform android
```

Codemagic veya EAS üzerinden AAB build alınmalıdır.

---

## 🧪 Manuel Test Listesi

Kapalı test veya market build’i öncesi şu akışlar kontrol edilmelidir:

### Genel

* Uygulama açılıyor mu?
* Aktif modül Ayarlar’dan değişiyor mu?
* Ana sayfada hızlı süt/besi geçişi yok mu?
* Veriler uygulama kapanıp açıldığında korunuyor mu?

### Ambar

* Besi modunda yeni yem varsayılan kategori Besi geliyor mu?
* Süt/Sürü modunda yeni yem varsayılan kategori Süt/Sürü geliyor mu?
* Kümes modunda yeni yem varsayılan kategori Kümes geliyor mu?
* Genel / Ortak seçilince açıklama görünüyor mu?
* Saman / silaj / yonca + Genel / Ortak seçilince uyarı çıkıyor mu?

### Besi

* Hayvan ekleniyor mu?
* Tartım kaydı giriliyor mu?
* Rasyon sekmesi açılıyor mu?
* Rasyon Ambar’dan yem seçebiliyor mu?
* Satış ve veteriner ekranları çalışıyor mu?

### Süt/Sürü

* İnek ekleniyor mu?
* Süt kaydı giriliyor mu?
* Süt rapor ekranı açılıyor mu?
* Süt litre fiyatı gelir hesabında kullanılabiliyor mu?

### Kümes

* Kümes ekranı açılıyor mu?
* Grup ekleniyor mu?
* Yumurta kaydı giriliyor mu?
* Yem sekmesi Ambar stoklarını gösteriyor mu?
* Eski kümes içi yem alımı görünmüyor mu?
* Finans sekmesi açılıyor mu?
* Satış ve kayıp kayıtları çalışıyor mu?

### Pro

* Limitler ücretsiz kullanıcıda çalışıyor mu?
* Pro ekranı açılıyor mu?
* Satın alma / restore akışı test ortamında denenebiliyor mu?

---

## 📌 Güncel Durum

Yapılan ana işler:

* Besi, Süt/Sürü ve Kümes modül yapısı oluşturuldu
* Ortak Ambar sistemi eklendi
* Rasyon sistemi eklendi
* Ambar kategori mantığı güncellendi
* Kümes içi eski yem alımı kaldırıldı; kümes yemleri Ambar’dan okunur hale getirildi
* Ayarlara süt, yumurta ve tavuk fiyatları eklendi
* Android package `com.recber.app` olarak güncellendi
* SDK 35 hedefleri eklendi
* RevenueCat / Pro altyapısı eklendi
* Codemagic ve EAS AAB build hedefiyle düzenlendi

Henüz yapılması gereken ana iş:

> Gerçek build alınmalı ve cihaz üzerinde uçtan uca test yapılmalıdır.

---

## 🧾 Teknik Borçlar

* [ ] `npx expo-doctor` çıktısı kontrol edilecek
* [ ] `npx expo install --fix` ile SDK 53 paket uyumu doğrulanacak
* [ ] Codemagic / EAS ile gerçek AAB build alınacak
* [ ] RevenueCat ürün ID ve entitlement ayarları mağaza panelinde doğrulanacak
* [ ] Pro satın alma test hesabıyla denenilecek
* [ ] Süt gelir hesabı fiyat ayarıyla uçtan uca test edilecek
* [ ] Kümes yumurta gelir hesabı fiyat ayarıyla uçtan uca test edilecek
* [ ] Tavuk kg verisi olmayan alanlarda uydurma hesap yapılmadığı doğrulanacak
* [ ] Ambar/rasyon tüketim kayıtları uzun kullanımda test edilecek
* [ ] Yedekleme / geri yükleme gerçek cihazda test edilecek
* [ ] README build sonrası tekrar güncellenecek

---

## 🗺️ Yol Haritası

### v0.1 — Teknik Toparlama

* [x] Expo / React Native proje yapısı
* [x] Android package güncellemesi
* [x] Ortak Ambar
* [x] Modül seçimi
* [x] Besi ana akışı
* [x] Süt/Sürü ana akışı
* [x] Kümes ana akışı
* [x] Pro altyapısı
* [ ] İlk başarılı AAB build

### v0.2 — Kapalı Test

* [ ] Gerçek cihaz testi
* [ ] Ambar + rasyon testi
* [ ] Besi uçtan uca test
* [ ] Süt/Sürü uçtan uca test
* [ ] Kümes uçtan uca test
* [ ] Pro satın alma testleri
* [ ] Play Console kapalı test yüklemesi

### v1.0 — Yayın Hazırlığı

* [ ] Store açıklaması
* [ ] Ekran görüntüleri
* [ ] Gizlilik politikası
* [ ] Ücretlendirme metni
* [ ] İlk üretici/pilot kullanıcı testi

---

## 👤 Geliştirici

**Faruk Kurtuluş**

GitHub: [furukcell](https://github.com/furukcell)

---

## Kısa Özet

Reçber’in mevcut hedefi yeni özellik eklemek değil; mevcut modülleri stabil hale getirip **ilk başarılı Android AAB build** almaktır.

Öncelik sırası:

1. Build al
2. Hata varsa sadece build hatasını düzelt
3. Gerçek cihazda Ambar / Besi / Süt / Kümes / Pro testleri yap
4. Kapalı teste yükle
