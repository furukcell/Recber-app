// Reçber - Ayarlar Ekranı
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Switch, TextInput, Share, Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';
import {
  getAktifModul, setAktifModul,
  getAyarlar, saveAyarlar,
  getProDurum, setProDurum,
  tumVerileriAl, verileriGeriYukle, tumVerileriSil,
} from '../data/storage';
import { APP, STORAGE_KEYS, VARSAYILAN_FIYATLAR } from '../data/constants';

const KUMES_RENK = '#A0522D';

const MODUL_BILGI = {
  besi:  { label: 'Besi',  emoji: '🐄', renk: COLORS.besi, altYazi: 'Besi — Dana & Boğa Takibi',     rozetYazi: 'BESİ' },
  suru:  { label: 'Sürü',  emoji: '🥛', renk: COLORS.suru, altYazi: 'Sürü — Süt İneği Takibi',        rozetYazi: 'SÜRÜ' },
  kumes: { label: 'Kümes', emoji: '🐔', renk: KUMES_RENK,  altYazi: 'Kümes — Tavuk & Yumurta Takibi', rozetYazi: 'KÜMES' },
};

export default function AyarlarScreen({ navigation, onModulDegis }) {
  const [aktifModul, setModul] = useState('besi');
  const [isPro, setIsPro] = useState(false);
  const [ayarlar, setAyarlar] = useState({ ...VARSAYILAN_FIYATLAR });
  const [yukleniyor, setYukleniyor] = useState(false);

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul || 'besi');
    const pro = await getProDurum();
    setIsPro(pro);
    const a = await getAyarlar();
    setAyarlar(a);
  };

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  const modulBilgi = MODUL_BILGI[aktifModul] || MODUL_BILGI.besi;
  const modulRenk = modulBilgi.renk;

  // ─── MODÜL DEĞİŞTİR ───────────────────────────────────────────
  const handleModulDegistir = () => {
    const digerModuller = Object.keys(MODUL_BILGI).filter(m => m !== aktifModul);

    const butonlar = digerModuller.map(m => ({
      text: `${MODUL_BILGI[m].emoji} ${MODUL_BILGI[m].label} Modülüne Geç`,
      onPress: async () => {
        await setAktifModul(m);
        setModul(m);
        if (onModulDegis) onModulDegis(m);
      },
    }));
    butonlar.push({ text: 'İptal', style: 'cancel' });

    Alert.alert('Modül Değiştir', 'Hangi modüle geçmek istiyorsunuz?', butonlar);
  };

  // ─── AYAR KAYDET ──────────────────────────────────────────────
  const handleAyarKaydet = async (yeniAyarlar) => {
    const guncel = { ...ayarlar, ...yeniAyarlar };
    setAyarlar(guncel);
    await saveAyarlar(guncel);
  };

  // ─── YEDEK AL ─────────────────────────────────────────────────
  const handleYedekAl = async () => {
    setYukleniyor(true);
    try {
      const veri = await tumVerileriAl();
      if (!veri) {
        Alert.alert('Hata', 'Yedek alınamadı.');
        return;
      }

      const tarih = new Date().toISOString().split('T')[0];
      const dosyaAdi = `recber-yedek-${tarih}.json`;
      const json = JSON.stringify(veri, null, 2);

      // Dosyayı geçici dizine yaz
      const dosyaYolu = `${FileSystem.documentDirectory}${dosyaAdi}`;
      await FileSystem.writeAsStringAsync(dosyaYolu, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Paylaş
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dosyaYolu, {
          mimeType: 'application/json',
          dialogTitle: 'Reçber Yedeğini Kaydet',
        });
      } else {
        await Share.share({ message: json, title: dosyaAdi });
      }
    } catch (e) {
      Alert.alert('Hata', 'Yedek alınırken bir sorun oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  // ─── YEDEKTEN GERİ YÜKLE ──────────────────────────────────────
  const handleGeriYukle = async () => {
    Alert.alert(
      'Yedekten Geri Yükle',
      'Mevcut verilerinizin üzerine yazılacak. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Devam Et',
          onPress: async () => {
            try {
              const sonuc = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });

              if (sonuc.canceled) return;

              const dosya = sonuc.assets[0];
              const icerik = await FileSystem.readAsStringAsync(dosya.uri, {
                encoding: FileSystem.EncodingType.UTF8,
              });

              const yedekNesnesi = JSON.parse(icerik);
              const basarili = await verileriGeriYukle(yedekNesnesi);

              if (basarili) {
                Alert.alert(
                  'Başarılı ✅',
                  'Veriler başarıyla geri yüklendi. Uygulama yeniden başlatılıyor.',
                  [{ text: 'Tamam', onPress: () => veriYukle() }]
                );
              } else {
                Alert.alert('Hata', 'Geri yükleme başarısız. Dosyayı kontrol edin.');
              }
            } catch (e) {
              Alert.alert('Hata', 'Geçersiz yedek dosyası.');
            }
          },
        },
      ]
    );
  };

  // ─── TÜM VERİLERİ SİL ─────────────────────────────────────────
  const handleVeriSil = () => {
    Alert.alert(
      '⚠️ Tüm Verileri Sil',
      'Bu işlem geri alınamaz! Tüm hayvan, yem, aşı ve rapor verileri silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            await tumVerileriSil();
            Alert.alert('Tamamlandı', 'Tüm veriler silindi.');
            veriYukle();
          },
        },
      ]
    );
  };

  // ─── PRO TEST (geliştirici) ────────────────────────────────────
  const handleProToggle = async () => {
    const yeni = !isPro;
    await setProDurum(yeni);
    setIsPro(yeni);
  };

  return (
    <View style={styles.container}>
      <HeaderBar baslik="Ayarlar" modulRenk={modulRenk} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollIcerik}>

        {/* Uygulama Bilgisi */}
        <View style={styles.uygulamaKart}>
          <Text style={styles.uygulamaLogo}>{modulBilgi.emoji}</Text>
          <Text style={styles.uygulamaAd}>{APP.isim}</Text>
          <Text style={styles.uygulamaVersiyon}>Versiyon {APP.versiyon}</Text>
          <View style={[styles.modulRozet, { backgroundColor: modulRenk }]}>
            <Text style={styles.modulRozetYazi}>
              {modulBilgi.emoji} {modulBilgi.label.toUpperCase()} MODU
            </Text>
          </View>
          {isPro && (
            <View style={[styles.proRozet, { backgroundColor: COLORS.accent }]}>
              <Text style={styles.proRozetYazi}>⭐ PRO</Text>
            </View>
          )}
        </View>

        {/* Modül */}
        <AyarGrubu baslik="MODÜL">
          <AyarSatir
            ikon="swap-horizontal"
            baslik="Aktif Modül"
            alt={modulBilgi.altYazi}
            renk={modulRenk}
            onPress={handleModulDegistir}
            sag={
              <View style={[styles.kucukRozet, { backgroundColor: modulRenk }]}>
                <Text style={styles.kucukRozetYazi}>{modulBilgi.rozetYazi}</Text>
              </View>
            }
          />
        </AyarGrubu>

        {/* Fiyat Ayarları — sadece Besi/Sürü modunda anlamlı */}
        {aktifModul !== 'kumes' && (
          <AyarGrubu baslik="FİYAT AYARLARI">
            <FiyatInput
              label="Canlı kg Fiyatı (TL)"
              value={ayarlar.canliKgFiyat?.toString()}
              onChange={(v) => handleAyarKaydet({ canliKgFiyat: parseFloat(v) || 0 })}
              renk={modulRenk}
            />
            <FiyatInput
              label="Karkas kg Fiyatı (TL)"
              value={ayarlar.karkasKgFiyat?.toString()}
              onChange={(v) => handleAyarKaydet({ karkasKgFiyat: parseFloat(v) || 0 })}
              renk={modulRenk}
            />
            <FiyatInput
              label="Randıman Oranı (0.50 - 0.65)"
              value={ayarlar.randimanOrani?.toString()}
              onChange={(v) => handleAyarKaydet({ randimanOrani: parseFloat(v) || 0.55 })}
              renk={modulRenk}
              klavye="decimal-pad"
            />
          </AyarGrubu>
        )}

        {/* Veri Yönetimi */}
        <AyarGrubu baslik="VERİ YÖNETİMİ">
          <AyarSatir
            ikon="download"
            baslik="Yedek Al"
            alt="Tüm verileri JSON dosyası olarak paylaş"
            renk={COLORS.success}
            onPress={handleYedekAl}
            yukleniyor={yukleniyor}
          />
          <AyarSatir
            ikon="upload"
            baslik="Yedekten Geri Yükle"
            alt="JSON yedek dosyasından verileri geri yükle"
            renk={COLORS.info}
            onPress={handleGeriYukle}
          />
          <AyarSatir
            ikon="delete-outline"
            baslik="Tüm Verileri Sil"
            alt="Hayvanlar, yemler, aşılar ve raporlar silinir"
            renk={COLORS.danger}
            onPress={handleVeriSil}
            tehlikeli
          />
        </AyarGrubu>

        {/* Veri Uyarısı */}
        <View style={styles.uyariKutu}>
          <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.warning} />
          <Text style={styles.uyariYazi}>
            Bu uygulama verileri telefon hafızasında saklar. İnternet gerekmez.
            Uygulama silinirse veriler kaybolabilir. Düzenli yedek almanız önerilir.
          </Text>
        </View>

         {/* Ambar */}
        <AyarGrubu baslik="AMBAR">
         <AyarSatir
             ikon="barn"
             baslik="Ambar / Yem Stokları"
             alt="Besi, süt ve kümes yemlerini ortak takip et"
             renk="#8E5A2A"
             onPress={() => navigation.navigate('Ambar')}
          />
         </AyarGrubu>

        {/* Hakkında */}
        <AyarGrubu baslik="HAKKINDA">
          <AyarSatir
            ikon="shield-check-outline"
            baslik="Gizlilik / KVKK"
            alt="KVKK Aydınlatma Metni ve veri güvenliği"
            renk={COLORS.success}
            onPress={() => navigation.navigate('Kvkk')}
         />
          <AyarSatir
            ikon="information-outline"
            baslik="Uygulama Hakkında"
            alt={`Reçber v${APP.versiyon} — Besi, Sürü & Kümes Yönetimi`}
            renk={modulRenk}
            onPress={() => navigation.navigate('Hakkimizda')}
          />
        </AyarGrubu>

        {/* Geliştirici - Pro Test */}
        <AyarGrubu baslik="GELİŞTİRİCİ">
          <AyarSatir
            ikon="star-outline"
            baslik="Pro Modu (Test)"
            alt={isPro ? 'Pro aktif' : 'Pro pasif'}
            renk={COLORS.accent}
            sag={
              <Switch
                value={isPro}
                onValueChange={handleProToggle}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={COLORS.surface}
              />
            }
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

