import { supabase } from "@/integrations/supabase/client";

export type VtonStatus = "starting" | "processing" | "succeeded" | "failed";

export interface VtonResult {
  status: VtonStatus;
  output?: string;
  error?: string;
  id?: string;
}

export async function startTryOn(
  humanImg: string,
  garmImg: string,
  category: string
): Promise<VtonResult> {
  const { data, error } = await supabase.functions.invoke("vton", {
    body: { human_img: humanImg, garm_img: garmImg, category },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function checkStatus(id: string): Promise<VtonResult> {
  const { data, error } = await supabase.functions.invoke("vton-status", {
    body: { id },
  });

  if (error) throw new Error(error.message);
  return data;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
