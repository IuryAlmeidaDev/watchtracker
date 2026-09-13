import { ArrowUpRight, Plus, Check, Heart } from 'lucide-react';
import { Button } from './ui/button';
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
  return (
    <div className="catalog-grid">
      {watches.map((watch) => {
        const inRanking = rankingIds.includes(watch.id);
        const inCollection = collectionIds.includes(watch.id);

        return (
          <article key={watch.id} className="catalog-card">
            <WatchExpandablePhoto watch={watch}/>

            <div className="catalog-content">
              <div className="brand-line">
                <span className="brand">{watch.brand}</span>
                <span className="catalog-price">{watch.priceEstimate}</span>
              </div>

              <h3 className="catalog-model">{watch.model}</h3>
              <p className="catalog-specs">{watch.specs}</p>

              <div className="catalog-actions">
                <Button
                  type="button"
                  variant={inRanking ? 'secondary' : 'outline'} className="h-11"
                  onClick={() => (isAuthenticated ? onAddToRanking(watch.id) : onRequireAuth())}
                  disabled={inRanking}
                >
                  {inRanking ? <Check data-icon="inline-start" /> : <Heart data-icon="inline-start" />}
                  {inRanking ? 'No Ranking' : 'Ranking'}
                </Button>

                <Button
                  type="button"
                  variant={inCollection ? 'secondary' : 'outline'} className="h-11"
                  onClick={() => (isAuthenticated ? onAddToCollection(watch.id) : onRequireAuth())}
                  disabled={inCollection}
                >
                  {inCollection ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
                  {inCollection ? 'Na Coleção' : 'Coleção'}
                </Button>

                {watch.storeUrl && (
                  <a
                    href={watch.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="catalog-link"
                  >
                    Ver Loja <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
