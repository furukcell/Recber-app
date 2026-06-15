// Reçber - TavsiyeKutu Component
// Hesaplama bazlı sat/bekle tavsiyesi - ırk performansı dahil
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { satisTavsiyesi, irkaGorePerformansDegerlendir } from '../utils/hesaplama';
import { HESAP_TIPLERI } from '../data/constants';

export default function TavsiyeKutu({
  hayvan,
  tartimlar,
  yemAlimlar,
  saglikKayitlar,
  tumHayvanlar,
  varsayilanAyarlar,
}) {
  const [hesapTipi, setHesapTipi] = useState(
    varsayilanAyarlar?.hesapTipi || 'canli'
  );
  const [kgFiyat, setKgFiyat] = useState(
    hesapTipi === 'canli'
      ? varsayilanAyarlar?.canliKgFiyat?.toString() || ''
      : varsayilanAyarlar?.karkasKgFiyat?.toString() || ''
  );
  const [randiman, setRandiman] = useState(
    varsayilanAyarlar?.randimanOrani?.toString() || '0.55'
  );
  const [sonuc, setSonuc] = useState(null);
  const [hesaplaniyor, setHesaplaniyor] = useState(false);

  const hesapTipiDegistir = (tip) => {
    setHesapTipi(tip);
    setSonuc(null);
    if (tip === 'canli') {
      setKgFiyat(varsayilanAyarlar?.canliKgFiyat?.toString() || '');
    } else {
      setKgFiyat(varsayilanAyarlar?.karkasKgFiyat?.toString() || '');
    }
  };

  const hesapla = () => {
    if (!kgFiyat || isNaN(parseFloat(kgFiyat))) return;
    setHesaplaniyor(true);
    setTimeout(() => {
      const tavsiye = satisTavsiyesi(
        hayvan,
        tartimlar || [],
        yemAlimlar || [],
        saglikKayitlar || [],
        tumHayvanlar || [hayvan],
        kgFiyat,
        hesapTipi,
        parseFloat(randiman || 0.55)
      );
      setSonuc(tavsiye);
      setHesaplaniyor(false);
    }, 500);
  };

  const kararRenk = () => {
    if (!sonuc) return COLORS.primary;
    switch (sonuc.seviye) {
      case 'olumlu': return COLORS.success;
      case 'uyari': return COLORS.warning;
      case 'risk': return COLORS.danger;
      default: return COLORS.info;
    }
  };

  const kararIkon = () => {
    if (!sonuc) return 'calculator-variant';
    switch (sonuc.karar) {
      case 'SAT': return 'cash-fast';
      case 'BEKLE': return 'clock-outline';
      case 'TAKIP_ET': return 'eye-outline';
      default: return 'help-circle-outline';
    }
  };

  // Performans özeti
  const performans = irkaGorePerformansDegerlendir(hayvan, tartimlar || []);
  const performansRenk = () => {
    switch (performans.durum) {
      case 'cok_iyi': return COLORS.success;
      case 'normal': return COLORS.info;
      case 'dusuk': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.kap}>
      <View style={styles.baslikSatir}>
        <MaterialCommunityIcons name="calculator-variant" size={20} color={COLORS.accent} />
        <Text style={styles.baslik}>Sat / Bekle Hesabı</Text>
      </View>

      {/* Hesap Tipi Seçimi */}
      <Text style={styles.label}>Hesap Tipi</Text>
      <View style={styles.tipSatir}>
        {HESAP_TIPLERI.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tipButon, hesapTipi === t.id && { backgroundColor: COLORS.accent, borderColor: COLORS.accent }]}
            onPress={() => hesapTipiDegistir(t.id)}
          >
            <Text style={[styles.tipYazi, hesapTipi === t.id && { color: COLORS.textOnAccent }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Kg Fiyatı */}
      <Text style={styles.label}>
        {hesapTipi === 'canli' ? 'Canlı kg Fiyatı (TL)' : 'Karkas kg Fiyatı (TL)'}
      </Text>
      <View style={styles.inputSatir}>
        <TextInput
          style={styles.input}
          placeholder={hesapTipi === 'canli' ? 'Örn: 300' : 'Örn: 600'}
          placeholderTextColor={COLORS.textLight}
          keyboardType="numeric"
          value={kgFiyat}
          onChangeText={v => { setKgFiyat(v); setSonuc(null); }}
        />
        <TouchableOpacity
          style={[styles.hesaplaButon, { backgroundColor: COLORS.accent }]}
          onPress={hesapla}
          disabled={!kgFiyat || hesaplaniyor}
        >
          {hesaplaniyor
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.hesaplaYazi}>HESAPLA</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Randıman (karkas seçiliyse) */}
      {hesapTipi === 'karkas' && (
        <View style={styles.randimanSatir}>
          <Text style={styles.randimanLabel}>Randıman Oranı</Text>
          <TextInput
            style={styles.randimanInput}
            placeholder="0.55"
            keyboardType="decimal-pad"
            value={randiman}
            onChangeText={v => { setRandiman(v); setSonuc(null); }}
          />
          <Text style={styles.randimanAlt}>
            Karkas: {(parseFloat(hayvan?.guncelKilo || 0) * parseFloat(randiman || 0.55)).toFixed(0)} kg
          </Text>
        </View>
      )}

      {/* Irk Performans Özeti */}
      {performans.durum !== 'bilinmiyor' && (
        <View style={[styles.performansOzet, { backgroundColor: performansRenk() + '10', borderColor: performansRenk() + '40' }]}>
          <MaterialCommunityIcons name="chart-line" size={14} color={performansRenk()} />
          <Text style={[styles.performansOzetYazi, { color: performansRenk() }]}>
            Irk Performansı: {performans.baslik} — {performans.mevcutGcaa} kg/gün
            {performans.beklenenMin ? ` (Beklenen: ${performans.beklenenMin}-${performans.beklenenMax})` : ''}
          </Text>
        </View>
      )}

      {/* Sonuç */}
      {sonuc && (
        <View style={styles.sonucKap}>
          {/* Karar */}
          <View style={[styles.kararKutu, { backgroundColor: kararRenk() + '15', borderColor: kararRenk() }]}>
            <MaterialCommunityIcons name={kararIkon()} size={32} color={kararRenk()} />
            <View style={styles.kararBilgi}>
              <Text style={[styles.kararYazi, { color: kararRenk() }]}>{sonuc.karar}</Text>
              <Text style={[styles.kararBaslik, { color: kararRenk() }]}>{sonuc.baslik}</Text>
            </View>
          </View>

          {/* Gerekçe */}
          <View style={styles.gerekceKutu}>
            <MaterialCommunityIcons name="information-outline" size={15} color={COLORS.textSecondary} />
            <Text style={styles.gerekceYazi}>{sonuc.gerekce}</Text>
          </View>

          {/* Detay Tablosu */}
          <View style={styles.detayTablo}>
            <DetaySatir label="GCAA" deger={`${sonuc.detaylar.gcaa} kg/gün`} />
            <DetaySatir
              label="Tahmini Kar/Zarar"
              deger={`${sonuc.detaylar.karZarar >= 0 ? '+' : ''}${Math.round(sonuc.detaylar.karZarar).toLocaleString('tr-TR')} TL`}
              renk={sonuc.detaylar.karZarar >= 0 ? COLORS.success : COLORS.danger}
            />
            <DetaySatir
              label="Irk Performansı"
              deger={performans.baslik}
              renk={performansRenk()}
              son
            />
          </View>

          {/* Yeniden Hesapla */}
          <TouchableOpacity onPress={() => setSonuc(null)} style={styles.yenidenButon}>
            <Text style={styles.yenidenYazi}>Farklı fiyatla tekrar hesapla</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── ALT COMPONENTLER ─────────────────────────────────────────────

function DetaySatir({ label, deger, renk, son }) {
  return (
    <View style={[styles.detaySatir, !son && { borderBottomWidth: 0.5, borderBottomColor: COLORS.divider }]}>
      <Text style={styles.detayLabel}>{label}</Text>
      <Text style={[styles.detayDeger, renk && { color: renk }]}>{deger}</Text>
    </View>
  );
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  kap: {
    backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  baslikSatir: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  baslik: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },

  label: {
    fontSize: 12, fontWeight: '600', color: COLORS.textSecondary,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  tipSatir: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tipButon: {
    flex: 1, paddingVertical: 9, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.background,
  },
  tipYazi: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  inputSatir: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  input: {
    flex: 1, backgroundColor: COLORS.background,
    borderRadius: 12, padding: 13,
    fontSize: 16, fontWeight: '700', color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },
  hesaplaButon: {
    paddingHorizontal: 18, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  hesaplaYazi: { fontSize: 13, fontWeight: '800', color: COLORS.textOnAccent },

  randimanSatir: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 12,
    backgroundColor: COLORS.background, borderRadius: 12, padding: 10,
  },
  randimanLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  randimanInput: {
    width: 70, backgroundColor: COLORS.surface,
    borderRadius: 8, padding: 8, borderWidth: 1,
    borderColor: COLORS.border, fontSize: 14,
    fontWeight: '700', textAlign: 'center', color: COLORS.textPrimary,
  },
  randimanAlt: { fontSize: 12, color: COLORS.textSecondary },

  performansOzet: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1,
  },
  performansOzetYazi: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },

  sonucKap: { marginTop: 12 },
  kararKutu: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 16, borderWidth: 2,
    marginBottom: 12, gap: 14,
  },
  kararBilgi: { flex: 1 },
  kararYazi: { fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  kararBaslik: { fontSize: 13, fontWeight: '700', marginTop: 2 },

  gerekceKutu: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.background, borderRadius: 12,
    padding: 12, marginBottom: 12,
  },
  gerekceYazi: { flex: 1, fontSize: 13, color: COLORS.textPrimary, lineHeight: 20 },

  detayTablo: {
    backgroundColor: COLORS.background, borderRadius: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 12,
  },
  detaySatir: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  detayLabel: { fontSize: 13, color: COLORS.textSecondary },
  detayDeger: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },

  yenidenButon: { alignItems: 'center', paddingVertical: 6 },
  yenidenYazi: { fontSize: 12, color: COLORS.textLight, textDecorationLine: 'underline' },
});
