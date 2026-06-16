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

export default function HakkimizdaScreen() {
  const iletisimeGec = async () => {
    const email = 'destek@recber.app'; // Burayı kendi destek e-postanla değiştir.
    const subject = 'Reçber Uygulaması Hakkında';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
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
        baslik="Hakkımızda"
        altBaslik="Reçber hakkında"
        modulRenk={RECBER_RENK}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="cow" size={38} color="#fff" />
          </View>

          <Text style={styles.heroTitle}>Reçber</Text>

          <Text style={styles.heroSubtitle}>
            Besi, süt ve kümes takibi için sade ve pratik çiftlik yönetim
            uygulaması.
          </Text>
        </View>

        <InfoCard icon="sprout" title="Reçber Nedir?">
          <Text style={styles.paragraph}>
            Reçber, küçük ve orta ölçekli hayvancılık yapan üreticiler için
            geliştirilmiş pratik bir çiftlik takip uygulamasıdır.
          </Text>

          <Text style={styles.paragraph}>
            Amacımız; besi, süt ve kümes takibini kağıt defterlerden çıkarıp
            daha düzenli, anlaşılır ve kolay kullanılabilir hale getirmektir.
            Reçber ile hayvan kayıtları, yem giderleri, süt ve yumurta
            üretimi, satışlar, sağlık kayıtları ve kar-zarar durumu tek
            yerden takip edilebilir.
          </Text>
        </InfoCard>

        <InfoCard icon="clipboard-text-outline" title="Neden Geliştirildi?">
          <Text style={styles.paragraph}>
            Üreticiler çoğu zaman hayvan, yem, süt, yumurta, sağlık ve satış
            kayıtlarını farklı defterlerde veya dağınık notlarda tutar. Bu
            durum hem takip etmeyi zorlaştırır hem de işletmenin gerçek
            kazancını görmeyi geciktirir.
          </Text>

          <Text style={styles.paragraph}>
            Reçber, bu kayıtları tek yerde toplayarak üreticinin günlük iş
            yükünü azaltmak, kayıt tutmayı kolaylaştırmak ve işletme durumunu
            daha görünür hale getirmek için tasarlanmıştır.
          </Text>
        </InfoCard>

        <InfoCard icon="view-dashboard-outline" title="Uygulamada Neler Var?">
          <FeatureRow
            icon="cow"
            text="Besi hayvanı kayıt ve tartım takibi"
          />
          <FeatureRow
            icon="chart-line"
            text="GCAA ve ırka göre performans değerlendirmesi"
          />
          <FeatureRow
            icon="food-variant"
            text="Yem stok ve yem maliyeti takibi"
          />
          <FeatureRow
            icon="medical-bag"
            text="Aşı, sağlık ve veteriner kayıtları"
          />
          <FeatureRow
            icon="cup-water"
            text="Süt ineği ve günlük süt verimi takibi"
          />
          <FeatureRow
            icon="egg"
            text="Kümes, yumurta, yem, satış ve kayıp takibi"
          />
          <FeatureRow
            icon="cash"
            text="Satış, gelir-gider ve kar-zarar hesapları"
          />
          <FeatureRow
            icon="whatsapp"
            text="Raporları paylaşmaya uygun özet metinler"
          />
        </InfoCard>

        <InfoCard icon="wifi-off" title="Çevrimdışı Çalışma">
          <Text style={styles.paragraph}>
            Reçber, sahada çalışan üreticiler düşünülerek tasarlanmıştır. Bu
            yüzden uygulama karmaşık üyelik adımları veya sürekli internet
            ihtiyacı üzerine kurulmamıştır.
          </Text>

          <Text style={styles.paragraph}>
            Temel özellikler internet bağlantısı olmadan kullanılabilir.
            Veriler cihaz hafızasında saklanır. Kullanıcı isterse yedek
            alabilir ve daha sonra yedekten geri yükleme yapabilir.
          </Text>
        </InfoCard>

        <InfoCard icon="shield-lock-outline" title="Veri ve Gizlilik Yaklaşımı">
          <Text style={styles.paragraph}>
            Reçber’in temel yaklaşımı kullanıcı verilerini sade, anlaşılır ve
            güvenli şekilde yönetmektir. Uygulamadaki kayıtlar cihaz
            hafızasında tutulur. Reçber, temel kullanımda verilerinizi kendi
            sunucularına göndermez.
          </Text>

          <Text style={styles.paragraph}>
            Yedekleme işlemi kullanıcı isteğiyle yapılır. Kullanıcı yedek
            dosyasını paylaşmayı, saklamayı veya silmeyi kendisi yönetir.
          </Text>
        </InfoCard>

        <InfoCard icon="alert-circle-outline" title="Önemli Bilgilendirme">
          <Text style={styles.paragraph}>
            Reçber içinde sunulan hesaplamalar, performans değerlendirmeleri ve
            tavsiyeler pratik bilgilendirme amaçlıdır.
          </Text>

          <Text style={styles.paragraph}>
            Uygulama; veterinerlik, ziraat mühendisliği, mali müşavirlik,
            yatırım danışmanlığı veya resmi danışmanlık hizmeti yerine geçmez.
            Hayvan sağlığı, besleme, bakım, satış ve mali kararlar için uzman
            görüşü alınması önerilir.
          </Text>
        </InfoCard>

        <InfoCard icon="heart-outline" title="Geliştirme Yaklaşımı">
          <Text style={styles.paragraph}>
            Reçber’in önceliği sade kullanım, çevrimdışı çalışma, anlaşılır
            ekranlar ve üreticinin gerçekten ihtiyaç duyduğu özellikleri
            sunmaktır.
          </Text>

          <Text style={styles.paragraph}>
            Uygulama zamanla kullanıcı geri bildirimlerine göre geliştirilmeye
            devam edecektir. Hedefimiz, üreticinin işini kolaylaştıran güvenilir
            bir dijital kayıt defteri oluşturmaktır.
          </Text>
        </InfoCard>

        <View style={styles.sloganCard}>
          <Text style={styles.slogan}>
            Üretici işini bilsin, kayıtlarını unutmasın, kazancını daha net
            görsün.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={iletisimeGec}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="email-outline" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>İletişime Geç</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Reçber — Besi, Süt ve Kümes Takibi
        </Text>

        <Text style={styles.version}>v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function InfoCard({ icon, title, children }) {
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

function FeatureRow({ icon, text }) {
  return (
    <View style={styles.featureRow}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={RECBER_RENK}
      />

      <Text style={styles.featureText}>{text}</Text>
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

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
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

  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginBottom: 10,
  },

  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary || '#4B5563',
  },

  sloganCard: {
    backgroundColor: '#C9A84C22',
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C9A84C55',
  },

  slogan: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '800',
    color: RECBER_RENK,
    textAlign: 'center',
  },

  contactButton: {
    backgroundColor: RECBER_RENK,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },

  contactButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary || '#1F2933',
  },

  version: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textLight || '#9CA3AF',
  },
});