function AyarSatir({ ikon, baslik, alt, renk, onPress, sag, tehlikeli, yukleniyor }) {
  return (
    <TouchableOpacity
      style={styles.satir}
      onPress={onPress}
      disabled={(!onPress && !sag) || yukleniyor}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.satirIkon, { backgroundColor: (tehlikeli ? COLORS.danger : renk) + '15' }]}>
        <MaterialCommunityIcons
          name={yukleniyor ? 'loading' : ikon}
          size={20}
          color={tehlikeli ? COLORS.danger : renk}
        />
      </View>
      <View style={styles.satirBilgi}>
        <Text style={[styles.satirBaslik, tehlikeli && { color: COLORS.danger }]}>
          {yukleniyor ? 'Yedek hazırlanıyor...' : baslik}
        </Text>
        {alt && <Text style={styles.satirAlt}>{alt}</Text>}
      </View>
      {sag ? sag : onPress ? (
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textLight} />
      ) : null}
    </TouchableOpacity>
  );
}

function FiyatInput({ label, value, onChange, renk, klavye }) {
  return (
    <View style={styles.fiyatSatir}>
      <Text style={styles.fiyatLabel}>{label}</Text>
      <TextInput
        style={[styles.fiyatInput, { borderColor: renk + '60' }]}
        value={value}
        onChangeText={onChange}
        keyboardType={klavye || 'numeric'}
        selectTextOnFocus
      />
    </View>
  );
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollIcerik: { padding: 16, paddingBottom: 40 },

  uygulamaKart: {
    backgroundColor: COLORS.surface, borderRadius: 20,
    padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  uygulamaLogo: { fontSize: 56, marginBottom: 8 },
  uygulamaAd: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 1 },
  uygulamaVersiyon: { fontSize: 13, color: COLORS.textLight, marginTop: 4, marginBottom: 12 },
  modulRozet: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  modulRozetYazi: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  proRozet: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  proRozetYazi: { fontSize: 12, fontWeight: '800', color: COLORS.textOnAccent },

  grup: { marginBottom: 20 },
  grupBaslik: {
    fontSize: 11, fontWeight: '800', color: COLORS.textLight,
    letterSpacing: 1.2, marginBottom: 8, marginLeft: 4,
  },
  grupIcerik: {
    backgroundColor: COLORS.surface, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },

  satir: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.divider,
  },
  satirIkon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  satirBilgi: { flex: 1 },
  satirBaslik: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  satirAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  fiyatSatir: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.divider,
    gap: 12,
  },
  fiyatLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  fiyatInput: {
    width: 90, backgroundColor: COLORS.background,
    borderRadius: 10, padding: 8, borderWidth: 1,
    fontSize: 14, fontWeight: '700', color: COLORS.textPrimary,
    textAlign: 'right',
  },

  uyariKutu: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: COLORS.warning + '15',
    borderRadius: 14, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.warning + '30',
  },
  uyariYazi: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  kucukRozet: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  kucukRozetYazi: { fontSize: 11, fontWeight: '800', color: '#fff' },
});
