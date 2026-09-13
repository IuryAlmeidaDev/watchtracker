import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import type { WatchItem } from '../store/catalogStore';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Field, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { tagGroups } from '../lib/watch-tags';

export type WatchDraft = Omit<WatchItem, 'id' | 'images'> & { imageUrls: string[]; files: File[] };
export function WatchRegistration({ onSave }: { onSave: (draft: WatchDraft) => Promise<void> }) {
  const [open,setOpen] = useState(false);
  const [tags,setTags] = useState<string[]>([]);
  const [files,setFiles] = useState<File[]>([]);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setError('');
    const data=new FormData(event.currentTarget);
    const value=(key:string)=>String(data.get(key)??'').trim();
    const imageUrls=value('imageUrls').split('\n').map(s=>s.trim()).filter(Boolean);
    if (imageUrls.some(url=>!/^https?:\/\//i.test(url))) {setError('Use links completos http ou https para as fotos.');return;}
    if (files.length+imageUrls.length>8) {setError('Escolha até 8 fotos por relógio.');return;}
    if (!files.length&&!imageUrls.length) {setError('Adicione pelo menos uma foto.');return;}
    const minimum=Number(value('priceMin')), maximum=Number(value('priceMax')||minimum);
    if(maximum<minimum){setError('O preço máximo deve ser maior ou igual ao mínimo.');return;}
    const specifications:Record<string,string>={};
    for(const name of ['Referência','Movimento','Diâmetro (mm)','Espessura (mm)','Entre asas (mm)','Resistência à água','Material da caixa','Pulseira','Vidro']) if(value(name)) specifications[name]=value(name);
    setBusy(true);
    try {
      await onSave({brand:value('brand'),model:value('model'),priceEstimate:minimum===maximum?`≈ R$ ${minimum}`:`R$ ${minimum}–R$ ${maximum}`,specs:value('specs'),storeName:value('storeName')||null,storeUrl:value('storeUrl')||null,tags:[...new Set([...tags,...value('customTags').split(',').map(s=>s.trim()).filter(Boolean)])],specifications,imageUrls,files});
      setOpen(false);setTags([]);setFiles([]);
    } catch {setError('Não foi possível salvar o relógio. Seus dados foram mantidos; tente novamente.');}
    finally {setBusy(false);}
  }
  return <Dialog open={open} onOpenChange={value=>{if(!busy)setOpen(value);}}>
    <DialogTrigger render={<Button className="h-11"/>}><Plus data-icon="inline-start"/>Cadastrar relógio</DialogTrigger>
    <DialogContent className="registration-dialog" showCloseButton={!busy}>
      <DialogHeader><DialogTitle>Cadastrar relógio</DialogTitle><DialogDescription>Preencha os dados conhecidos. A primeira foto será a capa.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="registration-form">
        <fieldset disabled={busy}><FieldGroup>
          <div className="registration-columns">{[['brand','Marca'],['model','Modelo']].map(([name,label])=><Field key={name}><FieldLabel htmlFor={`new-${name}`}>{label} *</FieldLabel><Input id={`new-${name}`} name={name} required maxLength={120}/></Field>)}</div>
          <div className="registration-columns">{[['priceMin','Preço médio ou mínimo (R$)'],['priceMax','Preço máximo (opcional)']].map(([name,label])=><Field key={name}><FieldLabel htmlFor={`new-${name}`}>{label}</FieldLabel><Input id={`new-${name}`} name={name} type="number" min="0" step="0.01" required={name==='priceMin'}/></Field>)}</div>
          <Field><FieldLabel htmlFor="new-specs">Descrição e informações *</FieldLabel><Textarea id="new-specs" name="specs" required maxLength={5000}/></Field>
          <div className="registration-columns">{['Referência','Movimento','Diâmetro (mm)','Espessura (mm)','Entre asas (mm)','Resistência à água','Material da caixa','Pulseira','Vidro'].map((label,index)=><Field key={label}><FieldLabel htmlFor={`spec-${index}`}>{label}</FieldLabel><Input id={`spec-${index}`} name={label} maxLength={160}/></Field>)}</div>
          <Field><FieldLabel htmlFor="new-photos">Enviar fotos (JPEG, PNG ou WebP, até 5 MB cada)</FieldLabel><Input id="new-photos" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event=>{
            const incoming=Array.from(event.target.files??[]);
            if(incoming.some(file=>file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))){setError('Use JPEG, PNG ou WebP de até 5 MB.');return;}
            setFiles(current=>[...current,...incoming].slice(0,8));setError('');event.target.value='';
          }}/></Field>
          <ul className="selected-files">{files.map((file,index)=><li key={`${file.name}-${index}`}><span>{index+1}. {file.name}</span><Button type="button" variant="ghost" size="icon" aria-label={`Remover foto ${index+1}`} onClick={()=>setFiles(current=>current.filter((_,i)=>i!==index))}><X/></Button></li>)}</ul>
          <Field><FieldLabel htmlFor="new-imageUrls">Ou links de fotos (um por linha)</FieldLabel><Textarea id="new-imageUrls" name="imageUrls" placeholder="https://..."/></Field>
          <div className="registration-columns"><Field><FieldLabel htmlFor="new-store">Loja</FieldLabel><Input id="new-store" name="storeName"/></Field><Field><FieldLabel htmlFor="new-link">Link do anúncio</FieldLabel><Input id="new-link" name="storeUrl" type="url" pattern="https?://.*"/></Field></div>
          <div className="filter-groups">{Object.entries(tagGroups).map(([group,options])=><fieldset key={group}><legend>{group}</legend><div className="tag-options">{options.map(tag=><label className="tag-option" key={tag}><Checkbox checked={tags.includes(tag)} onCheckedChange={checked=>setTags(current=>checked?[...current,tag]:current.filter(t=>t!==tag))}/>{tag}</label>)}</div></fieldset>)}</div>
          <Field><FieldLabel htmlFor="new-tags">Outras tags, separadas por vírgula</FieldLabel><Input id="new-tags" name="customTags" maxLength={500}/></Field>
        </FieldGroup></fieldset>
        {error&&<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="registration-actions"><Button type="button" variant="ghost" disabled={busy} onClick={()=>setOpen(false)}>Cancelar</Button><Button type="submit" disabled={busy} className="h-11">{busy&&<Loader2 className="animate-spin" data-icon="inline-start"/>}{busy?'Salvando…':'Salvar relógio'}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
