import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';
import {
  getSuruHayvanlar,
  getSutKayitlari,
} from '../data/storage';

const SURU_RENK = COLORS.suru || '#1A5276';

function bugunTarih() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()}`;
}

function tarihToDate(tarih) {
  if (!tarih || typeof tarih !== 'string') return null;
  const parcalar = tarih.split('.');
  if (parcalar.length !== 3) return null;

  const gun = parseInt(parcalar[0], 10);
  const ay = parseInt(parcalar[1], 10) - 1;
  const yil = parseInt(parcalar[2], 10);

  if (!gun || ay < 0 || !yil) return null;
  return new Date(yil, ay, gun);
}

function ayniGunMu(tarih1, tarih2) {
  return (
    tarih1.getFullYear() === tarih2.getFullYear() &&
    tarih1.getMonth() === tarih2.getMonth() &&
    tarih1.getDate() === tarih2.getDate()
  );
}

function sonGunIcindeMi(tarihStr, gunSayisi) {
  const tarih = tarihToDate(tarihStr);
  if (!tarih) return false;

  const bugun = new Date();
  const baslangic = new Date();
  baslangic.setDate(bugun.getDate() - (gunSayisi - 1));
  baslangic.setHours(0, 0, 0, 0);

  return tarih >= baslangic && tarih <= bugun;
}

function buAyMi(tarihStr) {
  const tarih = tarihToDate(tarihStr);
  if (!tarih) return false;

  const bugun = new Date();
  return (
    tarih.getFullYear() === bugun.getFullYear() &&
    tarih.getMonth() === bugun.getMonth()
  );
}

function sayi(value) {
  const n = parseFloat(value || 0);
  return Number.isFinite(n) ? n : 0;
}

export default function SuruRaporScreen() {
  const [hayvanlar, setHayvanlar] = useState([]);
  const [sutKayitlar, setSutKayitlar] = useState([]);
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = async () => {
    const h = await getSuruHayvanlar();
    const s = await getSutKayitlari();

    setHayvanlar(Array.isArray(h) ? h : []);
    setSutKayitlar(Array.isArray(s) ? s : []);
  };

  useFocusEffect(
    useCallback(() => {
      veriYukle();
    }, [])
  );

  const onYenile = async () => {
    setYenileniyor(true);
    await veriYukle();
    setYenileniyor(false);
  };

  const bugun = new Date();
  const bugunStr = bugunTarih();

  const bugunKayitlar = sutKayitlar.filter((k) => k.tarih === bugunStr);
  const son7Kayitlar = sutKayitlar.filter((k) => sonGunIcindeMi(k.tarih, 7));
  const buAyKayitlar = sutKayitlar.filter((k) => buAyMi(k.tarih));

  const bugunToplam = bugunKayitlar.reduce((acc, k) => acc + sayi(k.toplamSut), 0);
  const son7Toplam = son7Kayitlar.reduce((acc, k) => acc + sayi(k.toplamSut), 0);
  const buAyToplam = buAyKayitlar.reduce((acc, k) => acc + sayi(k.toplamSut), 0);

  const laktasyonda = hayvanlar.filter((h) => h.guncelDurum === 'laktasyon').length;
  const kuru = hayvanlar.filter((h) => h.guncelDurum === 'kuru').length;
  const dogumYakin = hayvanlar.filter((h) => h.guncelDurum === 'dogumYakin').length;

  const bugunInekSayisi = new Set(bugunKayitlar.map((k) => k.hayvanId)).size;
  const bugunInekOrt =
    bugunInekSayisi > 0 ? (bugunToplam / bugunInekSayisi).toFixed(1) : '0.0';

  const son7GunOrt = son7Toplam > 0 ? (son7Toplam / 7).toFixed(1) : '0.0';

  const hayvanOzetleri = hayvanlar.map((h) => {
    const kayitlar = sutKayitlar.filter((k) => k.hayvanId === h.id);
    const toplam = kayitlar.reduce((acc, k) => acc + sayi(k.toplamSut), 0);
    const son7 = kayitlar.filter((k) => sonGunIcindeMi(k.tarih, 7));
    const son7ToplamHayvan = son7.reduce((acc, k) => acc + sayi(k.toplamSut), 0);
    const ortalama = kayitlar.length > 0 ? toplam / kayitlar.length : 0;
    const son7Ortalama = son7.length > 0 ? son7ToplamHayvan / son7.length : 0;
    const enYuksek = kayitlar.length > 0
      ? Math.max(...kayitlar.map((k) => sayi(k.toplamSut)))
      : 0;

    const sonKayit = kayitlar.length > 0 ? kayitlar[0] : null;

    return {
      hayvan: h,
      kayitSayisi: kayitlar.length,
      toplam,
      ortalama,
      son7Ortalama,
      enYuksek,
      sonKayit,
    };
  });

  const siraliHayvanlar = [...hayvanOzetleri].sort(
    (a, b) => b.son7Ortalama - a.son7Ortalama
  );

  const enVerimli = siraliHayvanlar[0];

  const dusukVerimliler = hayvanOzetleri.filter(
    (o) => o.kayitSayisi > 0 && o.son7Ortalama > 0 && o.son7Ortalama < 10
  );

  const kayitsizLaktasyon = hayvanlar.filter((h) => {
    if (h.guncelDurum !== 'laktasyon') return false;
    const kaydiVarMi = sutKayitlar.some((k) => k.hayvanId === h.id);
    return !kaydiVarMi;
  });

  const gunlukGruplar = sonGunleriHazirla(sutKayitlar, 7);

  const raporPaylas = async () => {
    const metin =
`🥛 Reçber Sürü Raporu

