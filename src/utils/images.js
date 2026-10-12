// Utilitário de compressão de imagens: redimensiona e converte para base64 (JPEG)
// Usado em main.js (handle_cover_upload); configurações vêm de constants.js
import { IMAGE_FORMAT, IMAGE_QUALITY, MAX_IMAGE_SIZE } from "../constants.js";

// Redimensiona e comprime imagem para JPEG (reduz tamanho antes do upload)
export function compress_image(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max_size = MAX_IMAGE_SIZE; // Maior dimensão permitida
        let width = img.width;
        let height = img.height;

        // Redimensiona proporcionalmente mantendo a maior dimensão no limite
        if (width > height) {
          if (width > max_size) {
            height = (height * max_size) / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width = (width * max_size) / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Comprime como JPEG com qualidade 0.7
        const data_url = canvas.toDataURL(IMAGE_FORMAT, IMAGE_QUALITY);
        resolve(data_url);
      };
      img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}
