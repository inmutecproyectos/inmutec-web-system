import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://qcnsrlsolmhbsxlpqqpc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FyMlliBs90ovG0l0vsgQaQ_oo58aTWN";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Obtener todos los textos del CMS
export async function getCmsContent() {
  const { data, error } = await supabase.from("cms_content").select("*");
  if (error) {
    console.error("Error al obtener textos CMS:", error);
    return {};
  }
  const contentMap = {};
  data.forEach(item => {
    contentMap[item.clave] = item.valor;
  });
  return contentMap;
}

// 2. Actualizar un texto específico en la base de datos
export async function updateCmsContent(clave, nuevoValor) {
  const { data, error } = await supabase
    .from("cms_content")
    .update({ valor: nuevoValor, updated_at: new Date().toISOString() })
    .eq("clave", clave);

  if (error) {
    console.error(`Error actualizando ${clave}:`, error);
    return false;
  }
  return true;
}

// 3. Subir imagen a Supabase Storage (Bucket: inmutec-media)
export async function uploadImage(file, folder = "general") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("inmutec-media")
    .upload(fileName, file, { cacheControl: "3600", upsert: true });

  if (error) {
    console.error("Error al subir imagen a Storage:", error);
    throw error;
  }

  // Obtener la URL pública permanente
  const { data: publicUrlData } = supabase.storage
    .from("inmutec-media")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}