🐄 Toplam İnek: ${hayvanlar.length}
🥛 Laktasyonda: ${laktasyonda}
🌵 Kuru Dönem: ${kuru}
🐣 Doğum Yakın: ${dogumYakin}

📅 Bugünkü Süt: ${bugunToplam.toFixed(1)} lt
📊 Bugün İnek Ort.: ${bugunInekOrt} lt
🗓️ Son 7 Gün Toplam: ${son7Toplam.toFixed(1)} lt
📈 Günlük Ortalama: ${son7GunOrt} lt
📆 Bu Ay Toplam: ${buAyToplam.toFixed(1)} lt

⭐ En Verimli:
${enVerimli?.hayvan?.isim ? `${enVerimli.hayvan.isim} — ${enVerimli.son7Ortalama.toFixed(1)} lt/gün` : 'Henüz veri yok'}

Reçber — Sürü & Süt Takibi`;

    await Share.share({ message: metin });
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Süt Rapor"
        altBaslik={`${hayvanlar.length} inek • ${bugunToplam.toFixed(0)} lt bugün`}
        modulRenk={SURU_RENK}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={yenileniyor}
            onRefresh={onYenile}
            tintColor={SURU_RENK}
          />
        }
      >
        <View style={styles.metrikGrid}>
          <MetrikKart
            ikon="cup-water"
            baslik="Bugün"
            deger={bugunToplam.toFixed(1)}
            birim="lt"
            renk={SURU_RENK}
          />
          <MetrikKart
            ikon="calendar-week"
            baslik="Son 7 Gün"
            deger={son7Toplam.toFixed(0)}
            birim="lt"
            renk={SURU_RENK}
          />
          <MetrikKart
            ikon="calendar-month"
            baslik="Bu Ay"
            deger={buAyToplam.toFixed(0)}
            birim="lt"
            renk={COLORS.accent || SURU_RENK}
          />
          <MetrikKart
            ikon="chart-line"
            baslik="Günlük Ort."
            deger={son7GunOrt}
            birim="lt"
            renk={COLORS.info || SURU_RENK}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sürü Durumu</Text>

          <View style={styles.durumGrid}>
            <DurumMini label="Toplam" value={hayvanlar.length} renk={SURU_RENK} />
            <DurumMini label="Laktasyon" value={laktasyonda} renk={COLORS.success || SURU_RENK} />
            <DurumMini label="Kuru" value={kuru} renk={COLORS.warning || SURU_RENK} />
            <DurumMini label="Doğum Yakın" value={dogumYakin} renk={COLORS.accent || SURU_RENK} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.baslikSatir}>
            <Text style={styles.cardTitle}>Son 7 Gün Süt Grafiği</Text>
            <Text style={styles.cardSubTitle}>lt/gün</Text>
          </View>

          {gunlukGruplar.every((g) => g.toplam === 0) ? (
            <BosDurum ikon="chart-bar" mesaj="Grafik için süt kaydı yok" />
          ) : (
            <View style={styles.barGrafik}>
              {gunlukGruplar.map((g, index) => {
                const max = Math.max(...gunlukGruplar.map((x) => x.toplam), 1);
                const yuzde = (g.toplam / max) * 100;

                return (
                  <View key={index} style={styles.barItem}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${Math.max(yuzde, g.toplam > 0 ? 8 : 0)}%`,
                            backgroundColor: SURU_RENK,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValue}>{g.toplam.toFixed(0)}</Text>
                    <Text style={styles.barLabel}>{g.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>En Verimli İnek</Text>

          {enVerimli?.hayvan?.isim && enVerimli.kayitSayisi > 0 ? (
            <View style={styles.enVerimliKutu}>
              <View style={[styles.buyukIkon, { backgroundColor: SURU_RENK }]}>
                <MaterialCommunityIcons name="cow" size={28} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.enVerimliIsim}>{enVerimli.hayvan.isim}</Text>
                <Text style={styles.enVerimliAlt}>
                  Son 7 gün ortalaması: {enVerimli.son7Ortalama.toFixed(1)} lt/gün
                </Text>
                <Text style={styles.enVerimliAlt}>
                  Genel ortalama: {enVerimli.ortalama.toFixed(1)} lt/gün
                </Text>
              </View>

              <Text style={[styles.enVerimliDeger, { color: SURU_RENK }]}>
                {enVerimli.enYuksek.toFixed(1)} lt
              </Text>
            </View>
          ) : (
            <BosDurum ikon="cow-off" mesaj="Henüz verimli inek hesaplanacak kayıt yok" />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>İnek Bazlı Performans</Text>

          {siraliHayvanlar.length === 0 ? (
            <BosDurum ikon="cow-off" mesaj="Henüz inek eklenmemiş" />
          ) : (
            siraliHayvanlar.map((o) => (
              <View key={o.hayvan.id} style={styles.performansSatir}>
                <View style={[styles.inekIkon, { backgroundColor: SURU_RENK + '20' }]}>
                  <MaterialCommunityIcons name="cow" size={20} color={SURU_RENK} />
                </View>

                <View style={styles.performansBilgi}>
                  <Text style={styles.performansIsim}>{o.hayvan.isim}</Text>
                  <Text style={styles.performansAlt}>
                    {o.kayitSayisi} kayıt • Genel ort. {o.ortalama.toFixed(1)} lt
                  </Text>
                  {o.sonKayit ? (
                    <Text style={styles.performansAlt}>
                      Son kayıt: {o.sonKayit.tarih} — {sayi(o.sonKayit.toplamSut).toFixed(1)} lt
                    </Text>
                  ) : (
                    <Text style={styles.performansAlt}>Henüz süt kaydı yok</Text>
                  )}
                </View>

                <View style={styles.performansSag}>
                  <Text style={[styles.performansDeger, { color: SURU_RENK }]}>
                    {o.son7Ortalama.toFixed(1)}
                  </Text>
                  <Text style={styles.performansBirim}>lt/gün</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {(dusukVerimliler.length > 0 || kayitsizLaktasyon.length > 0) && (
          <View style={styles.uyariCard}>
            <View style={styles.baslikSatir}>
              <Text style={styles.uyariBaslik}>Dikkat Edilecekler</Text>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={22}
                color={COLORS.warning || '#C9A84C'}
              />
            </View>

            {dusukVerimliler.map((o) => (
              <Text key={o.hayvan.id} style={styles.uyariYazi}>
                • {o.hayvan.isim}: Son 7 gün ortalaması düşük görünüyor ({o.son7Ortalama.toFixed(1)} lt/gün).
              </Text>
            ))}

            {kayitsizLaktasyon.map((h) => (
              <Text key={h.id} style={styles.uyariYazi}>
                • {h.isim}: Laktasyonda görünüyor ama süt kaydı yok.
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.paylasButon, { backgroundColor: SURU_RENK }]}
          onPress={raporPaylas}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
          <Text style={styles.paylasYazi}>Raporu Paylaş</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Reçber — Sürü Süt Raporu
        </Text>
      </ScrollView>
    </View>
  );
}

function sonGunleriHazirla(kayitlar, gunSayisi) {
  const sonuc = [];

  for (let i = gunSayisi - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const tarihStr = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${d.getFullYear()}`;

    const toplam = kayitlar
      .filter((k) => k.tarih === tarihStr)
      .reduce((acc, k) => acc + sayi(k.toplamSut), 0);

    sonuc.push({
      tarih: tarihStr,
      toplam,
      label: `${d.getDate()}.${d.getMonth() + 1}`,
    });
  }

  return sonuc;
}

function MetrikKart({ ikon, baslik, deger, birim, renk }) {
  return (
    <View style={styles.metrikKart}>
      <MaterialCommunityIcons name={ikon} size={22} color={renk} />
      <Text style={[styles.metrikDeger, { color: renk }]}>{deger}</Text>
      <Text style={styles.metrikBaslik}>{baslik}</Text>
      <Text style={styles.metrikBirim}>{birim}</Text>
    </View>
  );
}

function DurumMini({ label, value, renk }) {
  return (
    <View style={styles.durumMini}>
      <Text style={[styles.durumValue, { color: renk }]}>{value}</Text>
      <Text style={styles.durumLabel}>{label}</Text>
    </View>
  );
}

function BosDurum({ ikon, mesaj }) {
  return (
    <View style={styles.bosDurum}>
      <MaterialCommunityIcons name={ikon} size={34} color={COLORS.textLight} />
      <Text style={styles.bosYazi}>{mesaj}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 12,
    paddingBottom: 40,
  },

  metrikGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },

  metrikKart: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  metrikDeger: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },

  metrikBaslik: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },

  metrikBirim: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 1,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  cardSubTitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  baslikSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  durumGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  durumMini: {
    alignItems: 'center',
    flex: 1,
  },

  durumValue: {
    fontSize: 22,
    fontWeight: '900',
  },

  durumLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
    textAlign: 'center',
  },

  barGrafik: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },

  barItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },

  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    overflow: 'hidden',
  },

  bar: {
    width: '100%',
    borderRadius: 8,
  },

  barValue: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },

  barLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
  },

  enVerimliKutu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  buyukIkon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  enVerimliIsim: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  enVerimliAlt: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  enVerimliDeger: {
    fontSize: 20,
    fontWeight: '900',
  },

  performansSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.divider,
  },

  inekIkon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  performansBilgi: {
    flex: 1,
  },

  performansIsim: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  performansAlt: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  performansSag: {
    alignItems: 'center',
    minWidth: 54,
  },

  performansDeger: {
    fontSize: 18,
    fontWeight: '900',
  },

  performansBirim: {
    fontSize: 10,
    color: COLORS.textLight,
  },

  uyariCard: {
    backgroundColor: (COLORS.warning || '#C9A84C') + '18',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: (COLORS.warning || '#C9A84C') + '35',
  },

  uyariBaslik: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  uyariYazi: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },

  paylasButon: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },

  paylasYazi: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  bosDurum: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },

  bosYazi: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  footer: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 12,
    color: COLORS.textLight,
  },
});
