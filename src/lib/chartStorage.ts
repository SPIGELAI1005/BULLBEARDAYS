import { supabase } from "@/integrations/supabase/client";

export const uploadChartImage = async (
  base64Image: string,
  userId: string,
  analysisId?: string
): Promise<string | null> => {
  try {
    // Convert base64 to blob
    const base64Data = base64Image.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    // Generate unique filename
    const filename = `${userId}/${analysisId || Date.now()}.png`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from("chart-images")
      .upload(filename, blob, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("chart-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Failed to upload chart image:", error);
    return null;
  }
};

export const deleteChartImage = async (url: string): Promise<boolean> => {
  try {
    // Extract path from URL
    const urlParts = url.split("/chart-images/");
    if (urlParts.length !== 2) return false;

    const path = urlParts[1];

    const { error } = await supabase.storage
      .from("chart-images")
      .remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to delete chart image:", error);
    return false;
  }
};

export const getChartImageUrl = (path: string): string => {
  const { data } = supabase.storage.from("chart-images").getPublicUrl(path);
  return data.publicUrl;
};