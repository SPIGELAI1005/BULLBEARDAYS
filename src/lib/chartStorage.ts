import { supabase } from "@/integrations/supabase/client";

/**
 * Upload chart image to private storage
 * Returns the storage path (not a public URL)
 */
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

    // Generate unique filename with user folder
    const filename = `${userId}/${analysisId || Date.now()}.png`;

    // Upload to private storage
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

    // Return path only (not public URL)
    return data.path;
  } catch (error) {
    console.error("Failed to upload chart image:", error);
    return null;
  }
};

/**
 * Get a signed URL for a chart image
 * Signed URLs expire after the specified time (default 1 hour)
 */
export const getChartImageUrl = async (
  path: string,
  expiresIn: number = 3600 // 1 hour in seconds
): Promise<string | null> => {
  try {
    if (!path) return null;

    const { data, error } = await supabase.storage
      .from("chart-images")
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Get signed URL error:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Failed to get chart image URL:", error);
    return null;
  }
};

/**
 * Delete a chart image from storage
 */
export const deleteChartImage = async (path: string): Promise<boolean> => {
  try {
    if (!path) return false;

    // If path is a full URL, extract the path
    let filePath = path;
    if (path.includes("/chart-images/")) {
      const urlParts = path.split("/chart-images/");
      filePath = urlParts[1];
    }

    const { error } = await supabase.storage
      .from("chart-images")
      .remove([filePath]);

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

/**
 * Get public URL for a chart image (DEPRECATED - use getChartImageUrl instead)
 * This function is kept for backward compatibility but should not be used
 * for new code as it returns public URLs for private storage.
 */
export const getPublicChartImageUrl = (path: string): string => {
  const { data } = supabase.storage.from("chart-images").getPublicUrl(path);
  return data.publicUrl;
};
