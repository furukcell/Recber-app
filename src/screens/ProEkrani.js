// src/screens/ProEkrani.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Purchases from 'react-native-purchases';
import COLORS from '../theme/colors';

const OZELLIKLER = [
  { ikon: 'cow', baslik: 'Sınırsız Besi Hayvanı', aciklama: 'İstediğiniz kadar dana ve boğa ekleyin' },
  { ikon: 'cow', baslik: 'Sınırsız Süt İneği', aciklama: 'Sürünüzü sınır olmadan takip edin' },
  { ikon: 'bird', baslik: 'Sınırsız Tavuk', aciklama: '20 tavuk sınırı kalkar, tüm kümesiniz kayıt altında' },
  { ikon: 'chart-line', baslik: 'Tüm Raporlar', aciklama: 'Gelir, gider ve verim raporlarına tam erişim' },
  { ikon: 'shield-check', baslik: 'Tek Seferlik Ödeme', aciklama: 'Abonelik yok, bir kez al ömür boyu kullan' },
];

export default function ProEkrani({ navigation }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [paket, setPaket] = useState(null);
  const [fiyat, setFiyat] = useState('499,99 ₺');

  useEffect(() => {
    pakетleriYukle();
  }, []);

  const pakетleriYukle = async () => {
    try {
      const teklifler = await Purchases.getOfferings();
      if (teklifler.current?.availablePackages?.length > 0) {
        const bulunanPaket = teklifler.current.availablePackages[0];
        setPaket(bulunanPaket);
        setFiyat(bulunanPaket.product.priceString);
      }
    } catch (e) {
      console.error('Paket yükleme hatası:', e);
    }
  };

  const handleSatinAl = async () => {
    if (!paket) {
      Alert.alert('Hata', 'Ürün bilgisi yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
      return;
    }
    setYukleniyor(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(paket);
      if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
        Alert.alert('Teşekkürler! 🎉', 'Reçber Pro\'ya hoş geldiniz. Tüm özellikler aktif.', [
          { text: 'Harika!', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert('Satın Alma Hatası', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setYukleniyor(false);
    }
  };

  const handleRestore = async () => {
    setYukleniyor(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
        Alert.alert('Başarılı ✅', 'Satın alımınız geri yüklendi!', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Bulunamadı', 'Bu hesaba ait Reçber Pro satın alımı bulunamadı.');
      }
    } catch (e) {
      Alert.alert('Hata', 'Geri yükleme başarısız. Lütfen tekrar deneyin.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <SafeAreaView style={styles.kapsayici}>
      <ScrollView contentContainerStyle={styles.icerik} showsVerticalScrollIndicator={false}>

        {/* Kapat */}
        <TouchableOpacity style={styles.kapatButon} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Başlık */}
        <View style={styles.baslikBlok}>
          <View style={styles.ikonKutu}>
            <MaterialCommunityIcons name="star-circle" size={48} color="#F5A623" />
          </View>
          <Text style={styles.baslik}>Reçber Pro</Text>
          <Text style={styles.altBaslik}>Çiftliğinizi sınır olmadan yönetin</Text>
        </View>

        {/* Özellikler */}
        <View style={styles.ozelliklerBlok}>
          {OZELLIKLER.map((o, i) => (
            <View key={i} style={styles.ozellikSatir}>
              <View style={styles.ozellikIkon}>
                <MaterialCommunityIcons name={o.ikon} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.ozellikMetin}>
                <Text style={styles.ozellikBaslik}>{o.baslik}</Text>
                <Text style={styles.ozellikAciklama}>{o.aciklama}</Text>
              </View>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
            </View>
          ))}
        </View>

        {/* Fiyat Kutusu */}
        <View style={styles.fiyatKutu}>
          <Text style={styles.fiyatEtiket}>Tek seferlik ödeme</Text>
          <Text style={styles.fiyat}>{fiyat}</Text>
          <Text style={styles.fiyatAlt}>Abonelik yok • Reklam yok • Sonsuza kadar</Text>
        </View>

        {/* Satın Al Butonu */}
        <TouchableOpacity
          style={[styles.satinAlButon, yukleniyor && styles.butonDevre]}
          onPress={handleSatinAl}
          disabled={yukleniyor}
          activeOpacity={0.85}
        >
          {yukleniyor ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.satinAlYazi}>Reçber Pro'ya Geç</Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreButon}
          onPress={handleRestore}
          disabled={yukleniyor}
        >
          <Text style={styles.restoreYazi}>Zaten satın aldım</Text>
        </TouchableOpacity>

        <Text style={styles.kvkkNot}>
          Satın alma Google Play üzerinden gerçekleşir. Gizlilik politikamız geçerlidir.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  kapsayici: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  icerik: {
    padding: 24,
    paddingBottom: 40,
  },
  kapatButon: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 8,
  },
  baslikBlok: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ikonKutu: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  baslik: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  altBaslik: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  ozelliklerBlok: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 14,
  },
  ozellikSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ozellikIkon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ozellikMetin: {
    flex: 1,
  },
  ozellikBaslik: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ozellikAciklama: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  fiyatKutu: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
  },
  fiyatEtiket: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fiyat: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  fiyatAlt: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  satinAlButon: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  butonDevre: {
    opacity: 0.6,
  },
  satinAlYazi: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  restoreButon: {
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreYazi: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  kvkkNot: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
});
