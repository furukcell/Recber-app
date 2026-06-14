// Reçber - Ayarlar Ekranı
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';
import { getAktifModul, setAktifModul } from '../data/storage';
import { APP, STORAGE_KEYS } from '../data/constants';

export default function AyarlarScreen({ navigation }) {
  const [aktifModul, setModul] = useState('besi');
  const [bildirimAcik, setBildirimAcik] = useState(true);

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul);
  };

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  const modulRenk = aktifModul === 'besi' ? COLORS.besi : COLORS.suru;

  const handleModulDegistir = () => {
    Alert.alert(
      'Modül Değiştir',
      'Hangi modüle geçmek istiyorsunuz?',
      [
        {
          text: aktifModul === 'besi' ? 'Sürü Modülüne Geç' : 'Besi Modülüne Geç',
          onPress: async () => {
            const yeni = aktifModul === 'besi' ? 'suru' : 'besi';
            await setAktifModul(yeni);
            setModul(yeni);
          }
        },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  const handleTumVerileriSil = () => {
    Alert.alert(
      '⚠️ Tüm Verileri Sil',
      'Bu işlem geri alınamaz! Tüm hayvan, yem, aşı ve rapor verileri silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = Object.values(STORAGE_KEYS);
              await AsyncStorage.multiRemove(keys);
              Alert.alert('Tamamlandı', 'Tüm veriler silindi.');
            } catch (e) {
              Alert.alert('Hata', 'Veriler silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Ayarlar"
        modulRenk={modulRenk}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollIcerik}>

        {/* Uygulama Bilgisi */}
        <View style={styles.uygulamaKart}>
          <Text style={styles.uygulamaLogo}>🐄</Text>
          <Text style={styles.uygulamaAd}>{APP.isim}</Text>
          <Text style={styles.uygulamaVersiyon}>Versiyon {APP.versiyon}</Text>
          <View style={[styles.modulRozet, { backgroundColor: modulRenk }]}>
            <Text style={styles.modulRozetYazi}>
              {aktifModul === 'besi' ? '🐄 BESİ MODU' : '🥛 SÜRÜ MODU'}
            </Text>
          </View>
        </View>

        {/* Modül Ayarları */}
        <AyarGrubu baslik="MODÜL">
          <AyarSatir
            ikon="swap-horizontal"
            baslik="Aktif Modül"
            alt={aktifModul === 'besi' ? 'Besi — Dana & Boğa Takibi' : 'Sürü — Süt İneği Takibi'}
            renk={modulRenk}
            onPress={handleModulDegistir}
            sag={
              <View style={[styles.kucukRozet, { backgroundColor: modulRenk }]}>
                <Text style={styles.kucukRozetYazi}>{aktifModul === 'besi' ? 'BESİ' : 'SÜRÜ'}</Text>
              </View>
            }
          />
        </AyarGrubu>

        {/* Bildirim Ayarları */}
        <AyarGrubu baslik="BİLDİRİMLER">
          <AyarSatir
            ikon="bell-outline"
            baslik="Tartım Hatırlatıcı"
            alt="Haftalık tartım zamanı geldiğinde bildir"
            renk={modulRenk}
            sag={
              <Switch
                value={bildirimAcik}
                onValueChange={setBildirimAcik}
                trackColor={{ false: COLORS.border, true: modulRenk }}
                thumbColor={COLORS.surface}
              />
            }
          />
          <AyarSatir
            ikon="alert-circle-outline"
            baslik="Stok Uyarısı"
            alt="Yem stoğu kritik seviyeye düşünce bildir"
            renk={COLORS.warning}
            sag={
              <Switch
                value={bildirimAcik}
                onValueChange={setBildirimAcik}
                trackColor={{ false: COLORS.border, true: COLORS.warning }}
                thumbColor={COLORS.surface}
              />
            }
          />
        </AyarGrubu>

        {/* Hakkında */}
        <AyarGrubu baslik="HAKKINDA">
          <AyarSatir
            ikon="information-outline"
            baslik="Uygulama Hakkında"
            alt="Reçber — Çiftlik Yönetim Uygulaması"
            renk={modulRenk}
            onPress={() => Alert.alert('Reçber', `Versiyon ${APP.versiyon}\n\nBesi & Süt Çiftliği Yönetim Uygulaması\n\nTüm veriler cihazınızda saklanır.`)}
          />
          <AyarSatir
            ikon="shield-check-outline"
            baslik="Gizlilik"
            alt="Verileriniz yalnızca cihazınızda saklanır"
            renk={COLORS.success}
          />
        </AyarGrubu>

        {/* Tehlikeli Bölge */}
        <AyarGrubu baslik="VERİ YÖNETİMİ">
          <AyarSatir
            ikon="delete-outline"
            baslik="Tüm Verileri Sil"
            alt="Hayvanlar, yemler, aşılar ve raporlar silinir"
            renk={COLORS.danger}
            onPress={handleTumVerileriSil}
            tehlikeli
          />
        </AyarGrubu>

      </ScrollView>
    </View>
  );
}

// ─── ALT COMPONENTLER ─────────────────────────────────────────────

function AyarGrubu({ baslik, children }) {
  return (
    <View style={styles.grup}>
      <Text style={styles.grupBaslik}>{baslik}</Text>
      <View style={styles.grupIcerik}>{children}</View>
    </View>
  );
}

function AyarSatir({ ikon, baslik, alt, renk, onPress, sag, tehlikeli }) {
  return (
    <TouchableOpacity
      style={styles.satir}
      onPress={onPress}
      disabled={!onPress && !sag}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.satirIkon, { backgroundColor: (tehlikeli ? COLORS.danger : renk) + '15' }]}>
        <MaterialCommunityIcons
          name={ikon}
          size={20}
          color={tehlikeli ? COLORS.danger : renk}
        />
      </View>
      <View style={styles.satirBilgi}>
        <Text style={[styles.satirBaslik, tehlikeli && { color: COLORS.danger }]}>{baslik}</Text>
        {alt && <Text style={styles.satirAlt}>{alt}</Text>}
      </View>
      {sag ? sag : onPress ? (
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textLight} />
      ) : null}
    </TouchableOpacity>
  );
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollIcerik: { padding: 16, paddingBottom: 40 },

  uygulamaKart: {
    backgroundColor: COLORS.surface,
    borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  uygulamaLogo: { fontSize: 56, marginBottom: 8 },
  uygulamaAd: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 1 },
  uygulamaVersiyon: { fontSize: 13, color: COLORS.textLight, marginTop: 4, marginBottom: 12 },
  modulRozet: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  modulRozetYazi: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  grup: { marginBottom: 20 },
  grupBaslik: {
    fontSize: 11, fontWeight: '800',
    color: COLORS.textLight, letterSpacing: 1.2,
    marginBottom: 8, marginLeft: 4,
  },
  grupIcerik: {
    backgroundColor: COLORS.surface,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },

  satir: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.divider,
  },
  satirIkon: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  satirBilgi: { flex: 1 },
  satirBaslik: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  satirAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  kucukRozet: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  kucukRozetYazi: { fontSize: 11, fontWeight: '800', color: '#fff' },
});
