import type { WatchItem } from '../store/catalogStore';

export const tagGroups = {
  Movimento: ['Automático', 'Quartzo', 'Solar', 'Eco-Drive', 'Corda manual'],
  Vidro: ['Safira', 'Mineral', 'Hardlex', 'Acrílico'],
  Estilo: ['Diver', 'Field', 'Piloto', 'Social', 'Digital', 'Retrô', 'Esportivo'],
  Materiais: ['Aço inoxidável', 'Titânio', 'Resina', 'Couro', 'Nylon', 'Borracha'],
  'Resistência à água': ['30 m', '50 m', '100 m', '200 m'],
  Funções: ['Data', 'Cronógrafo', 'Cronômetro', 'Alarme', 'GMT', 'Luminoso', 'Coroa rosqueada', 'Cerâmica'],
} as const;
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function watchTags(watch: WatchItem): string[] {
  if (watch.tags) return watch.tags;
  const text = normalize(`${watch.model} ${watch.specs}`);
  const tags = new Set<string>();
  const rules: [string, RegExp][] = [
    ['Automático', /movimento automatico|automatico (seiko|miyota)|nh35|ad2536/],
    ['Quartzo', /quartzo|quartz|vh31/], ['Solar', /solar|eco.?drive/], ['Eco-Drive', /eco.?drive/],
    ['Safira', /safira/], ['Mineral', /mineral/], ['Hardlex', /hardlex/], ['Acrílico', /acrilico/],
    ['Field', /field/], ['Piloto', /piloto/], ['Digital', /digital/], ['Retrô', /retro|vintage/],
    ['Aço inoxidável', /aco inox|316l/], ['Titânio', /titanio/], ['Resina', /resina/], ['Couro', /couro/], ['Nylon', /nylon/],
    ['Data', /com data|calendario/], ['Cronômetro', /cronometro/], ['Alarme', /alarme/],
    ['GMT', /\bgmt\b/], ['Luminoso', /lume|luminos|luz|led/], ['Coroa rosqueada', /coroa rosqueada/], ['Cerâmica', /ceramica/],
  ];
  for (const [tag, pattern] of rules) if (pattern.test(text)) tags.add(tag);
  for (const meters of [30, 50, 100, 200]) if (new RegExp(`\\b${meters}\\s*m\\b`).test(text)) tags.add(`${meters} m`);
  return [...tags];
}

export function filterWatches(watches: WatchItem[], query: string, selected: string[]) {
  const search = normalize(query.trim());
  return watches.filter(watch => {
    const tags = watchTags(watch);
    return selected.every(tag => tags.includes(tag)) && normalize(`${watch.brand} ${watch.model} ${watch.specs} ${tags.join(' ')}`).includes(search);
  });
}
