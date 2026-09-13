import type { WatchItem } from '../store/catalogStore';

type WatchDetails = { images: string[]; facts: Record<string, string> };

// Informações dos anúncios enviados pelo usuário. Não dependem do id do banco.
const details: Record<string, WatchDetails> = {
  'my-h3-c silvery': {
    images: ['/watches/addiesdive-my-h3-c.jpg', '/watches/addiesdive-my-h3-c-2.jpg', '/watches/addiesdive-my-h3-c-3.jpg', '/watches/addiesdive-my-h3-c-4.jpg'],
    facts: { 'Movimento': 'Quartzo Miyota 2115', 'Diâmetro': '41 mm, sem coroa', 'Espessura': '13 mm', 'Cristal': 'Mineral / Hardlex convexo', 'Resistência à água': '200 m · 20 ATM', 'Caixa e pulseira': 'Aço inoxidável 316L', 'Luminosidade': 'BGW9 · luz azul', 'Entre asas': '20 mm' },
  },
  'piloto retrô 39mm (vh31)': {
    images: ['/watches/tandorio-vh31-39mm.jpg', '/watches/tandorio-vh31-39mm-2.jpg', '/watches/tandorio-vh31-39mm-3.jpg', '/watches/tandorio-vh31-39mm-4.jpg'],
    facts: { 'Movimento': 'Quartzo japonês VH31', 'Diâmetro': '39 mm, sem coroa', 'Espessura': '12 mm', 'Cristal': 'Safira', 'Resistência à água': '200 m · 20 ATM', 'Caixa': 'Aço inoxidável 316L', 'Pulseira': 'Couro · 20 mm', 'Comprimento entre asas': '48,6 mm' },
  },
};

export function getWatchDetails(watch: WatchItem) {
  const match = details[watch.model.trim().toLowerCase()];
  return {
    images: [...new Set([...watch.images, ...(match?.images ?? [])])],
    facts: match?.facts ?? { 'Marca': watch.brand, 'Modelo': watch.model, 'Onde encontrar': watch.storeName ?? 'A confirmar' },
  };
}

export function safeStoreUrl(url: string | null) {
  try { const parsed = new URL(url ?? ''); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : undefined; }
  catch { return undefined; }
}
