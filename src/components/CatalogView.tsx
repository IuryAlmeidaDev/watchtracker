import { Plus, Check, Heart } from 'lucide-react';
import { useExpansionStore } from '../store/appearanceStore';
import { Button } from './ui/button';
import { useState } from 'react';
import { WatchFilters } from './WatchFilters';
import { WatchEmptyState } from './WatchEmptyState';
import { filterWatches, watchTags, tagGroups } from '../lib/watch-tags';
import { WatchRegistration } from './WatchRegistration';
import { registerWatch } from '../lib/register-watch';
import { useAuthStore } from '../store/authStore';
import { useCatalogStore } from '../store/catalogStore';
import { WatchExpandablePhoto } from './WatchExpandablePhoto';
import type { WatchItem } from '../store/catalogStore';

interface CatalogViewProps {
  watches: WatchItem[];
  rankingIds: string[];
  collectionIds: string[];
  onAddToRanking: (id: string) => void;
  onAddToCollection: (id: string) => void;
  onRequireAuth: () => void;
  isAuthenticated: boolean;
}

export function CatalogView({
  watches,
  rankingIds,
  collectionIds,
  onAddToRanking,
  onAddToCollection,
  onRequireAuth,
  isAuthenticated,
}: CatalogViewProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = filterWatches(watches, query, selected);
  const standardTags: readonly string[] = Object.values(tagGroups).flat();
  const customTags = [...new Set(watches.flatMap(watchTags).filter(tag=>!standardTags.includes(tag)))];
  const user = useAuthStore(state=>state.user);
  const loadData = useCatalogStore(state=>state.loadData);
  const [saved,setSaved] = useState(false);
  const [authPending, setAuthPending] = useState(false);
  const requireAuth = () => {
    setAuthPending(true);
    useExpansionStore.getState().setActive(null);
  };
  return (
    <>
    {user?.app_metadata.catalog_admin && <div className="catalog-create"><WatchRegistration onSave={async draft=>{await registerWatch(draft);await loadData(user.id);setQuery('');setSelected([]);setSaved(true);}}/></div>}
    {saved && <p role="status" className="filter-hint">Relógio cadastrado no catálogo.</p>}
    <WatchFilters query={query} selected={selected} onQuery={setQuery} onSelected={setSelected} count={filtered.length} customTags={customTags}/>
    <div className="catalog-grid">
      {filtered.map((watch) => {
        const inRanking = rankingIds.includes(watch.id);
        const inCollection = collectionIds.includes(watch.id);

        return (
          <article key={watch.id} className="catalog-card">
            <WatchExpandablePhoto watch={watch} onClosed={() => {
              if (authPending) {
                setAuthPending(false);
                // Let the product dialog restore focus before opening authentication.
                requestAnimationFrame(onRequireAuth);
              }
            }}>
              <div className="catalog-actions">
                <Button
                  type="button"
                  variant={inRanking ? 'secondary' : 'outline'} className="h-11"
                  onClick={() => (isAuthenticated ? onAddToRanking(watch.id) : requireAuth())}
                  disabled={inRanking}
                >
                  {inRanking ? <Check data-icon="inline-start" /> : <Heart data-icon="inline-start" />}
                  {inRanking ? 'No Ranking' : 'Ranking'}
                </Button>

                <Button
                  type="button"
                  variant={inCollection ? 'secondary' : 'outline'} className="h-11"
                  onClick={() => (isAuthenticated ? onAddToCollection(watch.id) : requireAuth())}
                  disabled={inCollection}
                >
                  {inCollection ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
                  {inCollection ? 'Na Coleção' : 'Coleção'}
                </Button>

              </div>
            </WatchExpandablePhoto>
          </article>
        );
      })}
    </div>
    {!filtered.length && <WatchEmptyState title="Nenhum relógio com essa combinação" description="Remova uma característica ou ajuste a busca para ampliar os resultados." action="Limpar filtros" onAction={()=>{setQuery('');setSelected([]);}}/>}
    </>
  );
}
