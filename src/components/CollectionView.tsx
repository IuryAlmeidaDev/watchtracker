import { Trash2, ArrowUpRight } from 'lucide-react';
import { WatchExpandablePhoto } from './WatchExpandablePhoto';
import type { WatchItem } from '../store/catalogStore';

interface CollectionViewProps {
  collectionWatches: WatchItem[];
  onRemove: (id: string) => void;
  onExploreCatalog: () => void;
}

export function CollectionView({ collectionWatches, onRemove, onExploreCatalog }: CollectionViewProps) {
  if (collectionWatches.length === 0) {
    return (
      <div className="empty-collection">
        <p>Sua coleção pessoal ainda não possui relógios adicionados.</p>
        <button type="button" className="btn-explore" onClick={onExploreCatalog}>
          Explorar Catálogo e Adicionar
        </button>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {collectionWatches.map((watch) => (
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
              <button
                type="button"
                className="action-btn remove"
                onClick={() => onRemove(watch.id)}
              >
                <Trash2 size={14} /> Remover da Coleção
              </button>

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
      ))}
    </div>
  );
}
