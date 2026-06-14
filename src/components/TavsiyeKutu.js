// Reçber - TavsiyeKutu Component
// Hesaplama bazlı sat/bekle tavsiyesi - AI yok, saf formül
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../theme/colors';

export default function TavsiyeKutu({ hayvan, toplamYemMaliyet }) {
  const [kgFiyat, setKgFiyat] = useState('');
  const [sonuc, setSonuc] = useState(null);
  const [hesaplaniyor, setHesaplaniyor] = useState(false);

  const hesapla = () => {
    if (!kgFiyat || isNaN(parseFloat(kgFiyat))) return;

    setHesaplaniyor(true);
    setTimeout(() => {
      const karar = tavsiyeHesapla();
      setSonuc(karar);
      setHesaplaniyor(false);
    }, 600);
  };

  const tavsiyeHesapla = () => {
    const gun = Math.floor((Date.now() - new Date(hayvan.olusturmaTarihi)) / 86400000) || 1;
    const alisKilo = parseFloat(hayvan.alisKilo || 0);
    const guncelKilo = parseFloat(hayvan.guncelKilo || 0);
    const alisFiyat = parseFloat(hayvan.alisFiyat || 0);
    const kgFiyatSayı = parseFloat(kgFiyat);
    const yemMaliyet = parseFloat(toplamYemMaliyet || 0);

    const kgFark = guncelKilo - alisKilo;
    const gcaa = gun > 0 ? kgFark / gun : 0;
    const beklenenSatisFiyat = guncelKilo * kgFiyatSayı;
    const toplamMaliyet = alisFiyat + yemMaliyet;
    const karTL = beklenenSatisFiyat - toplamMaliyet;
    const karYuzde = toplamMaliyet > 0 ? (karTL / toplamMaliyet) * 100 : 0;

    // 30 günde beklenen ek kilo ve ek gelir
    const beklenenEkKilo = gcaa * 30;
    const beklenenEkGelir = beklenenEkKilo * kgFiyatSayı;
    // 30 günde tahmini ek yem maliyeti (günlük ortalama * 30)
    const gunlukYemMaliyet = gun > 0 ? yemMaliyet / gun : 0;
    const ekYemMaliyet = gunlukYemMaliyet * 30;
    const netEkKar = beklenenEkGelir - ekYemMaliyet;

    // ─── KARAR MANTIĞI ────────────────────────────────────────
    let karar = 'BEKLE';
    let renkKarar = COLORS.success;
    let ikonKarar = 'clock-outline';
    const gerekce = [];
    const detaylar = [];

    // 1. GCAA çok düşükse sat
    if (gcaa < 1.0) {
      karar = 'SAT';
      renkKarar = COLORS.danger;
      ikonKarar = 'cash-fast';
      gerekce.push('Günlük kilo artışı 1 kg altında, verim çok düşük.');
      gerekce.push('Yem maliyeti geliri geçiyor, beklemenin anlamı yok.');
    }
    // 2. Kar marjı %20 üstündeyse ve 90 günü geçtiyse sat
    else if (karYuzde >= 20 && gun >= 90) {
      karar = 'SAT';
      renkKarar = COLORS.success;
      ikonKarar = 'trending-up';
      gerekce.push(`%${karYuzde.toFixed(0)} kar marjına ulaşıldı.`);
      gerekce.push(`${gun} günlük besinin iyi bir getiri noktasındasın.`);
    }
    // 3. 120 günü geçtiyse ve GCAA düşmeye başladıysa sat
    else if (gun >= 120 && gcaa < 1.3) {
      karar = 'SAT';
      renkKarar = COLORS.warning;
      ikonKarar = 'alert-circle-outline';
      gerekce.push(`${gun} günlük besi, verim yavaşlıyor.`);
      gerekce.push('Uzun besi dönemlerinde kar marjı düşer.');
    }
    // 4. Zarar ediyorsa sat
    else if (karTL < 0) {
      karar = 'SAT';
      renkKarar = COLORS.danger;
      ikonKarar = 'trending-down';
      gerekce.push('Mevcut fiyatta zarar ediyorsun.');
      gerekce.push('Daha fazla yem maliyeti zararı büyütür.');
    }
    // 5. 30 gün daha beklemenin net karı pozitifse bekle
    else if (netEkKar > 0 && gun < 120) {
      karar = 'BEKLE';
      renkKarar = COLORS.success;
      ikonKarar = 'clock-outline';
      gerekce.push(`30 gün daha beklersen tahminen ${beklenenEkKilo.toFixed(0)} kg daha alır.`);
      gerekce.push(`Net ek kazanç: ~${Math.round(netEkKar).toLocaleString('tr-TR')} TL.`);
    }
    // 6. Henüz erken
    else {
      karar = 'BEKLE';
      renkKarar = COLORS.info;
      ikonKarar = 'clock-outline';
      gerekce.push('Besi süreci henüz erken aşamada.');
      gerekce.push('Kilo artışını izlemeye devam et.');
    }

    // Detay satırları
    detaylar.push({ label: 'Besi Süresi', deger: `${gun} gün` });
    detaylar.push({ label: 'GCAA', deger: `${gcaa.toFixed(2)} kg/gün` });
    detaylar.push({ label: 'Beklenen Satış', deger: `${Math.round(beklenenSatisFiyat).toLocaleString('tr-TR')} TL` });
    detaylar.push({ label: 'Toplam Maliyet', deger: `${Math.round(toplamMaliyet).toLocaleString('tr-TR')} TL` });
    detaylar.push({
      label: 'Tahmini Kar/Zarar',
      deger: `${karTL >= 0 ? '+' : ''}${Math.round(karTL).toLocaleString('tr-TR')} TL`,
      renk: karTL >= 0 ? COLORS.success : COLORS.danger,
    });
    detaylar.push({ label: 'Kar Marjı', deger: `%${karYuzde.toFixed(1)}`, renk: karYuzde >= 15 ? COLORS.success : COLORS.warning });

    return { karar, renkKarar, ikonKarar, gerekce, detaylar };
  };

  return (
    <View style={styles.kap}>
      <View style={styles.baslikSatir}>
        <MaterialCommunityIcons name="calculator-variant" size={20} color={COLORS.accent} />
        <Text style={styles.baslik}>Sat / Bekle Hesabı</Text>
      </View>

      {/* Kg Fiyat Girişi */}
      <Text style={styles.label}>Güncel Canlı Ağırlık Fiyatı (TL/kg)</Text>
      <View style={styles.inputSatir}>
        <TextInput
          style={styles.input}
          placeholder="Örn: 85"
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

      {/* Sonuç */}
      {sonuc && (
        <View style={styles.sonucKap}>
          {/* Karar Rozeti */}
          <View style={[styles.kararKutu, { backgroundColor: sonuc.renkKarar + '15', borderColor: sonuc.renkKarar }]}>
            <MaterialCommunityIcons name={sonuc.ikonKarar} size={32} color={sonuc.renkKarar} />
            <Text style={[styles.kararYazi, { color: sonuc.renkKarar }]}>{sonuc.karar}</Text>
          </View>

          {/* Gerekçeler */}
          <View style={styles.gerekceKap}>
            {sonuc.gerekce.map((g, i) => (
              <View key={i} style={styles.gerekce}>
                <MaterialCommunityIcons name="chevron-right" size={14} color={sonuc.renkKarar} />
                <Text style={styles.gerekceYazi}>{g}</Text>
              </View>
            ))}
          </View>

          {/* Detay Tablosu */}
          <View style={styles.detayTablo}>
            {sonuc.detaylar.map((d, i) => (
              <View key={i} style={[styles.detaySatir, i < sonuc.detaylar.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: COLORS.divider }]}>
                <Text style={styles.detayLabel}>{d.label}</Text>
                <Text style={[styles.detayDeger, d.renk && { color: d.renk }]}>{d.deger}</Text>
              </View>
            ))}
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

const styles = StyleSheet.create({
  kap: {
    backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  baslikSatir: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  baslik: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },

  label: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputSatir: { flexDirection: 'row', gap: 10, marginBottom: 4 },
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

  sonucKap: { marginTop: 16 },
  kararKutu: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 12,
    borderRadius: 14, padding: 16,
    borderWidth: 2, marginBottom: 14,
  },
  kararYazi: { fontSize: 30, fontWeight: '900', letterSpacing: 2 },

  gerekceKap: { marginBottom: 14, gap: 6 },
  gerekce: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  gerekceYazi: { fontSize: 13, color: COLORS.textPrimary, flex: 1, lineHeight: 19 },

  detayTablo: {
    backgroundColor: COLORS.background,
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
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
