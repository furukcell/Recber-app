// src/utils/proLimits.js
import Purchases from 'react-native-purchases';

export const PRO_LIMITS = {
  besiHayvanLimit: 2,
  sutInekLimit: 2,
  kumesTavukLimit: 20,
};

export async function isProAktif() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
  } catch (e) {
    return false;
  }
}

export function besiLimitAsildi(hayvanSayisi, isPro = false) {
  if (isPro) return false;
  return hayvanSayisi >= PRO_LIMITS.besiHayvanLimit;
}

export function sutLimitAsildi(inekSayisi, isPro = false) {
  if (isPro) return false;
  return inekSayisi >= PRO_LIMITS.sutInekLimit;
}

export function kumesLimitAsildi(mevcutTavukSayisi, eklenecekTavukSayisi = 0, isPro = false) {
  if (isPro) return false;
  const toplam = Number(mevcutTavukSayisi || 0) + Number(eklenecekTavukSayisi || 0);
  return toplam > PRO_LIMITS.kumesTavukLimit;
}

export function getProLimitMesaji(tip) {
  if (tip === 'besi') return 'Ücretsiz sürümde en fazla 2 besi hayvanı ekleyebilirsiniz. Sınırsız kullanım için Reçber Pro\'ya geçin.';
  if (tip === 'sut') return 'Ücretsiz sürümde en fazla 2 süt ineği ekleyebilirsiniz. Sınırsız kullanım için Reçber Pro\'ya geçin.';
  if (tip === 'kumes') return 'Ücretsiz sürümde en fazla 20 tavuk takip edebilirsiniz. Daha fazlası için Reçber Pro\'ya geçin.';
  return 'Sınırsız kullanım için Reçber Pro\'ya geçin.';
}
