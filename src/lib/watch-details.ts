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
  'w-59-1vq resina': {
    images: ['/watches/casio-w59-1vq.png'],
    facts: { 'Movimento': 'Digital Casio Quartz', 'Dimensões': '37,1 × 33,6 mm', 'Espessura': '8,7 mm', 'Material da caixa': 'Resina preta durável', 'Pulseira': 'Resina preta com fivela simples', 'Resistência à água': '50 m · 5 ATM', 'Vidro': 'Acrílico / Cristal Mineral', 'Peso': '22 g', 'Bateria': 'Aproximadamente 7 anos de duração', 'Funções': 'Cronômetro 1/100s, alarme diário, sinal sonoro a cada hora, luz LED laranja, calendário automático' },
  },
  'vintage a138 retrô aço inox': {
    images: ['/watches/casio-vintage-a138.png', '/watches/casio-vintage-a138-2.png', '/watches/casio-vintage-a138-3.png', '/watches/casio-vintage-a138-4.png'],
    facts: { 'Movimento': 'Analógico Quartzo (3 agulhas)', 'Formato da caixa': 'Quadrado Retrô Vintage', 'Material da caixa': 'Metal cromado polido', 'Pulseira': 'Aço inoxidável com fecho de pressão', 'Resistência à água': '30 m · 3 ATM', 'Calendário': 'Exibição de data integrada às 3h', 'Edição': 'Edição Especial Limitada Vintage' },
  },
  'vintage a158wa-1df prata': {
    images: ['/watches/casio-vintage-a158wa-1df.png'],
    facts: { 'Movimento': 'Digital Casio Quartz', 'Dimensões': '36,8 × 33,2 mm', 'Espessura': '8,2 mm', 'Material da caixa': 'Resina cromada prateada', 'Pulseira': 'Aço inoxidável com fecho de gancho ajustável', 'Resistência à água': '30 m · Resistente a respingos', 'Peso': '46 g', 'Funções': 'Cronômetro 1/100s, alarme diário, sinal horário, iluminação LED verde, calendário automático' },
  },
  'classic f-91w original': {
    images: ['/watches/casio-f91w.png', '/watches/casio-f91w-silver.png'],
    facts: { 'Movimento': 'Digital Casio Quartz', 'Dimensões': '38,2 × 35,2 mm', 'Espessura': '8,5 mm', 'Material da caixa': 'Resina leve', 'Pulseira': 'Resina preta', 'Resistência à água': '30 m · 3 ATM', 'Peso': '21 g', 'Bateria': '7 anos', 'Funções': 'Cronômetro 1/100s, alarme diário, sinal horário, micro-luz LED' },
  },
  'vintage a159wgea dourado': {
    images: ['/watches/casio-vintage-dourado.png'],
    facts: { 'Movimento': 'Digital Casio Quartz', 'Dimensões': '36,8 × 33,2 mm', 'Espessura': '8,2 mm', 'Acabamento': 'Revestimento dourado iônico', 'Pulseira': 'Aço inoxidável dourado', 'Resistência à água': '30 m · 3 ATM', 'Funções': 'Cronômetro 1/100s, alarme diário, calendário automático, luz LED' },
  },
};

export function getWatchDetails(watch: WatchItem) {
  const match = details[watch.model.trim().toLowerCase()];
  return {
    images: [...new Set([...watch.images, ...(match?.images ?? [])])],
    facts: watch.specifications ?? match?.facts ?? { 'Marca': watch.brand, 'Modelo': watch.model, 'Onde encontrar': watch.storeName ?? 'A confirmar' },
  };
}

export function safeStoreUrl(url: string | null) {
  try { const parsed = new URL(url ?? ''); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : undefined; }
  catch { return undefined; }
}
