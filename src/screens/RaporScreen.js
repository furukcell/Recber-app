// Reçber - Rapor Ekranı
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Share, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import HeaderBar from '../components/HeaderBar';
import TavsiyeKutu from '../components/TavsiyeKutu';
import COLORS from '../theme/colors';
import {
  getHayvanlar, getHaftalikKayitlar, getYemAlimlar,
  getSatislar, getSaglikKayitlar, getAktifModul, getAyarlar,
} from '../data/storage';
import {
  toplamMaliyet, tahminiSatisGeliri, tahminiKarZarar,
  besiGunuHesapla, gunlukCanliAgirlikArtisi,
} from '../utils/hesaplama';

export default function RaporScreen() {
  const [aktifModul, setModul] = useState('besi');
  const [hayvanlar, setHayvanlar] = useState([]);
  const [kayitlar, setKayitlar] = useState([]);
  const [yemAlimlar, setYemAlimlar] = useState([]);
  const [satislar, setSatislar] = useState([]);
  const [saglikKayitlar, setSaglikKayitlar] = useState([]);
  const [ayarlar, setAyarlar] = useState(null);
  const [seciliHayvan, setSeciliHayvan] = useState(null);
  const [aktifTab, setAktifTab] = useState('tavsiye');
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul || 'besi');
    const a = await getAyarlar();
    setAyarlar(a);
    const h = await getHayvanlar();
    setHayvanlar(h);
    const k = await getHaftalikKayitlar();
    setKayitlar(k);
    const y = await getYemAlimlar();
    setYemAlimlar(y);
    const s = await getSatislar();
    setSatislar(s);
    const sk = await getSaglikKayitlar();
    setSaglikKayitlar(sk);
    const aktifler = h.filter(x => !x.satildiMi);
    if (aktifler.length > 0 && !seciliHayvan) {
      setSeciliHayvan(aktifler[0]);
    }
  };

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  const onYenile = async () => {
    setYenileniyor(true);
    await veriYukle();
    setYenileniyor(false);
  };

  const modulRenk = aktifModul === 'besi' ? COLORS.besi : COLORS.suru;
  const aktifHayvanlar = hayvanlar.filter(h => !h.satildiMi);
  const satilanlar = hayvanlar.filter(h => h.satildiMi);

  // Seçili hayvanın tartım kayıtları
  const seciliKayitlar = kayitlar.filter(k => k.hayvanId === seciliHayvan?.id);

  // Aylık özet
  const aylikOzet = () => {
    const simdi = new Date();
    const buAy = kayitlar.filter(k => {
      const t = new Date(k.olusturmaTarihi);
      return (
        t.getMonth() === simdi.getMonth() &&
        t.getFullYear() === simdi.getFullYear()
      );
    });
    const toplamYem = buAy.reduce((acc, k) => {
      return acc +
        parseFloat(k.besiYemi || 0) + parseFloat(k.saman || 0) +
        parseFloat(k.silaj || 0) + parseFloat(k.arpa || 0) +
        parseFloat(k.misir || 0) + parseFloat(k.yonca || 0);
    }, 0);
    return { tartimSayisi: buAy.length, toplamYem: toplamYem.toFixed(0) };
  };

  // Genel finansal özet
  const genelFinans = () => {
    const toplamSatis = satilanlar.reduce((acc, h) => acc + parseFloat(h.satisFiyati || 0), 0);
    const toplamAlis = satilanlar.reduce((acc, h) => acc + parseFloat(h.alisFiyat || 0), 0);
    const toplamYem = yemAlimlar.reduce((acc, a) => acc + parseFloat(a.fiyat || 0), 0);
    const kar = toplamSatis - toplamAlis - toplamYem;
    return { toplamSatis, toplamAlis, toplamYem, kar };
  };

  // WhatsApp raporu
  const whatsappGonder = async () => {
    try {
      const simdi = new Date();
      const tarih = `${simdi.getDate().toString().padStart(2, '0')}.${(simdi.getMonth() + 1).toString().padStart(2, '0')}.${simdi.getFullYear()}`;
      const finans = genelFinans();
      const ozet = aylikOzet();

      let metin = `🐄 REÇBER RAPORU — ${tarih}\n`;
      metin += `${'─'.repeat(30)}\n\n`;

      // Aktif hayvanlar
      metin += `📊 AKTİF HAYVANLAR (${aktifHayvanlar.length} baş)\n`;
      aktifHayvanlar.forEach(h => {
        const gun = besiGunuHesapla(h);
        const hKayitlar = kayitlar.filter(k => k.hayvanId === h.id);
        const gcaa = gunlukCanliAgirlikArtisi(h, hKayitlar);
        const kgFark = parseFloat(h.guncelKilo || 0) - parseFloat(h.alisKilo || 0);
        metin += `\n• ${h.isim}\n`;
        metin += `  Besi: ${gun} gün | Kilo: ${h.alisKilo}→${h.guncelKilo} kg (+${kgFark.toFixed(0)} kg)\n`;
        metin += `  GCAA: ${gcaa} kg/gün | Durum: ${h.saglik === 'saglikli' ? 'Sağlıklı ✅' : 'Takipte ⚠️'}\n`;
      });

      metin += `\n${'─'.repeat(30)}\n`;
      metin += `🌾 BU AY YEM: ${ozet.toplamYem} kg (${ozet.tartimSayisi} tartım)\n`;
      metin += `\n${'─'.repeat(30)}\n`;

      // Yem stokları
      metin += `\n💰 FİNANSAL ÖZET\n`;
      metin += `  Toplam Satış: ${Math.round(finans.toplamSatis).toLocaleString('tr-TR')} TL\n`;
      metin += `  Toplam Yem: ${Math.round(finans.toplamYem).toLocaleString('tr-TR')} TL\n`;
      metin += `  Net: ${finans.kar >= 0 ? '+' : ''}${Math.round(finans.kar).toLocaleString('tr-TR')} TL\n`;

      metin += `\n${'─'.repeat(30)}\n`;
      metin += `Reçber uygulaması ile oluşturuldu.`;

      await Share.share({ message: metin, title: `Reçber Raporu ${tarih}` });
    } catch (e) {
      Alert.alert('Hata', 'Rapor paylaşılırken bir sorun oluştu.');
    }
  };

  const ozet = aylikOzet();
  const finans = genelFinans();

  const tabs = [
    { key: 'tavsiye', label: 'Sat/Bekle', ikon: 'calculator-variant' },
    { key: 'aylik', label: 'Bu Ay', ikon: 'calendar-month' },
    { key: 'ozet', label: 'Genel', ikon: 'chart-bar' },
  ];

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Raporlar"
        altBaslik="Analiz & Tavsiye"
        modulRenk={modulRenk}
        sagIcon="whatsapp"
        sagOnPress={whatsappGonder}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, aktifTab === t.key && { borderBottomColor: modulRenk, borderBottomWidth: 2 }]}
            onPress={() => setAktifTab(t.key)}
          >
            <MaterialCommunityIcons
              name={t.ikon} size={15}
              color={aktifTab === t.key ? modulRenk : COLORS.textLight}
            />
            <Text style={[styles.tabYazi, aktifTab === t.key && { color: modulRenk }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollIcerik}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={onYenile} tintColor={modulRenk} />}
      >

        {/* ─── SAT/BEKLE TAB ─── */}
        {aktifTab === 'tavsiye' && (
          <View>
            {aktifHayvanlar.length === 0 ? (
              <BosDurum ikon="cow-off" mesaj="Aktif hayvan bulunamadı" />
            ) : (
              <View>
                {/* Hayvan Seçici */}
                <Text style={styles.bolumBaslik}>Hayvan Seç</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {aktifHayvanlar.map(h => (
                    <TouchableOpacity
                      key={h.id}
                      style={[
                        styles.hayvanCip,
                        seciliHayvan?.id === h.id && { backgroundColor: modulRenk, borderColor: modulRenk }
                      ]}
                      onPress={() => setSeciliHayvan(h)}
                    >
                      <MaterialCommunityIcons
                        name="cow" size={16}
                        color={seciliHayvan?.id === h.id ? '#fff' : modulRenk}
                      />
                      <Text style={[styles.hayvanCipYazi, seciliHayvan?.id === h.id && { color: '#fff' }]}>
                        {h.isim}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Seçili Hayvan Özet */}
                {seciliHayvan && (
                  <View style={styles.seciliOzet}>
                    <OzetSatir label="Alış Kilosu" deger={`${seciliHayvan.alisKilo} kg`} />
                    <OzetSatir label="Güncel Kilo" deger={`${seciliHayvan.guncelKilo} kg`} />
                    <OzetSatir label="Besi Günü" deger={`${besiGunuHesapla(seciliHayvan)} gün`} />
                    <OzetSatir
                      label="Alış Fiyatı"
                      deger={seciliHayvan.alisFiyat
                        ? `${parseFloat(seciliHayvan.alisFiyat).toLocaleString('tr-TR')} TL`
                        : '-'}
                      son
                    />
                  </View>
                )}

                {/* Tavsiye Kutu */}
                {seciliHayvan && ayarlar && (
                  <TavsiyeKutu
                    hayvan={seciliHayvan}
                    tartimlar={seciliKayitlar}
                    yemAlimlar={yemAlimlar}
                    saglikKayitlar={saglikKayitlar}
                    tumHayvanlar={hayvanlar}
                    varsayilanAyarlar={ayarlar}
                  />
                )}
              </View>
            )}
          </View>
        )}

        {/* ─── AYLIK TAB ─── */}
        {aktifTab === 'aylik' && (
          <View>
            <Text style={styles.bolumBaslik}>
              {new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' })} Özeti
            </Text>

            <View style={styles.aylikGrid}>
              <AylikKart ikon="scale" baslik="Tartım Kaydı" deger={ozet.tartimSayisi} birim="adet" renk={modulRenk} />
              <AylikKart ikon="barley" baslik="Toplam Yem" deger={ozet.toplamYem} birim="kg" renk={COLORS.accent} />
              <AylikKart ikon="cow" baslik="Aktif Hayvan" deger={aktifHayvanlar.length} birim="baş" renk={modulRenk} />
              <AylikKart ikon="check-circle" baslik="Satılan" deger={satilanlar.length} birim="baş" renk={COLORS.textSecondary} />
            </View>

            {/* Aktif Hayvan Durumları */}
            <Text style={[styles.bolumBaslik, { marginTop: 8 }]}>Hayvan Durumları</Text>
            {aktifHayvanlar.length === 0 ? (
              <BosDurum ikon="cow-off" mesaj="Aktif hayvan yok" />
            ) : (
              aktifHayvanlar.map(h => {
                const gun = besiGunuHesapla(h);
                const hKayitlar = kayitlar.filter(k => k.hayvanId === h.id);
                const gcaa = gunlukCanliAgirlikArtisi(h, hKayitlar);
                const kgFark = parseFloat(h.guncelKilo || 0) - parseFloat(h.alisKilo || 0);
                return (
                  <View key={h.id} style={styles.hayvanDurumKart}>
                    <View style={[styles.hayvanDurumIkon, { backgroundColor: modulRenk }]}>
                      <MaterialCommunityIcons name="cow" size={18} color="#fff" />
                    </View>
                    <View style={styles.hayvanDurumBilgi}>
                      <Text style={styles.hayvanDurumIsim}>{h.isim}</Text>
                      <Text style={styles.hayvanDurumAlt}>
                        {gun} gün • {h.guncelKilo} kg • GCAA: {gcaa} kg/gün
                      </Text>
                    </View>
                    <Text style={[styles.hayvanDurumFark, { color: kgFark >= 0 ? COLORS.success : COLORS.danger }]}>
                      {kgFark >= 0 ? '+' : ''}{kgFark.toFixed(0)} kg
                    </Text>
                  </View>
                );
              })
            )}

            {/* Son Tartımlar */}
            <Text style={[styles.bolumBaslik, { marginTop: 16 }]}>Son Tartımlar</Text>
            {kayitlar.length === 0 ? (
              <BosDurum ikon="scale-off" mesaj="Bu ay tartım kaydı yok" />
            ) : (
              kayitlar.slice(0, 8).map((k, i) => {
                const h = hayvanlar.find(x => x.id === k.hayvanId);
                return (
                  <View key={k.id} style={styles.tartimSatir}>
                    <View style={[styles.tartimNo, { backgroundColor: modulRenk }]}>
                      <Text style={styles.tartimNoYazi}>{i + 1}</Text>
                    </View>
                    <View style={styles.tartimBilgi}>
                      <Text style={styles.tartimHayvan}>{h?.isim || 'Bilinmiyor'}</Text>
                      <Text style={styles.tartimAlt}>{k.tarih} • Yem: {k.toplam?.toFixed(0) || 0} kg</Text>
                    </View>
                    <Text style={[styles.tartimKilo, { color: modulRenk }]}>{k.kilo} kg</Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ─── GENEL TAB ─── */}
        {aktifTab === 'ozet' && (
          <View>
            {/* Finansal Özet */}
            <View style={styles.finansalKart}>
              <Text style={styles.finansalBaslik}>💰 Finansal Özet</Text>

              <FinansSatir label="Toplam Satış Geliri" deger={`${Math.round(finans.toplamSatis).toLocaleString('tr-TR')} TL`} renk={COLORS.success} />
              <FinansSatir label="Toplam Alış Maliyeti" deger={`${Math.round(finans.toplamAlis).toLocaleString('tr-TR')} TL`} renk={COLORS.danger} />
              <FinansSatir label="Toplam Yem Maliyeti" deger={`${Math.round(finans.toplamYem).toLocaleString('tr-TR')} TL`} renk={COLORS.warning} />

              <View style={[styles.karKutu, {
                backgroundColor: finans.kar >= 0 ? COLORS.success + '15' : COLORS.danger + '15'
              }]}>
                <Text style={styles.karBaslik}>NET KAR / ZARAR</Text>
                <Text style={[styles.karDeger, { color: finans.kar >= 0 ? COLORS.success : COLORS.danger }]}>
                  {finans.kar >= 0 ? '+' : ''}{Math.round(finans.kar).toLocaleString('tr-TR')} TL
                </Text>
                <Text style={styles.karAlt}>{satilanlar.length} hayvan üzerinden</Text>
              </View>
            </View>

            {/* WhatsApp Rapor Butonu */}
            <TouchableOpacity
              style={[styles.whatsappButon, { backgroundColor: '#25D366' }]}
              onPress={whatsappGonder}
            >
              <MaterialCommunityIcons name="whatsapp" size={22} color="#fff" />
              <Text style={styles.whatsappYazi}>WhatsApp'a Rapor Gönder</Text>
            </TouchableOpacity>

            {/* Satış Geçmişi */}
            <Text style={[styles.bolumBaslik, { marginTop: 8 }]}>Satış Geçmişi</Text>
            {satilanlar.length === 0 ? (
              <BosDurum ikon="cash-remove" mesaj="Henüz satış yapılmamış" />
            ) : (
              satilanlar.map(h => {
                const alisFiyat = parseFloat(h.alisFiyat || 0);
                const satisFiyat = parseFloat(h.satisFiyati || 0);
                const fark = satisFiyat - alisFiyat;
                return (
                  <View key={h.id} style={styles.satisKart}>
                    <View style={[styles.satisIkon, { backgroundColor: COLORS.accent + '20' }]}>
                      <MaterialCommunityIcons name="cow" size={20} color={COLORS.accent} />
                    </View>
                    <View style={styles.satisBilgi}>
                      <Text style={styles.satisIsim}>{h.isim}</Text>
                      <Text style={styles.satisAlt}>{h.satisTarihi || '-'}</Text>
                    </View>
                    <View style={styles.satisFiyatlar}>
                      <Text style={[styles.satisFiyat, { color: COLORS.success }]}>
                        {satisFiyat.toLocaleString('tr-TR')} TL
                      </Text>
                      <Text style={[styles.satisKar, { color: fark >= 0 ? COLORS.success : COLORS.danger }]}>
                        {fark >= 0 ? '+' : ''}{fark.toLocaleString('tr-TR')} TL
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── ALT COMPONENTLER ─────────────────────────────────────────────

function OzetSatir({ label, deger, son }) {
  return (
    <View style={[styles.ozetSatir, !son && { borderBottomWidth: 0.5, borderBottomColor: COLORS.divider }]}>
      <Text style={styles.ozetLabel}>{label}</Text>
      <Text style={styles.ozetDeger}>{deger}</Text>
    </View>
  );
}

function AylikKart({ ikon, baslik, deger, birim, renk }) {
  return (
    <View style={styles.aylikKart}>
      <MaterialCommunityIcons name={ikon} size={22} color={renk} />
      <Text style={[styles.aylikDeger, { color: renk }]}>{deger}</Text>
      <Text style={styles.aylikBaslik}>{baslik}</Text>
      <Text style={styles.aylikBirim}>{birim}</Text>
    </View>
  );
}

function FinansSatir({ label, deger, renk }) {
  return (
    <View style={styles.finansSatir}>
      <Text style={styles.finansLabel}>{label}</Text>
      <Text style={[styles.finansDeger, { color: renk }]}>{deger}</Text>
    </View>
  );
}

function BosDurum({ ikon, mesaj }) {
  return (
    <View style={styles.bosDurum}>
      <MaterialCommunityIcons name={ikon} size={40} color={COLORS.textLight} />
      <Text style={styles.bosYazi}>{mesaj}</Text>
    </View>
  );
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollIcerik: { padding: 12, paddingBottom: 40 },

  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 11, gap: 4,
  },
  tabYazi: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },

  bolumBaslik: {
    fontSize: 13, fontWeight: '800', color: COLORS.textSecondary,
    marginBottom: 10, letterSpacing: 0.3,
  },

  hayvanCip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.border, marginRight: 8,
    backgroundColor: COLORS.background,
  },
  hayvanCipYazi: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  seciliOzet: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    marginBottom: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  ozetSatir: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  ozetLabel: { fontSize: 13, color: COLORS.textSecondary },
  ozetDeger: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },

  aylikGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  aylikKart: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, alignItems: 'center', width: '47%', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  aylikDeger: { fontSize: 24, fontWeight: '900' },
  aylikBaslik: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  aylikBirim: { fontSize: 11, color: COLORS.textLight },

  hayvanDurumKart: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  hayvanDurumIkon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  hayvanDurumBilgi: { flex: 1 },
  hayvanDurumIsim: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  hayvanDurumAlt: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  hayvanDurumFark: { fontSize: 16, fontWeight: '900' },

  tartimSatir: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, marginBottom: 6, gap: 10,
  },
  tartimNo: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tartimNoYazi: { fontSize: 12, fontWeight: '900', color: '#fff' },
  tartimBilgi: { flex: 1 },
  tartimHayvan: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  tartimAlt: { fontSize: 11, color: COLORS.textSecondary },
  tartimKilo: { fontSize: 16, fontWeight: '900' },

  finansalKart: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  finansalBaslik: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  finansSatir: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.divider,
  },
  finansLabel: { fontSize: 13, color: COLORS.textSecondary },
  finansDeger: { fontSize: 14, fontWeight: '800' },

  karKutu: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 14, gap: 4 },
  karBaslik: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1 },
  karDeger: { fontSize: 28, fontWeight: '900' },
  karAlt: { fontSize: 11, color: COLORS.textLight },

  whatsappButon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, padding: 14, gap: 10, marginBottom: 16,
    shadowColor: '#25D366', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  whatsappYazi: { fontSize: 15, fontWeight: '800', color: '#fff' },

  satisKart: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  satisIkon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  satisBilgi: { flex: 1 },
  satisIsim: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  satisAlt: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  satisFiyatlar: { alignItems: 'flex-end' },
  satisFiyat: { fontSize: 14, fontWeight: '800' },
  satisKar: { fontSize: 12, fontWeight: '700', marginTop: 2 },

  bosDurum: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  bosYazi: { fontSize: 14, color: COLORS.textLight },
});
