import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';

const RECBER_RENK = '#3D5A3E';

export default function KvkkEkrani() {
  const email = 'destek.fkdigital@gmail.com';

  const mailGonder = async () => {
    const subject = 'Reçber KVKK Başvurusu';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    try {
      const destekleniyor = await Linking.canOpenURL(url);

      if (destekleniyor) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'E-posta açılamadı',
          'Cihazda e-posta uygulaması bulunamadı.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        'E-posta uygulaması açılırken bir sorun oluştu.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="KVKK Aydınlatma Metni"
        altBaslik="Kişisel verilerin korunması"
        modulRenk={RECBER_RENK}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={42}
              color="#fff"
            />
          </View>

          <Text style={styles.heroTitle}>KVKK Aydınlatma Metni</Text>

          <Text style={styles.heroText}>
            Bu metin, Reçber mobil uygulamasını kullanan kullanıcıların kişisel
            verilerinin nasıl işlendiğini açıklamak amacıyla hazırlanmıştır.
          </Text>

          <Text style={styles.dateText}>
            Son güncelleme: 16.06.2026
          </Text>
        </View>

        <InfoCard title="1. Veri Sorumlusu" icon="account-outline">
          <Text style={styles.paragraph}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel
            verileriniz, veri sorumlusu sıfatıyla aşağıdaki kişi tarafından
            işlenebilir:
          </Text>

          <InfoLine label="Veri Sorumlusu" value="Faruk Kurtuluş" />
          <InfoLine label="İletişim" value="destek.fkdigital@gmail.com" />
          <InfoLine label="Adres" value="Milas / Muğla" />
        </InfoCard>

        <InfoCard title="2. Reçber Uygulamasının Genel Yapısı" icon="cellphone">
          <Text style={styles.paragraph}>
            Reçber; besi, süt ve kümes takibi yapan üreticiler için geliştirilmiş
            bir çiftlik kayıt ve takip uygulamasıdır.
          </Text>

          <Text style={styles.paragraph}>
            Uygulama; hayvan kayıtları, yem kayıtları, süt ve yumurta üretimi,
            sağlık/aşı kayıtları, satış kayıtları, kayıp/ölüm kayıtları, fiyat
            ayarları, kar-zarar hesapları ve yedekleme işlemleri gibi özellikler
            sunar.
          </Text>

          <Text style={styles.paragraph}>
            Reçber’in temel çalışma mantığı çevrimdışı kullanıma uygundur.
            Uygulama içindeki temel kayıtlar cihaz hafızasında saklanır. Reçber,
            temel kullanımda bu kayıtları kendi sunucularına göndermez.
          </Text>
        </InfoCard>

        <InfoCard title="3. İşlenebilecek Kişisel Veriler" icon="database-outline">
          <Text style={styles.paragraph}>
            Reçber uygulamasının kullanımı sırasında aşağıdaki veri türleri
            işlenebilir:
          </Text>

          <Bullet text="Hayvan adı, takma adı, küpe numarası, ırk, cinsiyet, doğum tarihi, alış tarihi ve alış bilgileri" />
          <Bullet text="Tartım, kilo, yem alım ve yem tüketim kayıtları" />
          <Bullet text="Aşı, sağlık, veteriner ve bakım kayıtları" />
          <Bullet text="Süt üretim kayıtları" />
          <Bullet text="Kümes, yumurta, yem, satış ve kayıp/ölüm kayıtları" />
          <Bullet text="Satış tarihi, satış tutarı, alıcı bilgileri ve kullanıcı notları" />
          <Bullet text="Aktif modül seçimi, fiyat ayarları, Pro kullanım durumu ve uygulama tercihleri" />
          <Bullet text="Kullanıcının kendi isteğiyle oluşturduğu yedek dosyası içindeki kayıtlar" />
          <Bullet text="Pro satın alma durumunun kontrolü için gerekli teknik satın alma bilgileri" />

          <Text style={styles.paragraph}>
            Reçber; ödeme kartı numarası, kart güvenlik kodu veya banka şifresi
            gibi hassas ödeme bilgilerini doğrudan toplamaz veya saklamaz.
            Ödeme işlemleri Google Play ödeme altyapısı ve/veya ilgili ödeme
            hizmet sağlayıcıları üzerinden gerçekleştirilir.
          </Text>
        </InfoCard>

        <InfoCard title="4. Kişisel Verilerin İşlenme Amaçları" icon="target">
          <Bullet text="Uygulamanın temel özelliklerini çalıştırmak" />
          <Bullet text="Hayvan, yem, süt, yumurta, sağlık, satış ve finans kayıtlarını tutmak" />
          <Bullet text="Kullanıcı tarafından girilen veriler üzerinden hesaplama ve özetler oluşturmak" />
          <Bullet text="Sat/bekle, GCAA, kar-zarar ve benzeri pratik değerlendirmeler sunmak" />
          <Bullet text="Uygulama ayarlarını cihazda saklamak" />
          <Bullet text="Yedek alma ve yedekten geri yükleme işlemlerini sağlamak" />
          <Bullet text="Pro satın alma durumunu kontrol etmek" />
          <Bullet text="Satın alma işlemlerini doğrulamak" />
          <Bullet text="Kullanıcı destek taleplerini yanıtlamak" />
          <Bullet text="Uygulamanın güvenliğini, sürekliliğini ve düzgün çalışmasını sağlamak" />
          <Bullet text="Yasal yükümlülüklerin yerine getirilmesi" />
        </InfoCard>

        <InfoCard title="5. Verilerin Toplanma Yöntemi" icon="form-textbox">
          <Text style={styles.paragraph}>
            Kişisel verileriniz aşağıdaki yöntemlerle toplanabilir:
          </Text>

          <Bullet text="Kullanıcının uygulama içindeki formlara veri girmesi" />
          <Bullet text="Kullanıcının uygulama ayarlarını değiştirmesi" />
          <Bullet text="Kullanıcının yedek dosyası oluşturması veya yedekten geri yükleme yapması" />
          <Bullet text="Kullanıcının Pro satın alma işlemi başlatması" />
          <Bullet text="Google Play ve/veya RevenueCat gibi üçüncü taraf hizmetlerden satın alma doğrulama bilgisinin alınması" />
          <Bullet text="Kullanıcının e-posta veya diğer iletişim kanalları üzerinden destek talebi göndermesi" />
        </InfoCard>

        <InfoCard title="6. Hukuki Sebepler" icon="scale-balance">
          <Text style={styles.paragraph}>
            Kişisel verileriniz, KVKK’da belirtilen hukuki sebeplere dayanılarak
            işlenebilir.
          </Text>

          <Bullet text="Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması" />
          <Bullet text="Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi" />
          <Bullet text="Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması" />
          <Bullet text="İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri için veri işlemenin zorunlu olması" />
          <Bullet text="Gerekli olduğu hallerde açık rıza alınması" />
        </InfoCard>

        <InfoCard title="7. Verilerin Cihazda Saklanması" icon="cellphone-lock">
          <Text style={styles.paragraph}>
            Reçber uygulamasının temel özellikleri çevrimdışı çalışacak şekilde
            tasarlanmıştır.
          </Text>

          <Bullet text="Uygulama içindeki temel kayıtlar kullanıcının cihaz hafızasında saklanır." />
          <Bullet text="Uygulama silinirse cihazdaki kayıtlar kaybolabilir." />
          <Bullet text="Telefon değiştirilirse yedek alınmadıysa veriler yeni cihaza otomatik aktarılmayabilir." />
          <Bullet text="Kullanıcının düzenli olarak yedek alması önerilir." />
          <Bullet text="Yedek dosyasının güvenliği kullanıcının sorumluluğundadır." />
        </InfoCard>

        <InfoCard title="8. Yedekleme ve Geri Yükleme" icon="backup-restore">
          <Text style={styles.paragraph}>
            Reçber, kullanıcının isteğiyle yedek dosyası oluşturabilir. Bu yedek
            dosyası uygulama içindeki kayıtları içerebilir.
          </Text>

          <Text style={styles.paragraph}>
            Kullanıcı bu yedek dosyasını WhatsApp, e-posta, bulut depolama,
            dosya yöneticisi veya benzeri kanallar üzerinden paylaşabilir ya da
            saklayabilir.
          </Text>

          <Text style={styles.paragraph}>
            Yedek dosyasının üçüncü kişilerle paylaşılması halinde dosyanın
            güvenliğinden ve içeriğindeki bilgilerin korunmasından kullanıcı
            sorumludur.
          </Text>
        </InfoCard>

        <InfoCard title="9. Verilerin Aktarılması" icon="share-variant-outline">
          <Text style={styles.paragraph}>
            Reçber, temel kullanımda kullanıcı kayıtlarını kendi sunucularına
            aktarmaz.
          </Text>

          <Text style={styles.paragraph}>
            Ancak aşağıdaki hallerde bazı veriler üçüncü taraflara aktarılabilir
            veya üçüncü taraf hizmetler tarafından işlenebilir:
          </Text>

          <Bullet text="Pro satın alma ve ödeme işlemleri için Google Play ödeme altyapısı" />
          <Bullet text="Satın alma doğrulama ve Pro durum yönetimi için RevenueCat" />
          <Bullet text="Kullanıcının kendi isteğiyle yedek dosyasını paylaştığı uygulamalar veya servisler" />
          <Bullet text="Kullanıcının destek talebi göndermesi halinde e-posta veya iletişim hizmet sağlayıcıları" />
          <Bullet text="Yasal zorunluluklar kapsamında yetkili kamu kurum ve kuruluşları" />
        </InfoCard>

        <InfoCard title="10. Üçüncü Taraf Hizmetler" icon="link-variant">
          <Text style={styles.paragraph}>
            Reçber uygulamasında ödeme ve satın alma doğrulama amacıyla Google
            Play Billing ve RevenueCat gibi üçüncü taraf hizmetler kullanılabilir.
          </Text>

          <Text style={styles.paragraph}>
            Bu hizmetlerin kendi gizlilik politikaları ve veri işleme süreçleri
            bulunabilir. Kullanıcı, ödeme işlemi sırasında bu hizmet sağlayıcıların
            şartlarına da tabi olabilir.
          </Text>
        </InfoCard>

        <InfoCard title="11. Verilerin Saklama Süresi" icon="clock-outline">
          <Text style={styles.paragraph}>
            Cihazda saklanan uygulama kayıtları, kullanıcı tarafından silinene,
            uygulama kaldırılana veya cihaz verileri temizlenene kadar saklanabilir.
          </Text>

          <Text style={styles.paragraph}>
            Yedek dosyaları, kullanıcı tarafından saklandığı yerde tutulur ve
            silinmesi kullanıcının kontrolündedir.
          </Text>

          <Text style={styles.paragraph}>
            Satın alma ve ödeme doğrulama kayıtları, ilgili hizmet sağlayıcıların
            saklama politikalarına ve yasal yükümlülüklere göre saklanabilir.
          </Text>
        </InfoCard>

        <InfoCard title="12. Veri Güvenliği" icon="lock-outline">
          <Text style={styles.paragraph}>
            Reçber, kullanıcı verilerinin güvenliğini sağlamak için makul teknik
            ve idari önlemler almaya özen gösterir.
          </Text>

          <Text style={styles.paragraph}>
            Ancak uygulama temel olarak cihaz hafızasında çalıştığı için cihaz
            güvenliği, ekran kilidi, yedek dosyasının korunması ve üçüncü kişilerle
            paylaşılmaması kullanıcının sorumluluğundadır.
          </Text>
        </InfoCard>

        <InfoCard title="13. Kullanıcının Hakları" icon="account-check-outline">
          <Text style={styles.paragraph}>
            KVKK’nın 11. maddesi kapsamında kişisel verilerinizle ilgili olarak
            veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz:
          </Text>

          <Bullet text="Kişisel verilerinizin işlenip işlenmediğini öğrenme" />
          <Bullet text="İşlenmişse buna ilişkin bilgi talep etme" />
          <Bullet text="İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme" />
          <Bullet text="Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme" />
          <Bullet text="Eksik veya yanlış işlenmişse düzeltilmesini isteme" />
          <Bullet text="KVKK’da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme" />
          <Bullet text="Otomatik sistemler yoluyla aleyhe bir sonucun ortaya çıkmasına itiraz etme" />
          <Bullet text="Kanuna aykırı işleme sebebiyle zarara uğranması halinde zararın giderilmesini talep etme" />
        </InfoCard>

        <InfoCard title="14. Başvuru Yöntemi" icon="email-outline">
          <Text style={styles.paragraph}>
            KVKK kapsamındaki taleplerinizi aşağıdaki iletişim kanalı üzerinden
            iletebilirsiniz:
          </Text>

          <InfoLine label="E-posta" value={email} />

          <Text style={styles.paragraph}>
            Başvurunuzda ad, soyad, iletişim bilgisi ve talebinize ilişkin
            açıklamaya yer vermeniz önerilir. Talebiniz, mevzuatta öngörülen
            süreler içinde değerlendirilir.
          </Text>
        </InfoCard>

        <InfoCard title="15. Önemli Uyarı" icon="alert-circle-outline">
          <Text style={styles.paragraph}>
            Reçber içinde sunulan hesaplamalar, performans değerlendirmeleri,
            kar-zarar özetleri ve tavsiyeler yalnızca pratik bilgilendirme
            amaçlıdır.
          </Text>

          <Text style={styles.paragraph}>
            Uygulama; veterinerlik, ziraat mühendisliği, mali müşavirlik,
            yatırım danışmanlığı veya resmi danışmanlık hizmeti sunmaz. Hayvan
            sağlığı, besleme, bakım, satış, vergi ve mali kararlar için uzman
            görüşü alınması önerilir.
          </Text>
        </InfoCard>

        <InfoCard title="16. Metinde Yapılacak Değişiklikler" icon="file-document-edit-outline">
          <Text style={styles.paragraph}>
            Bu KVKK Aydınlatma Metni, uygulamadaki özellikler, ödeme altyapısı,
            veri işleme süreçleri veya yasal düzenlemelerdeki değişikliklere göre
            güncellenebilir.
          </Text>

          <Text style={styles.paragraph}>
            Güncel metin uygulama içinde kullanıcıların erişimine sunulur.
          </Text>
        </InfoCard>

        <TouchableOpacity
          style={styles.mailButton}
          onPress={mailGonder}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="email-outline" size={20} color="#fff" />
          <Text style={styles.mailButtonText}>KVKK Talebi İçin E-posta Gönder</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Reçber — KVKK Aydınlatma Metni
        </Text>
      </ScrollView>
    </View>
  );
}

function InfoCard({ title, icon, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={RECBER_RENK}
          />
        </View>

        <Text style={styles.cardTitle}>{title}</Text>
      </View>

      {children}
    </View>
  );
}

function Bullet({ text }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function InfoLine({ label, value }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F0E8',
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  heroCard: {
    backgroundColor: RECBER_RENK,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
  },

  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  heroTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },

  heroText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
  },

  dateText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.85,
    marginTop: 12,
  },

  card: {
    backgroundColor: COLORS.surface || '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3D5A3E20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary || '#1F2933',
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary || '#4B5563',
    marginBottom: 10,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  bulletDot: {
    width: 18,
    fontSize: 18,
    lineHeight: 22,
    color: RECBER_RENK,
    fontWeight: '900',
  },

  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary || '#4B5563',
  },

  infoLine: {
    backgroundColor: COLORS.background || '#F5F0E8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight || '#8A8A8A',
    marginBottom: 4,
    fontWeight: '700',
  },

  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary || '#1F2933',
    fontWeight: '800',
  },

  mailButton: {
    backgroundColor: RECBER_RENK,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },

  mailButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary || '#1F2933',
  },
});
