// Reçber - Ana Sayfa
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';
import TYPOGRAPHY from '../theme/typography';
import { getGenel, getHayvanlar, getStokDurum, getSaglikKayitlar, getAktifModul, setAktifModul } from '../data/storage';
import { GCAA_SINIRLAR, GCAA_RENKLER } from '../data/constants';

const KUMES_RENK = '#A0522D';

export default function HomeScreen({ navigation }) {
  const [aktifModul, setModul] = useState('besi');
  const [ozet, setOzet] = useState({ toplamHayvan: 0, hastaHayvanSayisi: 0, toplamYemMaliyet: 0, satilan: 0 });
  const [hayvanlar, setHayvanlar] = useState([]);
  const [stoklar, setStoklar] = useState([]);
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul);
    const genel = await getGenel();
    setOzet(genel);
    const liste = await getHayvanlar();
    setHayvanlar(liste.filter(h => !h.satildiMi).slice(0, 3));
    const stok = await getStokDurum();
    setStoklar(stok.filter(s => s.toplamAlinan > 0).slice(0, 3));
  };

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  const onYenile = async () => {
    setYenileniyor(true);
    await veriYukle();
    setYenileniyor(false);
  };

  const modulDegistir = async () => {
    const yeni = aktifModul === 'besi' ? 'suru' : 'besi';
    await setAktifModul(yeni);
    setModul(yeni);
    veriYukle();
  };

  const modulRenk = aktifModul === 'besi' ? COLORS.besi : COLORS.suru;

  // GCAA hesapla
  const gcaaHesapla = (alis, guncel, gun) => {
    const fark = parseFloat(guncel) - parseFloat(alis);
    const g = parseFloat(gun) || 1;
    return (fark / g).toFixed(2);
  };

  const gcaaRenk = (v) => {
    if (v < GCAA_SINIRLAR.dusuk) return GCAA_RENKLER.dusuk;
    if (v < GCAA_SINIRLAR.orta) return GCAA_RENKLER.orta;
    return GCAA_RENKLER.iyi;
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Reçber"
        altBaslik={aktifModul === 'besi' ? 'Besi Takibi' : 'Sürü Takibi'}
        modulRenk={modulRenk}
        sagIcon="swap-horizontal"
        sagOnPress={modulDegistir}
      />

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={onYenile} tintColor={modulRenk} />}
      >
        {/* Modül Rozeti */}
        <View style={[styles.modulRozet, { backgroundColor: modulRenk }]}>
          <MaterialCommunityIcons name="cow" size={16} color="#fff" />
          <Text style={styles.modulRozetYazi}>
            {aktifModul === 'besi' ? 'BESİ BÖLÜMÜ' : 'SÜRÜ BÖLÜMÜ'}
          </Text>
          <TouchableOpacity onPress={modulDegistir}>
            <Text style={styles.modulDegistir}>Değiştir →</Text>
          </TouchableOpacity>
        </View>

        {/* Kümes Modülü Girişi */}
        <TouchableOpacity
          style={styles.kumesGirisKart}
          onPress={() => navigation.navigate('Kumes')}
          activeOpacity={0.85}
        >
          <View style={[styles.kumesIkonKutu, { backgroundColor: KUMES_RENK }]}>
            <MaterialCommunityIcons name="bird" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.kumesGirisBaslik}>🐔 Kümes</Text>
            <Text style={styles.kumesGirisAlt}>Tavuk, yumurta ve yem takibi</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={26} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Özet Kartlar */}
        <View style={styles.ozetGrid}>
          <OzetKart
            ikon="cow"
            baslik="Hayvan"
            deger={ozet.toplamHayvan.toString()}
            alt="Aktif"
            renk={modulRenk}
          />
          <OzetKart
            ikon="alert-circle-outline"
            baslik="Hasta"
            deger={ozet.hastaHayvanSayisi.toString()}
            alt="Takipte"
            renk={ozet.hastaHayvanSayisi > 0 ? COLORS.danger : COLORS.success}
          />
          <OzetKart
            ikon="cash"
            baslik="Yem"
            deger={`${Math.round(ozet.toplamYemMaliyet / 1000)}K`}
            alt="TL Harcama"
            renk={COLORS.accent}
          />
          <OzetKart
            ikon="check-circle-outline"
            baslik="Satılan"
            deger={ozet.satilan.toString()}
            alt="Hayvan"
            renk={COLORS.textSecondary}
          />
        </View>

        {/* Hasta Uyarısı */}
        {ozet.hastaHayvanSayisi > 0 && (
          <TouchableOpacity
            style={styles.uyariKutu}
            onPress={() => navigation.navigate('Veteriner')}
          >
            <MaterialCommunityIcons name="alert" size={22} color={COLORS.danger} />
            <Text style={styles.uyariYazi}>
              {ozet.hastaHayvanSayisi} hayvan takipte! Veteriner ekranına git →
            </Text>
          </TouchableOpacity>
        )}

        {/* Son Hayvanlar */}
        <View style={styles.bolum}>
          <View style={styles.bolumUst}>
            <Text style={styles.bolumBaslik}>Son Hayvanlar</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Hayvanlar')}>
              <Text style={[styles.tumunu, { color: modulRenk }]}>Tümü →</Text>
            </TouchableOpacity>
          </View>

          {hayvanlar.length === 0 ? (
            <BosDurum
              ikon="cow-off"
              mesaj="Henüz hayvan eklenmemiş"
              butonYazi="Hayvan Ekle"
              onPress={() => navigation.navigate('Hayvanlar')}
              renk={modulRenk}
            />
          ) : (
            hayvanlar.map(h => {
              const gun = Math.floor((Date.now() - new Date(h.olusturmaTarihi)) / 86400000);
              const gcaa = gcaaHesapla(h.alisKilo, h.guncelKilo, gun);
              return (
                <TouchableOpacity
                  key={h.id}
                  style={styles.hayvanSatir}
                  onPress={() => navigation.navigate('Hayvanlar', { screen: 'HayvanDetay', params: { hayvan: h } })}
                >
                  <View style={[styles.hayvanIkonKutu, { backgroundColor: modulRenk }]}>
                    <MaterialCommunityIcons name="cow" size={22} color="#fff" />
                  </View>
                  <View style={styles.hayvanBilgi}>
                    <Text style={styles.hayvanIsim}>{h.isim || h.no}</Text>
                    <Text style={styles.hayvanAlt}>{gun} günlük besi • {h.guncelKilo} kg</Text>
                  </View>
                  <View style={styles.gcaaKutu}>
                    <Text style={[styles.gcaaDeger, { color: gcaaRenk(gcaa) }]}>{gcaa}</Text>
                    <Text style={styles.gcaaLabel}>kg/gün</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Yem Stok Özeti */}
        <View style={[styles.bolum, { marginBottom: 30 }]}>
          <View style={styles.bolumUst}>
            <Text style={styles.bolumBaslik}>Yem Stoku</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Yem')}>
              <Text style={[styles.tumunu, { color: modulRenk }]}>Detay →</Text>
            </TouchableOpacity>
          </View>

          {stoklar.length === 0 ? (
            <BosDurum
              ikon="barley-off"
              mesaj="Henüz yem alımı yapılmamış"
              butonYazi="Yem Ekle"
              onPress={() => navigation.navigate('Yem')}
              renk={modulRenk}
            />
          ) : (
            stoklar.map(s => (
              <View key={s.tip} style={styles.stokSatir}>
                <Text style={styles.stokTip}>{s.tip.charAt(0).toUpperCase() + s.tip.slice(1)}</Text>
                <View style={styles.stokBarKap}>
                  <View style={[styles.stokBar, {
                    width: `${Math.min(s.yuzde, 100)}%`,
                    backgroundColor: s.yuzde < 20 ? COLORS.danger : s.yuzde < 50 ? COLORS.warning : modulRenk,
                  }]} />
                </View>
                <Text style={styles.stokKalan}>{Math.round(s.kalan)} kg</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ALT COMPONENTLER ─────────────────────────────────────────────

function OzetKart({ ikon, baslik, deger, alt, renk }) {
  return (
    <View style={styles.ozetKart}>
      <View style={[styles.ozetIkon, { backgroundColor: renk + '20' }]}>
        <MaterialCommunityIcons name={ikon} size={22} color={renk} />
      </View>
      <Text style={[styles.ozetDeger, { color: renk }]}>{deger}</Text>
      <Text style={styles.ozetBaslik}>{baslik}</Text>
      <Text style={styles.ozetAlt}>{alt}</Text>
    </View>
  );
}

function BosDurum({ ikon, mesaj, butonYazi, onPress, renk }) {
  return (
    <View style={styles.bosDurum}>
      <MaterialCommunityIcons name={ikon} size={36} color={COLORS.textLight} />
      <Text style={styles.bosMesaj}>{mesaj}</Text>
      <TouchableOpacity style={[styles.bosButon, { backgroundColor: renk }]} onPress={onPress}>
        <Text style={styles.bosButonYazi}>{butonYazi}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  modulRozet: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  modulRozetYazi: { fontSize: 12, fontWeight: '700', color: '#fff', flex: 1, letterSpacing: 1 },
  modulDegistir: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

  kumesGirisKart: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  kumesIkonKutu: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  kumesGirisBaslik: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  kumesGirisAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  ozetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  ozetKart: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  ozetIkon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  ozetDeger: { fontSize: 26, fontWeight: '900' },
  ozetBaslik: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  ozetAlt: { fontSize: 11, color: COLORS.textLight },

  uyariKutu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '15',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.danger + '40',
  },
  uyariYazi: { fontSize: 13, fontWeight: '600', color: COLORS.danger, flex: 1 },

  bolum: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  bolumUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bolumBaslik: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  tumunu: { fontSize: 13, fontWeight: '600' },

  hayvanSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  hayvanIkonKutu: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  hayvanBilgi: { flex: 1, marginLeft: 12 },
  hayvanIsim: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  hayvanAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  gcaaKutu: { alignItems: 'center' },
  gcaaDeger: { fontSize: 18, fontWeight: '900' },
  gcaaLabel: { fontSize: 10, color: COLORS.textLight },

  stokSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  stokTip: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, width: 70 },
  stokBarKap: { flex: 1, height: 8, backgroundColor: COLORS.borderLight, borderRadius: 4, overflow: 'hidden' },
  stokBar: { height: 8, borderRadius: 4 },
  stokKalan: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, width: 55, textAlign: 'right' },

  bosDurum: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  bosMesaj: { fontSize: 13, color: COLORS.textLight },
  bosButon: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  bosButonYazi: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
