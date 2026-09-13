# WatchTracker

Site React + TypeScript + Vite, Tailwind CSS, Lucide, Zustand persist e dnd-kit. Sem backend.

## Rodar

```sh
npm install
npm run dev
```

No PowerShell com scripts bloqueados, use `npm.cmd` no lugar de `npm`.

## Editar o catálogo

Edite `src/data/watches.ts`. Cada relógio precisa de um `id` único e estável. Novos ids entram ao final do ranking salvo. Modelos removidos desaparecem; alterações de textos, fotos e preços são refletidas sem limpar o armazenamento.

- Preço aproximado: `preco: 125`.
- Faixa: `preco: { min: 100, max: 150 }`.
- Foto: coloque em `public/watches/modelo.jpg` e acrescente `imagem: '/watches/modelo.jpg'`.
- Anúncio: acrescente `url: 'https://...'`. Somente HTTP/HTTPS vira link.

Os preços são os valores informados pelo usuário, apresentados como estimativas; não foram pesquisados como médias de mercado e não incluem impostos dos anúncios. O catálogo começou com oito modelos e recebeu Sea-Gull 1963 e Tandorio VH31 39mm. MY-H3-C e Tandorio VH31 já têm fotos locais e links diretos dos anúncios. As demais imagens e URLs aguardam os anúncios. Imagens ausentes ou indisponíveis exibem um placeholder explícito. As fontes das fotos estão em `public/watches/SOURCES.md`.

## Vercel

Importe o repositório na Vercel, selecione Vite, comando de build `npm run build` e diretório de saída `dist`. Também é possível publicar pelo CLI da Vercel a partir desta pasta. Nenhuma variável de ambiente é necessária.

## Validar

```sh
npm run build
npx playwright install chromium
npm test
```

O ranking é salvo somente neste navegador/origem. Não há sincronização entre aparelhos. Fotos devem ser arquivos que você tenha autorização para usar.

Referências: [Zustand persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist), [dnd-kit Sortable](https://dndkit.com/legacy/presets/sortable/overview/).
