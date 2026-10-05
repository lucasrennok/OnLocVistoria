import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  initialQuality: 0.8
};

/** Comprime a imagem no navegador antes do upload (mitiga o risco de esgotar o disco da VPS). */
export async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, options);
  } catch {
    return file;
  }
}
