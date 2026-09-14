import { Trash2, ArrowUpRight } from 'lucide-react';
import { WatchExpandablePhoto } from './WatchExpandablePhoto';
import { WatchEmptyState } from './WatchEmptyState';
import { Button } from './ui/button';
import type { WatchItem } from '../store/catalogStore';

interface CollectionViewProps {
  collectionWatches: WatchItem[];
  onRemove: (id: string) => void;
  onExploreCatalog: () => void;
}

export function CollectionView({ collectionWatches, onRemove, onExploreCatalog }: CollectionViewProps) {
  if (collectionWatches.length === 0) {
    return (
      <WatchEmptyState title="Sua coleção começa aqui" description="Sua coleção pessoal ainda não possui relógios adicionados." action="Explorar Catálogo e Adicionar" onAction={onExploreCatalog}/>
    );
  }

  return (
    <div className="catalog-grid">
      {collectionWatches.map((watch) => (
        <article key={watch.id} className="catalog-card">
            <WatchExpandablePhoto watch={watch}>
              <div className="catalog-actions">
              <Button
                type="button"
                variant="outline" className="h-11"
                onClick={() => onRemove(watch.id)}
              >
                <Trash2 data-icon="inline-start" /> Remover da Coleção
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
          </WatchExpandablePhoto>
        </article>
      ))}
    </div>
  );
}
