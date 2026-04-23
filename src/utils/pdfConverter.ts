import * as pdfjsLib from 'pdfjs-dist';

// Use the local worker bundled with the package via a URL import
// This avoids CDN version mismatch issues
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

/**
 * Converts the first page of a PDF file to a PNG Blob.
 * Rendered at 2.5x scale (~225 DPI) for good OMR scan accuracy.
 */
export const convertPdfToImage = async (file: File): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2.5 });

    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context not available.');

    await page.render({ canvasContext: context, viewport }).promise;

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Failed to convert PDF page to image.')),
            'image/png'
        );
    });
};
