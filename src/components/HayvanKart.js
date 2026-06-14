// Reçber - HayvanKart Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { GCAA_SINIRLAR, GCAA_RENKLER } from '../data/constants';

export default function HayvanKart({ hayvan, onPress, modulRenk }) {
  const renk = modulRenk || COLORS.primary;

  const gunHesapla = () => {
    if (!hayvan.olusturmaTarihi) return 0;
    return Math.floor((Date.now() - new Date(hayvan.olusturmaTarihi)) / 86400000);
  };

  const gcaaHesapla = () => {
    const gun = gunHesapla() || 1;
    const fark = parseFloat(hayvan.guncelKilo || 0) - parseFloat(hayvan.alisKilo || 0);
    return (fark / gun).toFixed(2);
  };

  const gcaaRenk = (v) => {
    if (v < GCAA_SINIRLAR.dusuk) return GCAA_RENKLER.dusuk;
    if (v < GCAA_SINIRLAR.orta) return GCAA_RENKLER.orta;
    return GCAA_RENKLER.iyi;
  };

  const saglikRenk = () => {
    if (hayvan.saglik === 'hasta') return COLORS.danger;
    if (hayvan.saglik === 'kontrolde') return COLORS.warning;
    return COLORS.success;
  };

  const saglikYazi = () => {
    if (hayvan.saglik === 'hasta') return 'Hasta ⚠️';
    if (hayvan.saglik === 'kontrolde') return 'Kontrolde';
    return 'Sağlıklı ✅';
  };

  const gun = gunHesapla();
  const gcaa = gcaaHesapla();
  const kgFark = parseFloat(hayvan.guncelKilo || 0) - parseFloat(hayvan.alisKilo || 0);

  return (
    <TouchableOpacity style={styles.kart} onPress={onPress} activeOpacity={0.85}>
      {/* Üst: İkon + İsim + Sağlık */}
      <View style={styles.ust}>
        <View style={[styles.ikonKutu, { backgroundColor: renk }]}>
          <MaterialCommunityIcons name="cow" size={26} color="#fff" />
        </View>
        <View style={styles.isimKisim}>
          <Text style={styles.isim}>{hayvan.isim || hayvan.no || 'İsimsiz'}</Text>
          <Text style={styles.kupe}>{hayvan.kupeNo || hayvan.kupe || '-'}</Text>
        </View>
        <View style={[styles.saglikRozet, { backgroundColor: saglikRenk() + '20', borderColor: saglikRenk() }]}>
          <Text style={[styles.saglikYazi, { color: saglikRenk() }]}>{saglikYazi()}</Text>
        </View>
      </View>

      {/* Alt: 4 metrik */}
      <View style={styles.metrikSatir}>
        <Metrik baslik="Besi Günü" deger={`${gun}`} birim="gün" renk={renk} />
        <Metrik baslik="Güncel Kilo" deger={hayvan.guncelKilo || '-'} birim="kg" renk={renk} />
        <Metrik baslik="Alınan" deger={kgFark >= 0 ? `+${kgFark.toFixed(0)}` : kgFark.toFixed(0)} birim="kg" renk={kgFark >= 0 ? COLORS.success : COLORS.danger} />
        <Metrik baslik="GCAA" deger={gcaa} birim="kg/g" renk={gcaaRenk(gcaa)} />
      </View>

      {/* Satıldı rozeti */}
      {hayvan.satildiMi && (
        <View style={styles.satildiRozet}>
          <Text style={styles.satildiYazi}>SATILDI</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function Metrik({ baslik, deger, birim, renk }) {
  return (
    <View style={styles.metrik}>
      <Text style={styles.metrikBaslik}>{baslik}</Text>
      <Text style={[styles.metrikDeger, { color: renk }]}>{deger}</Text>
      <Text style={styles.metrikBirim}>{birim}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kart: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  ust: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ikonKutu: {
    width: 50, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  isimKisim: { flex: 1, marginLeft: 12 },
  isim: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  kupe: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  saglikRozet: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  saglikYazi: { fontSize: 11, fontWeight: '700' },
  metrikSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 12,
  },
  metrik: { alignItems: 'center', flex: 1 },
  metrikBaslik: { fontSize: 10, color: COLORS.textLight, marginBottom: 3 },
  metrikDeger: { fontSize: 16, fontWeight: '900' },
  metrikBirim: { fontSize: 10, color: COLORS.textLight, marginTop: 1 },
  satildiRozet: {
    position: 'absolute', top: 0, right: 0, left: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  satildiYazi: { fontSize: 20, fontWeight: '900', color: COLORS.textSecondary, letterSpacing: 3 },
});
