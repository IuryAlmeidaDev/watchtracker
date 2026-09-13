import { useId } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { tagGroups } from '../lib/watch-tags';

export function WatchFilters({query, selected, onQuery, onSelected, count}: {
  query: string; selected: string[]; onQuery: (query: string) => void; onSelected: (tags: string[]) => void; count: number;
}) {
  const id = useId();
  return <section className="watch-filters" aria-label="Filtros de relógios">
    <div className="filter-search"><label htmlFor={`${id}-search`}>Buscar no catálogo</label><Input id={`${id}-search`} value={query} onChange={event => onQuery(event.target.value)} placeholder="Marca, modelo ou característica"/></div>
    <details className="filter-disclosure"><summary><SlidersHorizontal size={16}/>Filtrar características {selected.length > 0 && `(${selected.length})`}</summary>
      <p className="filter-hint">Cada seleção restringe os resultados. O relógio precisa ter todas as tags escolhidas.</p>
      <div className="filter-groups">{Object.entries(tagGroups).map(([group,tags]) => <fieldset key={group}><legend>{group}</legend><div className="tag-options">{tags.map(tag => <label key={tag} className="tag-option"><Checkbox checked={selected.includes(tag)} onCheckedChange={checked => onSelected(checked ? [...selected,tag] : selected.filter(item=>item!==tag))}/><span>{tag}</span></label>)}</div></fieldset>)}</div>
    </details>
    <div className="filter-status"><span role="status">{count} {count === 1 ? 'relógio encontrado' : 'relógios encontrados'}</span>{(selected.length > 0 || query) && <Button variant="ghost" onClick={()=>{onQuery('');onSelected([]);}}>Limpar filtros</Button>}</div>
  </section>;
}
