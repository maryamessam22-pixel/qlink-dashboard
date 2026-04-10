/**
 * Insert or update `public.seo` using `slug` as the natural key.
 * Use when the table has no surrogate `id` column (only slug + content columns).
 */
export async function upsertSeoBySlug(supabase, slug, payload) {
  const s = slug === undefined || slug === null ? '' : String(slug).trim();
  const { data, error: selErr } = await supabase.from('seo').select('slug').eq('slug', s).maybeSingle();
  if (selErr) throw selErr;

  const body = { ...payload, slug: s };
  Object.keys(body).forEach((k) => {
    if (body[k] === undefined) delete body[k];
  });

  if (data != null) {
    const { error } = await supabase.from('seo').update(body).eq('slug', s);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('seo').insert([body]);
    if (error) throw error;
  }
}
