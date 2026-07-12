import { pipeline, env, RawImage } from '@huggingface/transformers';

// Configure environment for sandbox environment
env.allowLocalModels = false;
env.useBrowserCache = true; // Use browser cache to speed up subsequent loads!

let depthPipeline = null;

export class DepthProcessor {
  /**
   * Estimates depth from an image using the Depth-Anything model.
   * @param {string} imageUrl Data URL or image source.
   * @param {function} onProgress Callback for loading progress.
   */
  static async estimateDepth(imageUrl, onProgress) {
    if (!depthPipeline) {
      depthPipeline = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-small', {
        device: 'webgpu', // Fallback to WebGL/CPU is handled internally by ONNX
        progress_callback: (info) => {
          if (info.status === 'progress' && info.progress) {
            onProgress(info.progress);
          }
        }
      });
    }

    const image = await RawImage.fromURL(imageUrl);
    const output = await depthPipeline(image);
    
    return {
      data: output.depth.data, // grayscale values [0-255]
      width: output.depth.width,
      height: output.depth.height
    };
  }

  /**
   * Instantly estimates depth using pixel luminance (brightness).
   * @param {string} imageUrl Data URL or image source.
   * @returns {Promise<{data: Uint8Array, width: number, height: number}>}
   */
  static estimateLuminanceDepth(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = Math.min(img.width, 256);
        const height = Math.min(img.height, 256);
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const pixels = imgData.data;
        const depthData = new Uint8Array(width * height);

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Classic luminance conversion formula
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          depthData[i / 4] = Math.round(luminance);
        }

        resolve({
          data: depthData,
          width,
          height
        });
      };
      img.onerror = (e) => reject(e);
    });
  }
}
