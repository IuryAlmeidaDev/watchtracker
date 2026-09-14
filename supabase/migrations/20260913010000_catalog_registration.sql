ALTER TABLE public.watches ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.watches ADD COLUMN IF NOT EXISTS specifications jsonb;

CREATE OR REPLACE FUNCTION public.register_watch(payload jsonb, photos text[])
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE new_id uuid;
BEGIN
  IF NOT coalesce((auth.jwt()->'app_metadata'->>'catalog_admin')::boolean, false) THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;
  IF length(trim(payload->>'brand')) NOT BETWEEN 1 AND 120
    OR length(trim(payload->>'model')) NOT BETWEEN 1 AND 120
    OR coalesce(array_length(photos,1),0) NOT BETWEEN 1 AND 8
    OR EXISTS (SELECT 1 FROM unnest(photos) photo WHERE photo !~ '^https?://') THEN
    RAISE EXCEPTION 'Invalid watch data';
  END IF;
  INSERT INTO public.watches (brand,model,reference,price_estimate,specs,store_name,store_url,tags,specifications)
  VALUES (trim(payload->>'brand'),trim(payload->>'model'),payload->'specifications'->>'Referência',payload->>'priceEstimate',payload->>'specs',payload->>'storeName',payload->>'storeUrl',
    ARRAY(SELECT jsonb_array_elements_text(coalesce(payload->'tags','[]'::jsonb))),coalesce(payload->'specifications','{}'::jsonb)) RETURNING id INTO new_id;
  INSERT INTO public.watch_images (watch_id,image_url,display_order,is_cover)
    SELECT new_id,photo,ordinality-1,ordinality=1 FROM unnest(photos) WITH ORDINALITY AS image(photo,ordinality);
  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.register_watch(jsonb,text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_watch(jsonb,text[]) TO authenticated;

CREATE POLICY "catalog_admin_insert_watches" ON public.watches FOR INSERT TO authenticated
  WITH CHECK (coalesce((auth.jwt()->'app_metadata'->>'catalog_admin')::boolean,false));
CREATE POLICY "catalog_admin_insert_images" ON public.watch_images FOR INSERT TO authenticated
  WITH CHECK (coalesce((auth.jwt()->'app_metadata'->>'catalog_admin')::boolean,false));
CREATE POLICY "catalog_admin_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='watch-photos' AND (storage.foldername(name))[1]=auth.uid()::text AND coalesce((auth.jwt()->'app_metadata'->>'catalog_admin')::boolean,false));
CREATE POLICY "catalog_admin_upload_cleanup" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='watch-photos' AND (storage.foldername(name))[1]=auth.uid()::text AND coalesce((auth.jwt()->'app_metadata'->>'catalog_admin')::boolean,false));
