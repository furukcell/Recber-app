// Reçber - StokBar Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { YEM_TIPLERI } from '../data/constants';

export default function StokBar({ stok, modulRenk }) {
  const renk = modulRenk || COLORS.primary;

  const yemBilgi = YEM_TIPLERI.find(y => y.id === stok.tip) || { label: stok.tip, icon: 'barley', renk };

  const barRenk = () => {
    if (stok.yuzde <= 10) return COLORS.danger;
    if (stok.yuzde <= 30) return COLORS.warning;
    return renk;
  };

  const durumYazi = () => {
    if (stok.yuzde <= 10) return 'Kritik!';
    if (stok.yuzde <= 30) return 'Az';
    if (stok.yuzde <= 60) return 'Orta';
    return 'İyi';
  };

  return (
    <View style={styles.kart}>
      {/* Üst satır */}
      <View style={styles.ust}>
        <View style={[styles.ikonKutu, { backgroundColor: yemBilgi.renk + '20' }]}>
          <MaterialCommunityIcons name={yemBilgi.icon} size={20} color={yemBilgi.renk} />
        </View>
        <View style={styles.bilgi}>
          <Text style={styles.tipYazi}>{yemBilgi.label}</Text>
          <Text style={styles.altYazi}>
            {Math.round(stok.kalan)} kg kaldı / {Math.round(stok.toplamAlinan)} kg alındı
          </Text>
        </View>
        <View style={[styles.durumRozet, { backgroundColor: barRenk() + '20' }]}>
          <Text style={[styles.durumYazi, { color: barRenk() }]}>{durumYazi()}</Text>
        </View>
      </View>

      {/* Bar */}
      <View style={styles.barKap}>
        <View style={[styles.bar, {
          width: `${Math.min(Math.max(stok.yuzde, 0), 100)}%`,
          backgroundColor: barRenk(),
        }]} />
      </View>

      {/* Alt satır */}
      <View style={styles.alt}>
        <Text style={styles.yuzdeYazi}>%{stok.yuzde}</Text>
        <Text style={styles.verilenYazi}>{Math.round(stok.toplamVerilen)} kg tüketildi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kart: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ust: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  ikonKutu: {
    width: 38, height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bilgi: { flex: 1 },
  tipYazi: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  altYazi: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  durumRozet: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  durumYazi: { fontSize: 11, fontWeight: '700' },

  barKap: {
    height: 10, backgroundColor: COLORS.borderLight,
    borderRadius: 5, overflow: 'hidden', marginBottom: 6,
  },
  bar: { height: 10, borderRadius: 5 },

  alt: { flexDirection: 'row', justifyContent: 'space-between' },
  yuzdeYazi: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },
  verilenYazi: { fontSize: 12, color: COLORS.textLight },
});
