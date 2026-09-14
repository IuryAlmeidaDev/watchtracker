import { supabase } from './supabase';
import type { WatchDraft } from '../components/WatchRegistration';

export async function registerWatch(draft: WatchDraft) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.app_metadata.catalog_admin) throw new Error('Administrator required');
  const uploaded: string[] = [];
  try {
    const photos: string[] = [];
    for (const file of draft.files) {
      const extension = ({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'} as Record<string,string>)[file.type];
      if (!extension || file.size>5*1024*1024) throw new Error('Invalid file');
      const path=`${user.id}/${crypto.randomUUID()}.${extension}`;
      const {error}=await supabase.storage.from('watch-photos').upload(path,file,{contentType:file.type,upsert:false});
      if(error)throw error;
      uploaded.push(path);
      photos.push(supabase.storage.from('watch-photos').getPublicUrl(path).data.publicUrl);
    }
    photos.push(...draft.imageUrls);
    const {files: _files,imageUrls: _urls,...payload}=draft;
    const {error}=await supabase.rpc('register_watch',{payload,photos});
    if(error)throw error;
  } catch(error) {
    if(uploaded.length) await supabase.storage.from('watch-photos').remove(uploaded);
    throw error;
  }
}
