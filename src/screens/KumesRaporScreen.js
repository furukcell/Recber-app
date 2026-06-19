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
  getKumesGruplar,
  getYumurtaKayitlari,
  getKumesSatislar,
  getKumesKayiplar,
  modulYemKullanimlari,
} from '../data/storage';

const KUMES_RENK = '#A0522D';

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

// Yem kullanım kayıtlarının tarihi ISO string (Date.toISOString) formatında
// tutuluyor. Yumurta/satış kayıtlarındaki "GG.AA.YYYY" formatından farklı
// olduğu için ayrı bir kontrol fonksiyonu kullanıyoruz.
function isoSonGunIcindeMi(isoTarih, gunSayisi) {
  if (!isoTarih) return false;
  const tarih = new Date(isoTarih);
  if (Number.isNaN(tarih.getTime())) return false;

  const bugun = new Date();
  const baslangic = new Date();
  baslangic.setDate(bugun.getDate() - (gunSayisi - 1));
  baslangic.setHours(0, 0, 0, 0);

  return tarih >= baslangic && tarih <= bugun;
}

function isoBuAyMi(isoTarih) {
  if (!isoTarih) return false;
  const tarih = new Date(isoTarih);
  if (Number.isNaN(tarih.getTime())) return false;

  const bugun = new Date();
  return (
    tarih.getFullYear() === bugun.getFullYear() &&
    tarih.getMonth() === bugun.getMonth()
  );
}

