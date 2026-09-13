import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Check,
  GripVertical,
  Watch as WatchIcon,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Images,
} from 'lucide-react';

import { useAuthStore } from './store/authStore';
import { useCatalogStore, type WatchItem } from './store/catalogStore';
import { AuthModal } from './components/AuthModal';
import { CatalogView } from './components/CatalogView';
import { CollectionView } from './components/CollectionView';
import { WatchPhoto } from './components/WatchPhoto';
import { WatchDetails } from './components/WatchDetails';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './components/ui/collapsible';
import { Badge } from './components/ui/badge';
import { getWatchDetails } from './lib/watch-details';
import { cn } from './lib/utils';

function WatchRankingCard({
  watch,
  index,
  count,
  onMove,
  onMoveToCollection,
  onRemove,
}: {
  watch: WatchItem;
  index: number;
  count: number;
  onMove: (delta: number) => void;
  onMoveToCollection: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: watch.id,
  });
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { images } = getWatchDetails(watch);
  function close() { setOpen(false); triggerRef.current?.focus({ preventScroll: true }); }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('watch-row', 'expandable-watch', isDragging && 'dragging', open && 'is-open')}
      data-watch-id={watch.id}
    >
      <Collapsible open={open} onOpenChange={setOpen} onKeyDown={event => { if (event.key === 'Escape' && open && !isDragging) { event.stopPropagation(); close(); } }}>
      <div className="watch-summary">
      <div className="rank">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <button
          className="drag-handle"
          {...attributes}
          {...listeners}
          aria-label={`Arrastar ${watch.model}`}
        >
          <GripVertical size={20} />
        </button>
      </div>

      <CollapsibleTrigger ref={triggerRef} className={cn('watch-photo', 'watch-photo-trigger', images.length > 0 && 'has-photo')} aria-label={`${open ? 'Recolher' : 'Expandir'} ${watch.model}`}>
        <WatchPhoto src={images[0]} alt={`${watch.brand} ${watch.model}`}/>
        {images.length > 1 && <span className="detail-photo-count"><Images size={12}/>{images.length}</span>}
      </CollapsibleTrigger>

      <div className="watch-info">
        <div className="brand-line">
          <span className="brand">{watch.brand}</span>
          {index === 0 && <Badge variant="secondary">Próxima compra</Badge>}
        </div>
        <h3><button type="button" className="watch-name-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>{watch.model}</button></h3>
        <p className="specs">{watch.specs}</p>
        <button type="button" className="watch-disclosure" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Recolher detalhes' : 'Conhecer o relógio'}<ChevronDown size={14}/></button>
        <div className="row-quick-actions">
          <button
            type="button"
            className="btn-quick-action"
            onClick={onMoveToCollection}
            title="Comprei! Mover para Minha Coleção"
          >
            <CheckCircle2 size={13} /> Comprei!
          </button>
          <button
            type="button"
            className="btn-quick-action remove"
            onClick={onRemove}
            title="Remover do ranking"
          >
            <Trash2 size={13} /> Remover
          </button>
        </div>
      </div>

      <div className="watch-value">
        <span className="price-label">Valor estimado</span>
        <p className="price">{watch.priceEstimate}</p>
        {watch.storeUrl ? (
          <a href={watch.storeUrl} target="_blank" rel="noopener noreferrer">
            Ver na {watch.storeName ?? 'loja'}
            <ArrowUpRight size={15} />
          </a>
        ) : (
          <span className="store-name">{watch.storeName ?? 'Loja'} · link em breve</span>
        )}
      </div>

      <div className="move-buttons">
        <button
          aria-label={`Subir ${watch.model}`}
          disabled={index === 0}
          onClick={() => onMove(-1)}
        >
          <ArrowUp size={16} />
        </button>
        <button
          aria-label={`Descer ${watch.model}`}
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        >
          <ArrowDown size={16} />
        </button>
      </div>
      </div>
      <CollapsibleContent className="watch-expansion"><WatchDetails watch={watch} onClose={close}/></CollapsibleContent>
      </Collapsible>
    </li>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'ranking' | 'collection' | 'catalog'>('ranking');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const { user, checkSession, signOut } = useAuthStore();
  const {
    watches,
    rankingIds,
    collectionIds,
    syncError,
    loadData,
    reorderRanking,
    addToRanking,
    removeFromRanking,
    addToCollection,
    removeFromCollection,
    moveToCollection,
  } = useCatalogStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    loadData(user?.id);
  }, [user?.id, loadData]);

  const orderedRanking = rankingIds
    .map((id) => watches.find((w) => w.id === id))
    .filter((w): w is WatchItem => Boolean(w));

  const collectionWatches = collectionIds
    .map((id) => watches.find((w) => w.id === id))
    .filter((w): w is WatchItem => Boolean(w));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleMoveWatch(activeId: string, overId: string) {
    reorderRanking(activeId, overId, user?.id);
    const watch = watches.find((w) => w.id === activeId);
    if (watch) {
      setAnnouncement(`${watch.model} movido para nova posição.`);
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      handleMoveWatch(String(active.id), String(over.id));
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="WatchTracker início">
          <WatchIcon size={25} strokeWidth={1.6} />
          <span>
            Watch<span className="wordmark-light">Tracker</span>
          </span>
        </a>

        <nav className="header-nav" aria-label="Navegação principal">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'ranking' ? 'active' : ''}`}
            aria-current={activeTab === 'ranking' ? 'page' : undefined}
            onClick={() => setActiveTab('ranking')}
          >
            Meu Ranking <span className="tab-badge">{orderedRanking.length}</span>
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'collection' ? 'active' : ''}`}
            aria-current={activeTab === 'collection' ? 'page' : undefined}
            onClick={() => setActiveTab('collection')}
          >
            Minha Coleção <span className="tab-badge">{collectionWatches.length}</span>
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'catalog' ? 'active' : ''}`}
            aria-current={activeTab === 'catalog' ? 'page' : undefined}
            onClick={() => setActiveTab('catalog')}
          >
            Explorar Catálogo
          </button>
        </nav>

        <div className="header-auth">
          {user ? (
            <div className="user-profile">
              <span className="user-email" title={user.email}>
                <UserIcon size={14} />
                <span className="email-truncate">{user.email}</span>
              </span>
              <button
                type="button"
                className="btn-signout"
                onClick={() => signOut()}
                aria-label="Sair da conta"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-signin"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      <main id="main">
        {activeTab === 'ranking' && (
          <>
            <section className="intro">
              <div>
                <h1>
                  A próxima escolha.<br />
                  <span>No seu tempo.</span>
                </h1>
                <p>
                  Os relógios que merecem um lugar na coleção.{' '}<br className="desktop-break" />
                  Organize os favoritos e escolha o próximo.
                </p>
              </div>
              <div className="collection-note">
                <span className="note-line" />
                <p>
                  O melhor relógio é aquele<br />
                  que faz sentido para você.
                </p>
              </div>
            </section>

            <section aria-labelledby="ranking-title" className="ranking-section">
              <div className="ranking-toolbar">
                <div className="ranking-title">
                  <h2 id="ranking-title">Minha seleção</h2>
                  <span className="count">{orderedRanking.length}</span>
                </div>
                <span className="saved-status">
                  <Check size={14} />
                  {user ? 'Sincronizado na nuvem' : 'Modo visitante (faça login para salvar)'}
                </span>
              </div>
              <div className="list-caption">
                <p>Clique em um relógio e explore os detalhes.</p>
                <span>Arraste pela alça para organizar</span>
              </div>

              {syncError && (
                <p role="alert" className="storage-alert">
                  Não foi possível salvar na nuvem. Verifique sua conexão.
                </p>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext items={rankingIds} strategy={verticalListSortingStrategy}>
                  <ol className="watch-list">
                    {orderedRanking.map((watch, index) => (
                      <WatchRankingCard
                        key={watch.id}
                        watch={watch}
                        index={index}
                        count={orderedRanking.length}
                        onMove={(delta) => {
                          const targetId = rankingIds[index + delta];
                          if (targetId) handleMoveWatch(watch.id, targetId);
                        }}
                        onMoveToCollection={() => moveToCollection(watch.id, user?.id)}
                        onRemove={() => removeFromRanking(watch.id, user?.id)}
                      />
                    ))}
                  </ol>
                </SortableContext>
              </DndContext>

              {!orderedRanking.length && (
                <div className="empty-state">
                  <p>Seu ranking está vazio.</p>
                  <button
                    type="button"
                    className="btn-explore"
                    onClick={() => setActiveTab('catalog')}
                  >
                    Navegar pelo Catálogo
                  </button>
                </div>
              )}
              <p className="sr-only" role="status">
                {announcement}
              </p>
            </section>
          </>
        )}

        {activeTab === 'collection' && (
          <section className="collection-section">
            <div className="ranking-toolbar">
              <div className="ranking-title">
                <h2>Minha Coleção</h2>
                <span className="count">{collectionWatches.length}</span>
              </div>
            </div>
            <CollectionView
              collectionWatches={collectionWatches}
              onRemove={(id) => removeFromCollection(id, user?.id)}
              onExploreCatalog={() => setActiveTab('catalog')}
            />
          </section>
        )}

        {activeTab === 'catalog' && (
          <section className="catalog-section">
            <div className="ranking-toolbar">
              <div className="ranking-title">
                <h2>Catálogo de Modelos</h2>
                <span className="count">{watches.length}</span>
              </div>
            </div>
            <CatalogView
              watches={watches}
              rankingIds={rankingIds}
              collectionIds={collectionIds}
              onAddToRanking={(id) => addToRanking(id, user?.id)}
              onAddToCollection={(id) => addToCollection(id, user?.id)}
              onRequireAuth={() => setIsAuthModalOpen(true)}
              isAuthenticated={Boolean(user)}
            />
          </section>
        )}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <footer>
        <span>
          <WatchIcon size={15} /> Escolher também faz parte da coleção.
        </span>
        <p>Valores aproximados, sujeitos a variação.</p>
      </footer>
    </div>
  );
}
