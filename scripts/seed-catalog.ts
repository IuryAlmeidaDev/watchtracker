import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { watches as existingWatches } from '../src/data/watches';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERRO: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados no arquivo .env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

async function seed() {
  console.log('--- Iniciando Seed do Catálogo no Supabase ---');

  for (const item of existingWatches) {
    const priceEstimate = typeof item.preco === 'number' 
      ? `≈ R$ ${item.preco}` 
      : `R$ ${item.preco.min} - R$ ${item.preco.max}`;

    const { data: watch, error: watchError } = await supabase
      .from('watches')
      .upsert({
        brand: item.marca,
        model: item.nome,
        price_estimate: priceEstimate,
        specs: item.especificacoes,
        store_name: item.loja,
        store_url: item.url ?? null,
      }, { onConflict: 'brand,model' })
      .select('id')
      .single();

    if (watchError) {
      console.error(`Erro ao inserir relógio ${item.marca} ${item.nome}:`, watchError.message);
      continue;
    }

    console.log(`Relógio registrado: ${item.marca} ${item.nome} (${watch.id})`);

    // Upload de imagens caso existam localmente em public/
    if (item.imagem && item.imagem.startsWith('/watches/')) {
      const baseName = path.basename(item.imagem, path.extname(item.imagem));
      const watchDir = path.join(process.cwd(), 'public', 'watches');
      const allFiles = fs.readdirSync(watchDir);
      const matchingFiles = allFiles
        .filter((file) => file.startsWith(baseName))
        .sort((a, b) => a.localeCompare(b));

      for (let i = 0; i < matchingFiles.length; i++) {
        const fileName = matchingFiles[i];
        const localImagePath = path.join(watchDir, fileName);
        const fileBuffer = fs.readFileSync(localImagePath);
        const storagePath = `watches/${watch.id}/${fileName}`;
        const contentType = getContentType(fileName);

        const { error: uploadError } = await supabase.storage
          .from('watch-photos')
          .upload(storagePath, fileBuffer, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Erro no upload da foto ${fileName}:`, uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('watch-photos')
            .getPublicUrl(storagePath);

          await supabase.from('watch_images').upsert({
            watch_id: watch.id,
            image_url: publicUrlData.publicUrl,
            display_order: i,
            is_cover: i === 0,
          }, { onConflict: 'watch_id,image_url' });

          console.log(`Foto enviada (${i + 1}/${matchingFiles.length}): ${publicUrlData.publicUrl}`);
        }
      }
    }
  }

  console.log('--- Seed concluído com sucesso! ---');
}

seed().catch(err => {
  console.error('Falha inesperada no script de seed:', err);
  process.exit(1);
});
