// src/utils/proLimits.js

export const PRO_LIMITS = {
  besiHayvanLimit: 2,
  sutInekLimit: 2,
  kumesTavukLimit: 20,
};

export function isProAktif() {
  // Şimdilik ödeme sistemi bağlanmadığı için false.
  // RevenueCat / Google Billing bağlanınca burası gerçek Pro durumuna dönecek.
  return false;
}

export function besiLimitAsildi(hayvanSayisi) {
  if (isProAktif()) return false;
  return hayvanSayisi >= PRO_LIMITS.besiHayvanLimit;
}

export function sutLimitAsildi(inekSayisi) {
  if (isProAktif()) return false;
  return inekSayisi >= PRO_LIMITS.sutInekLimit;
}

export function kumesLimitAsildi(mevcutTavukSayisi, eklenecekTavukSayisi = 0) {
  if (isProAktif()) return false;

  const toplam = Number(mevcutTavukSayisi || 0) + Number(eklenecekTavukSayisi || 0);
  return toplam > PRO_LIMITS.kumesTavukLimit;
}

export function getProLimitMesaji(tip) {
  if (tip === 'besi') {
    return 'Ücretsiz sürümde en fazla 2 besi hayvanı ekleyebilirsiniz. Sınırsız kullanım için Reçber Pro’ya geçin.';
  }

  if (tip === 'sut') {
    return 'Ücretsiz sürümde en fazla 2 süt ineği ekleyebilirsiniz. Sınırsız kullanım için Reçber Pro’ya geçin.';
  }

  if (tip === 'kumes') {
    return 'Ücretsiz sürümde en fazla 20 tavuk takip edebilirsiniz. Daha fazlası için Reçber Pro’ya geçin.';
  }

  return 'Sınırsız kullanım için Reçber Pro’ya geçin.';
}