export default function KumesRaporScreen() {
  const [gruplar, setGruplar] = useState([]);
  const [yumurtaKayitlari, setYumurtaKayitlari] = useState([]);
  const [satislar, setSatislar] = useState([]);
  const [kayiplar, setKayiplar] = useState([]);
  const [yemKullanimlari, setYemKullanimlari] = useState([]);
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = async () => {
    const g = await getKumesGruplar();
    const y = await getYumurtaKayitlari();
    const s = await getKumesSatislar();
    const k = await getKumesKayiplar();
    const yk = await modulYemKullanimlari('kumes');

    setGruplar(Array.isArray(g) ? g : []);
    setYumurtaKayitlari(Array.isArray(y) ? y : []);
    setSatislar(Array.isArray(s) ? s : []);
    setKayiplar(Array.isArray(k) ? k : []);
    setYemKullanimlari(Array.isArray(yk) ? yk : []);
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

  const bugunStr = bugunTarih();

  const aktifGruplar = gruplar.filter((g) => g.aktifMi);
  const toplamTavuk = aktifGruplar.reduce((acc, g) => acc + sayi(g.mevcutSayi), 0);

  const bugunKayitlar = yumurtaKayitlari.filter((k) => k.tarih === bugunStr);
  const son7Kayitlar = yumurtaKayitlari.filter((k) => sonGunIcindeMi(k.tarih, 7));
  const buAyKayitlar = yumurtaKayitlari.filter((k) => buAyMi(k.tarih));

  const bugunYumurta = bugunKayitlar.reduce((acc, k) => acc + sayi(k.adet), 0);
  const son7Yumurta = son7Kayitlar.reduce((acc, k) => acc + sayi(k.adet), 0);
  const buAyYumurta = buAyKayitlar.reduce((acc, k) => acc + sayi(k.adet), 0);
  const buAyKirik = buAyKayitlar.reduce((acc, k) => acc + sayi(k.kirik), 0);

  const son7GunOrt = son7Yumurta > 0 ? (son7Yumurta / 7).toFixed(1) : '0.0';

  // Yumurta verim oranı: günlük yumurta / mevcut tavuk (yüzde)
  const bugunVerimOrani =
    toplamTavuk > 0 ? ((bugunYumurta / toplamTavuk) * 100).toFixed(0) : null;
  const son7VerimOrani =
    toplamTavuk > 0 ? ((Number(son7GunOrt) / toplamTavuk) * 100).toFixed(0) : null;

  // ─── GELİR ───────────────────────────────────────────────────
  const yumurtaSatisGeliri = satislar
    .filter((s) => s.tip === 'yumurta')
    .reduce((acc, s) => acc + sayi(s.tutar), 0);
  const tavukSatisGeliri = satislar
    .filter((s) => s.tip === 'tavuk')
    .reduce((acc, s) => acc + sayi(s.tutar), 0);
  const toplamGelir = yumurtaSatisGeliri + tavukSatisGeliri;

  // ─── YEM MALİYETİ (Ambar gerçek tüketim kayıtlarından) ────────
  const son7YemKayitlari = yemKullanimlari.filter((k) => isoSonGunIcindeMi(k.tarih, 7));
  const buAyYemKayitlari = yemKullanimlari.filter((k) => isoBuAyMi(k.tarih));

  const toplamYemKg = yemKullanimlari.reduce((acc, k) => acc + sayi(k.miktarKg), 0);
  const toplamYemMaliyet = yemKullanimlari.reduce((acc, k) => acc + sayi(k.toplamMaliyet), 0);

  const son7YemKg = son7YemKayitlari.reduce((acc, k) => acc + sayi(k.miktarKg), 0);
  const son7YemMaliyet = son7YemKayitlari.reduce((acc, k) => acc + sayi(k.toplamMaliyet), 0);
  const buAyYemMaliyet = buAyYemKayitlari.reduce((acc, k) => acc + sayi(k.toplamMaliyet), 0);

  // Tavuk başına günlük yem maliyeti (son 7 gün)
  const tavukBasinaGunlukMaliyet =
    toplamTavuk > 0 ? (son7YemMaliyet / 7 / toplamTavuk).toFixed(2) : null;

  // Yumurta başına yem maliyeti (son 7 gün masrafı / son 7 gün üretim)
  const yumurtaBasinaMaliyet =
    son7Yumurta > 0 ? (son7YemMaliyet / son7Yumurta).toFixed(2) : null;

  const toplamMaliyet = toplamYemMaliyet;
  const netKarZarar = toplamGelir - toplamMaliyet;

  const grupOzetleri = gruplar.map((g) => {
    const kayitlar = yumurtaKayitlari.filter((k) => k.grupId === g.id);
    const toplam = kayitlar.reduce((acc, k) => acc + sayi(k.adet), 0);
    const son7 = kayitlar.filter((k) => sonGunIcindeMi(k.tarih, 7));
    const son7Toplam = son7.reduce((acc, k) => acc + sayi(k.adet), 0);
    const son7Ort = son7.length > 0 ? son7Toplam / 7 : 0;
    const verimYuzde =
      sayi(g.mevcutSayi) > 0 ? (son7Ort / sayi(g.mevcutSayi)) * 100 : 0;
    const kayipSayisi = kayiplar
      .filter((k) => k.grupId === g.id)
      .reduce((acc, k) => acc + sayi(k.adet), 0);

    return { grup: g, kayitSayisi: kayitlar.length, toplam, son7Ort, verimYuzde, kayipSayisi };
  });

  const siraliGruplar = [...grupOzetleri]
    .filter((o) => o.grup.aktifMi)
    .sort((a, b) => b.verimYuzde - a.verimYuzde);

  const enVerimli = siraliGruplar[0];

  const dusukVerimliGruplar = grupOzetleri.filter(
    (o) => o.grup.aktifMi && o.kayitSayisi > 0 && o.verimYuzde > 0 && o.verimYuzde < 40
  );

  const kayitsizGruplar = grupOzetleri.filter((o) => o.grup.aktifMi && o.kayitSayisi === 0);

  const gunlukGruplar = sonGunleriHazirla(yumurtaKayitlari, 7);

  const raporPaylas = async () => {
    const yemSatiri =
      toplamYemMaliyet > 0
        ? `\n🌾 Son 7 Gün Yem Masrafı: ${son7YemMaliyet.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL\n🥚 Yumurta Başına Yem Maliyeti: ${yumurtaBasinaMaliyet ? `${yumurtaBasinaMaliyet} TL` : 'Veri yok'}\n`
        : '';

    const metin = `🐔 Reçber Kümes Raporu

🐔 Toplam Tavuk: ${toplamTavuk}
📅 Bugünkü Yumurta: ${bugunYumurta} adet
🗓️ Son 7 Gün Toplam: ${son7Yumurta} adet
📈 Günlük Ortalama: ${son7GunOrt} adet
📆 Bu Ay Toplam: ${buAyYumurta} adet
${son7VerimOrani ? `📊 Son 7 Gün Verim: %${son7VerimOrani}\n` : ''}${yemSatiri}
💰 Yumurta Satış Geliri: ${yumurtaSatisGeliri.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
💰 Tavuk Satış Geliri: ${tavukSatisGeliri.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
${netKarZarar >= 0 ? '✅' : '🔴'} Net Kâr/Zarar: ${netKarZarar.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL

⭐ En Verimli Grup:
${enVerimli?.grup?.isim ? `${enVerimli.grup.isim} — %${enVerimli.verimYuzde.toFixed(0)} verim` : 'Henüz veri yok'}

Reçber — Kümes Takibi`;

    await Share.share({ message: metin });
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Kümes Rapor"
        altBaslik={`${toplamTavuk} tavuk • ${bugunYumurta} yumurta bugün`}
        modulRenk={KUMES_RENK}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={yenileniyor} onRefresh={onYenile} tintColor={KUMES_RENK} />
        }
      >
        <View style={styles.metrikGrid}>
          <MetrikKart ikon="egg" baslik="Bugün" deger={bugunYumurta} birim="adet" renk={KUMES_RENK} />
          <MetrikKart ikon="calendar-week" baslik="Son 7 Gün" deger={son7Yumurta} birim="adet" renk={KUMES_RENK} />
          <MetrikKart ikon="calendar-month" baslik="Bu Ay" deger={buAyYumurta} birim="adet" renk={COLORS.accent || KUMES_RENK} />
          <MetrikKart ikon="chart-line" baslik="Günlük Ort." deger={son7GunOrt} birim="adet" renk={COLORS.info || KUMES_RENK} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kümes Durumu</Text>
          <View style={styles.durumGrid}>
            <DurumMini label="Toplam Tavuk" value={toplamTavuk} renk={KUMES_RENK} />
            <DurumMini label="Aktif Grup" value={aktifGruplar.length} renk={KUMES_RENK} />
            <DurumMini
              label="Verim Oranı"
              value={son7VerimOrani ? `%${son7VerimOrani}` : '—'}
              renk={COLORS.success || KUMES_RENK}
            />
            <DurumMini
              label="Bu Ay Kayıp"
              value={kayiplar.length}
              renk={COLORS.danger || KUMES_RENK}
            />
          </View>
        </View>

        {/* ─── YEM MALİYETİ KARTI ─── */}
        <View style={styles.card}>
          <View style={styles.baslikSatir}>
            <Text style={styles.cardTitle}>Yem Maliyeti</Text>
            <MaterialCommunityIcons name="barn" size={20} color={KUMES_RENK} />
          </View>

          {toplamYemMaliyet === 0 ? (
            <BosDurum
              ikon="food-off-outline"
              mesaj="Henüz yem tüketim kaydı yok. Grup detayından rasyon tanımlayın."
            />
          ) : (
            <>
              <View style={styles.yemMaliyetGrid}>
                <YemMaliyetMini
                  label="Son 7 Gün"
                  deger={`${son7YemMaliyet.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`}
                  altDeger={`${son7YemKg.toFixed(0)} kg`}
                  renk={KUMES_RENK}
                />
                <YemMaliyetMini
                  label="Bu Ay"
                  deger={`${buAyYemMaliyet.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`}
                  renk={COLORS.accent || KUMES_RENK}
                />
                <YemMaliyetMini
                  label="Toplam"
                  deger={`${toplamYemMaliyet.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`}
                  altDeger={`${toplamYemKg.toFixed(0)} kg`}
                  renk={COLORS.textSecondary}
                />
              </View>

              <View style={styles.litreMaliyetKutu}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.litreMaliyetBaslik}>Yumurta Başına Yem Maliyeti</Text>
                  <Text style={styles.litreMaliyetAlt}>Son 7 günkü yem masrafı / son 7 günkü üretim</Text>
                </View>
                <Text style={[styles.litreMaliyetDeger, { color: KUMES_RENK }]}>
                  {yumurtaBasinaMaliyet ? `${yumurtaBasinaMaliyet} TL` : '—'}
                </Text>
              </View>

              {tavukBasinaGunlukMaliyet && (
                <Text style={styles.litreMaliyetGenelNot}>
                  Tavuk başına günlük yem maliyeti: {tavukBasinaGunlukMaliyet} TL
                </Text>
              )}
            </>
          )}
        </View>

        {/* ─── FİNANSAL ÖZET ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Finansal Özet</Text>
          <FinansSatir label="Yumurta Satışı" deger={yumurtaSatisGeliri} renk={COLORS.success} />
          <FinansSatir label="Tavuk Satışı" deger={tavukSatisGeliri} renk={COLORS.success} />
          <View style={styles.ayrac} />
          <FinansSatir label="Yem Maliyeti" deger={-toplamYemMaliyet} renk={COLORS.danger} />
          <View style={styles.ayrac} />
          <View style={styles.netSatir}>
            <Text style={styles.netLabel}>NET KAR / ZARAR</Text>
            <Text style={[styles.netDeger, { color: netKarZarar >= 0 ? COLORS.success : COLORS.danger }]}>
              {netKarZarar >= 0 ? '+' : ''}{Math.round(netKarZarar).toLocaleString('tr-TR')} TL
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.baslikSatir}>
            <Text style={styles.cardTitle}>Son 7 Gün Yumurta Grafiği</Text>
            <Text style={styles.cardSubTitle}>adet/gün</Text>
          </View>

          {gunlukGruplar.every((g) => g.toplam === 0) ? (
            <BosDurum ikon="chart-bar" mesaj="Grafik için yumurta kaydı yok" />
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
                            backgroundColor: KUMES_RENK,
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
          <Text style={styles.cardTitle}>En Verimli Grup</Text>

          {enVerimli?.grup?.isim && enVerimli.kayitSayisi > 0 ? (
            <View style={styles.enVerimliKutu}>
              <View style={[styles.buyukIkon, { backgroundColor: KUMES_RENK }]}>
                <MaterialCommunityIcons name="bird" size={28} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.enVerimliIsim}>{enVerimli.grup.isim}</Text>
                <Text style={styles.enVerimliAlt}>
                  Son 7 gün verim: %{enVerimli.verimYuzde.toFixed(0)}
                </Text>
                <Text style={styles.enVerimliAlt}>
                  Günlük ortalama: {enVerimli.son7Ort.toFixed(1)} adet
                </Text>
              </View>

              <Text style={[styles.enVerimliDeger, { color: KUMES_RENK }]}>
                {enVerimli.toplam.toFixed(0)}
              </Text>
            </View>
          ) : (
            <BosDurum ikon="bird-off" mesaj="Henüz verimli grup hesaplanacak kayıt yok" />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Grup Bazlı Performans</Text>

          {siraliGruplar.length === 0 ? (
            <BosDurum ikon="bird-off" mesaj="Henüz aktif grup yok" />
          ) : (
            siraliGruplar.map((o) => (
              <View key={o.grup.id} style={styles.performansSatir}>
                <View style={[styles.grupIkonMini, { backgroundColor: KUMES_RENK + '20' }]}>
                  <MaterialCommunityIcons name="bird" size={20} color={KUMES_RENK} />
                </View>

                <View style={styles.performansBilgi}>
                  <Text style={styles.performansIsim}>{o.grup.isim}</Text>
                  <Text style={styles.performansAlt}>
                    {o.grup.mevcutSayi} tavuk • {o.kayitSayisi} kayıt
                  </Text>
                  {o.kayipSayisi > 0 && (
                    <Text style={styles.performansAlt}>Kayıp: {o.kayipSayisi} adet</Text>
                  )}
                </View>

                <View style={styles.performansSag}>
                  <Text style={[styles.performansDeger, { color: KUMES_RENK }]}>
                    %{o.verimYuzde.toFixed(0)}
                  </Text>
                  <Text style={styles.performansBirim}>verim</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {(dusukVerimliGruplar.length > 0 || kayitsizGruplar.length > 0) && (
          <View style={styles.uyariCard}>
            <View style={styles.baslikSatir}>
              <Text style={styles.uyariBaslik}>Dikkat Edilecekler</Text>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={22}
                color={COLORS.warning || '#C9A84C'}
              />
            </View>

            {dusukVerimliGruplar.map((o) => (
              <Text key={o.grup.id} style={styles.uyariYazi}>
                • {o.grup.isim}: Son 7 gün verimi düşük görünüyor (%{o.verimYuzde.toFixed(0)}).
              </Text>
            ))}

            {kayitsizGruplar.map((o) => (
              <Text key={o.grup.id} style={styles.uyariYazi}>
                • {o.grup.isim}: Aktif görünüyor ama yumurta kaydı yok.
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.paylasButon, { backgroundColor: KUMES_RENK }]}
          onPress={raporPaylas}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
          <Text style={styles.paylasYazi}>Raporu Paylaş</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Reçber — Kümes Raporu</Text>
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
      .reduce((acc, k) => acc + sayi(k.adet), 0);

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

function YemMaliyetMini({ label, deger, altDeger, renk }) {
  return (
    <View style={styles.yemMaliyetMini}>
      <Text style={styles.yemMaliyetLabel}>{label}</Text>
      <Text style={[styles.yemMaliyetDeger, { color: renk }]}>{deger}</Text>
      {altDeger ? <Text style={styles.yemMaliyetAltDeger}>{altDeger}</Text> : null}
    </View>
  );
}

function FinansSatir({ label, deger, renk }) {
  return (
    <View style={styles.finansSatir}>
      <Text style={styles.finansLabel}>{label}</Text>
      <Text style={[styles.finansDeger, { color: renk }]}>
        {deger >= 0 ? '+' : ''}{Math.round(deger).toLocaleString('tr-TR')} TL
      </Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 40 },

  metrikGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  metrikKart: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metrikDeger: { fontSize: 24, fontWeight: '900', marginTop: 6 },
  metrikBaslik: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  metrikBirim: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  cardSubTitle: { fontSize: 12, color: COLORS.textLight },
  baslikSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  durumGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  durumMini: { alignItems: 'center', flex: 1 },
  durumValue: { fontSize: 20, fontWeight: '900' },
  durumLabel: { fontSize: 10, color: COLORS.textLight, marginTop: 2, textAlign: 'center' },

  yemMaliyetGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  yemMaliyetMini: { flex: 1, backgroundColor: COLORS.background, borderRadius: 12, padding: 10, alignItems: 'center' },
  yemMaliyetLabel: { fontSize: 10, color: COLORS.textLight, marginBottom: 4 },
  yemMaliyetDeger: { fontSize: 15, fontWeight: '900' },
  yemMaliyetAltDeger: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },

  litreMaliyetKutu: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: 12, padding: 14,
  },
  litreMaliyetBaslik: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  litreMaliyetAlt: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  litreMaliyetDeger: { fontSize: 20, fontWeight: '900' },
  litreMaliyetGenelNot: { fontSize: 11, color: COLORS.textLight, marginTop: 8, textAlign: 'center' },

  finansSatir: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  finansLabel: { fontSize: 13, color: COLORS.textSecondary },
  finansDeger: { fontSize: 13, fontWeight: '700' },
  ayrac: { height: 1, backgroundColor: COLORS.divider, marginVertical: 6 },
  netSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  netLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.5 },
  netDeger: { fontSize: 20, fontWeight: '900' },

  barGrafik: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 8, marginTop: 8 },
  barItem: { flex: 1, alignItems: 'center', height: '100%' },
  barContainer: {
    flex: 1, width: '100%', justifyContent: 'flex-end',
    backgroundColor: COLORS.background, borderRadius: 8, overflow: 'hidden',
  },
  bar: { width: '100%', borderRadius: 8 },
  barValue: { fontSize: 10, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4 },
  barLabel: { fontSize: 9, color: COLORS.textLight, marginTop: 2 },

  enVerimliKutu: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  buyukIkon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  enVerimliIsim: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary },
  enVerimliAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  enVerimliDeger: { fontSize: 20, fontWeight: '900' },

  performansSatir: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.divider,
  },
  grupIkonMini: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  performansBilgi: { flex: 1 },
  performansIsim: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  performansAlt: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  performansSag: { alignItems: 'center', minWidth: 54 },
  performansDeger: { fontSize: 18, fontWeight: '900' },
  performansBirim: { fontSize: 10, color: COLORS.textLight },

  uyariCard: {
    backgroundColor: (COLORS.warning || '#C9A84C') + '18',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: (COLORS.warning || '#C9A84C') + '35',
  },
  uyariBaslik: { fontSize: 15, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
  uyariYazi: { fontSize: 12, lineHeight: 18, color: COLORS.textSecondary, marginBottom: 6 },

  paylasButon: {
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4,
  },
  paylasYazi: { color: '#fff', fontSize: 15, fontWeight: '800' },

  bosDurum: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  bosYazi: { fontSize: 13, color: COLORS.textLight, textAlign: 'center' },

  footer: { textAlign: 'center', marginTop: 18, fontSize: 12, color: COLORS.textLight },
});
