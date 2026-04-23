import jsQR from 'jsqr';

export interface ScanResult {
    testId: string;
    answers: Record<number, string>;
    confidence: number;
}

/**
 * Decodes an image source (File, Blob, or object URL) into an ImageBitmap.
 * Falls back to HTMLImageElement if createImageBitmap fails.
 */
const decodeImage = async (src: File | Blob | string): Promise<ImageBitmap | HTMLImageElement> => {
    try {
        const blob = typeof src === 'string' ? await fetch(src).then(r => r.blob()) : src;
        return await createImageBitmap(blob);
    } catch {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Could not decode image. Upload a clear JPG, PNG, or PDF.'));
            if (typeof src === 'string') {
                img.src = src;
            } else {
                const reader = new FileReader();
                reader.onload = e => { img.src = e.target?.result as string; };
                reader.onerror = () => reject(new Error('Failed to read file.'));
                reader.readAsDataURL(src);
            }
        });
    }
};

/** Renders to canvas (max 2500px) and returns ctx + dimensions */
const renderToCanvas = (bmp: ImageBitmap | HTMLImageElement) => {
    const MAX = 2500;
    let w = bmp.width, h = bmp.height;
    if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round((h / w) * MAX); w = MAX; }
        else { w = Math.round((w / h) * MAX); h = MAX; }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    if (!ctx) throw new Error('Canvas unavailable.');
    ctx.drawImage(bmp, 0, 0, w, h);
    return { canvas, ctx, w, h };
};

/**
 * Computes a "fill score" (0-1) for a bubble.
 * Samples only the inner circle to avoid counting the printed border.
 */
const bubbleFillScore = (
    data: Uint8ClampedArray,
    w: number,
    h: number,
    cx: number,
    cy: number,
    r: number
): number => {
    const innerR = Math.max(2, r *  0.75);
    const r2 = innerR * innerR;

    const x0 = Math.max(0, Math.floor(cx - innerR));
    const x1 = Math.min(w - 1, Math.ceil(cx + innerR));
    const y0 = Math.max(0, Math.floor(cy - innerR));
    const y1 = Math.min(h - 1, Math.ceil(cy + innerR));

    let dark = 0;
    let total = 0;

    for (let y = y0; y <= y1; y++) {
        const dy = y - cy;
        const dy2 = dy * dy;
        for (let x = x0; x <= x1; x++) {
            const dx = x - cx;
            if (dx * dx + dy2 > r2) continue;
            const idx = (y * w + x) * 4;
            const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            if (intensity < 140) dark++;
            total++;
        }
    }

    return total ? dark / total : 0;
};

const bubbleBestFillScore = (
    data: Uint8ClampedArray,
    w: number,
    h: number,
    cx: number,
    cy: number,
    r: number
): number => {
    const search = Math.max(2, Math.round(r * 0.35));
    let best = 0;

    for (let dy = -search; dy <= search; dy += 2) {
        for (let dx = -search; dx <= search; dx += 2) {
            const score = bubbleFillScore(data, w, h, cx + dx, cy + dy, r);
            if (score > best) best = score;
        }
    }

    return best;
};

const qrRotationAngle = (qr: any): number | null => {
    const loc = qr?.location;
    if (!loc?.topLeftCorner || !loc?.topRightCorner) return null;
    const dx = loc.topRightCorner.x - loc.topLeftCorner.x;
    const dy = loc.topRightCorner.y - loc.topLeftCorner.y;
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null;
    return Math.atan2(dy, dx);
};

const deskewByAngle = (srcCanvas: HTMLCanvasElement, angleRad: number) => {
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    if (!ctx) throw new Error('Canvas unavailable.');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angleRad);
    ctx.translate(-w / 2, -h / 2);
    ctx.drawImage(srcCanvas, 0, 0);

    return { canvas, ctx, w, h };
};

const qrBottomY = (qr: any): number | null => {
    const loc = qr?.location;
    const pts = [
        loc?.topLeftCorner,
        loc?.topRightCorner,
        loc?.bottomLeftCorner,
        loc?.bottomRightCorner,
    ].filter(Boolean);
    if (!pts.length) return null;
    const ys = pts.map((p: any) => p.y).filter((y: any) => Number.isFinite(y));
    if (!ys.length) return null;
    return Math.max(...ys);
};

type Point = { x: number; y: number };

const bilinearMap = (u: number, v: number, tl: Point, tr: Point, bl: Point, br: Point): Point => {
    const a = (1 - u) * (1 - v);
    const b = u * (1 - v);
    const c = (1 - u) * v;
    const d = u * v;
    return {
        x: tl.x * a + tr.x * b + bl.x * c + br.x * d,
        y: tl.y * a + tr.y * b + bl.y * c + br.y * d,
    };
};

const findCornerMarker = (
    data: Uint8ClampedArray,
    w: number,
    h: number,
    which: 'tl' | 'tr' | 'bl' | 'br'
): Point | null => {
    // Keep this tight to avoid confusing the QR code / header blocks with the corner markers.
    const rx = Math.floor(w * 0.14);
    const ry = Math.floor(h * 0.14);

    const region = (() => {
        const xPad = Math.floor(w * 0.02);
        const yPad = Math.floor(h * 0.02);
        if (which === 'tl') return { x0: xPad, y0: yPad, x1: rx, y1: ry };
        if (which === 'tr') return { x0: w - rx, y0: yPad, x1: w - xPad, y1: ry };
        if (which === 'bl') return { x0: xPad, y0: h - ry, x1: rx, y1: h - yPad };
        return { x0: w - rx, y0: h - ry, x1: w - xPad, y1: h - yPad };
    })();

    const win = Math.max(18, Math.round(Math.min(w, h) * 0.02)); // square marker ~ small
    const step = Math.max(4, Math.round(win / 4));

    const corner = (() => {
        if (which === 'tl') return { x: region.x0, y: region.y0 };
        if (which === 'tr') return { x: region.x1, y: region.y0 };
        if (which === 'bl') return { x: region.x0, y: region.y1 };
        return { x: region.x1, y: region.y1 };
    })();

    let best = { score: -1, x: 0, y: 0, raw: 0 };

    for (let y = region.y0; y <= region.y1 - win; y += step) {
        for (let x = region.x0; x <= region.x1 - win; x += step) {
            let dark = 0;
            let total = 0;
            for (let yy = 0; yy < win; yy += 2) {
                const rowBase = (y + yy) * w * 4;
                for (let xx = 0; xx < win; xx += 2) {
                    const idx = rowBase + (x + xx) * 4;
                    const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    if (intensity < 90) dark++;
                    total++;
                }
            }
            const score = total ? dark / total : 0;

            // Prefer patches closer to the corner to avoid picking the QR code as "top-right marker".
            const cx = x + win / 2;
            const cy = y + win / 2;
            const dist = Math.abs(cx - corner.x) + Math.abs(cy - corner.y);
            const distNorm = dist / (rx + ry + 1);
            const biased = score - distNorm * 0.35;

            if (biased > best.score) best = { score: biased, x, y, raw: score };
        }
    }

    if (best.raw < 0.20) return null; // marker not confidently found

    // Refine centroid of dark pixels within the best window
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    for (let yy = 0; yy < win; yy++) {
        const rowBase = (best.y + yy) * w * 4;
        for (let xx = 0; xx < win; xx++) {
            const idx = rowBase + (best.x + xx) * 4;
            const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            if (intensity < 90) {
                sumX += best.x + xx;
                sumY += best.y + yy;
                count++;
            }
        }
    }
    if (!count) return null;

    return { x: sumX / count, y: sumY / count };
};

const solveLinearSystem = (A: number[][], b: number[]): number[] | null => {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);

    for (let col = 0; col < n; col++) {
        // Pivot
        let pivot = col;
        for (let r = col + 1; r < n; r++) {
            if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
        }
        if (Math.abs(M[pivot][col]) < 1e-9) return null;
        if (pivot !== col) [M[pivot], M[col]] = [M[col], M[pivot]];

        // Normalize
        const div = M[col][col];
        for (let c = col; c <= n; c++) M[col][c] /= div;

        // Eliminate
        for (let r = 0; r < n; r++) {
            if (r === col) continue;
            const factor = M[r][col];
            if (factor === 0) continue;
            for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
        }
    }

    return M.map((row) => row[n]);
};

// Homography that maps 4 points "from" to 4 points "to"
// Returns H (length 9) with H[8] = 1, or null on failure.
const homographyFrom4Points = (from: Point[], to: Point[]): number[] | null => {
    if (from.length !== 4 || to.length !== 4) return null;

    const A: number[][] = [];
    const b: number[] = [];

    for (let i = 0; i < 4; i++) {
        const x = from[i].x;
        const y = from[i].y;
        const X = to[i].x;
        const Y = to[i].y;

        // h11*x + h12*y + h13 - h31*x*X - h32*y*X = X
        A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]);
        b.push(X);

        // h21*x + h22*y + h23 - h31*x*Y - h32*y*Y = Y
        A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]);
        b.push(Y);
    }

    const u = solveLinearSystem(A, b);
    if (!u) return null;

    return [u[0], u[1], u[2], u[3], u[4], u[5], u[6], u[7], 1];
};

const applyHomography = (H: number[], x: number, y: number): Point => {
    const denom = H[6] * x + H[7] * y + H[8];
    if (Math.abs(denom) < 1e-9) return { x: 0, y: 0 };
    return {
        x: (H[0] * x + H[1] * y + H[2]) / denom,
        y: (H[3] * x + H[4] * y + H[5]) / denom,
    };
};

const rectifyByCornerMarkers = (
    data: Uint8ClampedArray,
    w: number,
    h: number,
    tl: Point,
    tr: Point,
    bl: Point,
    br: Point
) => {
    // Normalize to an A4-ish aspect ratio (297/210 ≈ 1.414)
    const outW = 1200;
    const outH = Math.round(outW * 1.4142);

    // Map destination corners to source marker centers (dest -> src)
    const dst = [
        { x: 0, y: 0 },
        { x: outW - 1, y: 0 },
        { x: 0, y: outH - 1 },
        { x: outW - 1, y: outH - 1 },
    ];
    const src = [tl, tr, bl, br];

    const HdstToSrc = homographyFrom4Points(dst, src);
    if (!HdstToSrc) return null;

    const out = new Uint8ClampedArray(outW * outH * 4);

    for (let y = 0; y < outH; y++) {
        for (let x = 0; x < outW; x++) {
            const p = applyHomography(HdstToSrc, x, y);
            const sx = Math.round(p.x);
            const sy = Math.round(p.y);
            const di = (y * outW + x) * 4;

            if (sx < 0 || sx >= w || sy < 0 || sy >= h) {
                out[di] = 255;
                out[di + 1] = 255;
                out[di + 2] = 255;
                out[di + 3] = 255;
                continue;
            }

            const si = (sy * w + sx) * 4;
            out[di] = data[si];
            out[di + 1] = data[si + 1];
            out[di + 2] = data[si + 2];
            out[di + 3] = 255;
        }
    }

    return { data: out, w: outW, h: outH };
};

const bubbleContrastScore = (
    data: Uint8ClampedArray,
    w: number,
    h: number,
    cx: number,
    cy: number,
    r: number
): number => {
    const innerR = Math.max(2, r * 0.55);
    const ringR0 = Math.max(innerR + 1, r * 0.85);
    const ringR1 = Math.max(ringR0 + 1, r * 1.20);

    const x0 = Math.max(0, Math.floor(cx - ringR1));
    const x1 = Math.min(w - 1, Math.ceil(cx + ringR1));
    const y0 = Math.max(0, Math.floor(cy - ringR1));
    const y1 = Math.min(h - 1, Math.ceil(cy + ringR1));

    let innerSum = 0;
    let innerCount = 0;
    let ringSum = 0;
    let ringCount = 0;

    const innerR2 = innerR * innerR;
    const ringR02 = ringR0 * ringR0;
    const ringR12 = ringR1 * ringR1;

    for (let y = y0; y <= y1; y++) {
        const dy = y - cy;
        const dy2 = dy * dy;
        for (let x = x0; x <= x1; x++) {
            const dx = x - cx;
            const d2 = dx * dx + dy2;
            if (d2 > ringR12) continue;

            const idx = (y * w + x) * 4;
            const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            if (d2 <= innerR2) {
                innerSum += intensity;
                innerCount++;
            } else if (d2 >= ringR02 && d2 <= ringR12) {
                ringSum += intensity;
                ringCount++;
            }
        }
    }

    if (!innerCount || !ringCount) return 0;

    const innerMean = innerSum / innerCount;
    const ringMean = ringSum / ringCount;

    // Score is how much darker the inside is compared to its surrounding ring (0..1)
    const contrast = (ringMean - innerMean) / 255;

    // Slight boost for absolute darkness (helps with very light backgrounds)
    const darkness = (255 - innerMean) / 255;

    return Math.max(0, contrast * 0.85 + darkness * 0.15);
};

const bubbleMarkScore = (
    data: Uint8ClampedArray,
    w: number,
    h: number,
    cx: number,
    cy: number,
    r: number
): number => {
    const contrast = bubbleContrastScore(data, w, h, cx, cy, r);
    const fill = bubbleFillScore(data, w, h, cx, cy, r) * 0.9;
    return Math.max(contrast, fill);
};

const bubbleBestMarkScore = (
    data: Uint8ClampedArray,
    w: number,
    h: number,
    cx: number,
    cy: number,
    r: number
): number => {
    const d = Math.max(2, Math.round(r * 0.22));
    const candidates = [
        { x: cx, y: cy },
        { x: cx - d, y: cy },
        { x: cx + d, y: cy },
        { x: cx, y: cy - d },
        { x: cx, y: cy + d },
    ];

    let best = 0;
    for (const p of candidates) {
        const s = bubbleMarkScore(data, w, h, p.x, p.y, r);
        if (s > best) best = s;
    }
    return best;
};

const findBubbleRowCenters = (
    data: Uint8ClampedArray,
    w: number,
    h: number,
    expectedRows: number
): number[] => {
    if (!expectedRows || expectedRows < 1) return [];

    const x0 = Math.floor(w * 0.28);
    const x1 = Math.floor(w * 0.95);
    const y0 = Math.floor(h * 0.30);
    const y1 = Math.floor(h * 0.90);

    const profile = new Float32Array(h);

    for (let y = y0; y <= y1; y++) {
        let sum = 0;
        const rowBase = y * w * 4;
        for (let x = x0; x <= x1; x += 4) {
            const idx = rowBase + x * 4;
            const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            if (intensity < 200) sum++;
        }
        profile[y] = sum;
    }

    // Smooth (moving average)
    const smooth = new Float32Array(h);
    const win = 5;
    for (let y = y0; y <= y1; y++) {
        let s = 0;
        let c = 0;
        for (let k = -win; k <= win; k++) {
            const yy = y + k;
            if (yy < y0 || yy > y1) continue;
            s += profile[yy];
            c++;
        }
        smooth[y] = c ? s / c : profile[y];
    }

    const candidates: { y: number; prom: number }[] = [];
    const promWin = 18;

    for (let y = y0 + 2; y <= y1 - 2; y++) {
        const v = smooth[y];
        if (v <= smooth[y - 1] || v < smooth[y + 1]) continue;

        const left = smooth[Math.max(y0, y - promWin)];
        const right = smooth[Math.min(y1, y + promWin)];
        const prom = v - (left + right) / 2;
        if (prom > 2) candidates.push({ y, prom });
    }

    candidates.sort((a, b) => b.prom - a.prom);

    // Greedy pick with min distance
    const minDistBase = Math.max(10, Math.round(((y1 - y0) / expectedRows) * 0.55));

    const pickWithMinDist = (minDist: number) => {
        const chosen: number[] = [];
        for (const c of candidates) {
            if (chosen.length >= expectedRows) break;
            if (chosen.every((yy) => Math.abs(yy - c.y) >= minDist)) chosen.push(c.y);
        }
        chosen.sort((a, b) => a - b);
        return chosen;
    };

    let chosen = pickWithMinDist(minDistBase);
    if (chosen.length < expectedRows) chosen = pickWithMinDist(Math.max(6, Math.round(minDistBase * 0.7)));
    if (chosen.length < expectedRows) chosen = pickWithMinDist(6);

    if (chosen.length > expectedRows) chosen = chosen.slice(0, expectedRows);

    // If still short, fallback to evenly spaced between first/last
    if (chosen.length < expectedRows) {
        const lo = chosen[0] ?? Math.round(y0 + (y1 - y0) * 0.15);
        const hi = chosen[chosen.length - 1] ?? Math.round(y1 - (y1 - y0) * 0.15);
        const step = (hi - lo) / Math.max(1, expectedRows - 1);
        const out: number[] = [];
        for (let i = 0; i < expectedRows; i++) out.push(Math.round(lo + step * i));
        return out;
    }

    return chosen;
};

/**
 * Main OMR Scanner.
 *
 * PASS 1 (no testData): reads QR → returns testId
 * PASS 2 (with testData): reads QR + scans bubbles → returns answers
 *
 * Layout calibration (matches StudentOMRPrintPage.tsx):
 *  - A4 canvas ~1414×2000px after downscale (@2.5x PDF render)
 *  - Outer padding: ~10mm → ~5% each side
 *  - Header (logo+QR+student info blocks): occupies top ~38% of page
 *  - Bubble grid starts at ~38% from top, ends at ~92%
 *  - 4 columns, each column: [question label | A B C D bubbles]
 *  - Each bubble circle: 24px rendered → ~1.7% of width per bubble
 *  - Bubble options spaced evenly in ~55% of column width
 */
export const scanOMR = async (
    imageSource: File | Blob | string,
    testData?: any
): Promise<ScanResult> => {
    if (!imageSource) throw new Error('No image provided.');

    const bmp = await decodeImage(imageSource);
    const { canvas, ctx, w, h } = renderToCanvas(bmp);

    // ── 1. QR CODE ─────────────────────────────────────────────────────────
    const imgData = ctx.getImageData(0, 0, w, h);
    const qr = jsQR(imgData.data, w, h);
    if (!qr) {
        throw new Error(
            'QR Code not found. Make sure the QR box in the top-right corner is clearly visible and not blurry or cut off.'
        );
    }
    const testId = qr.data.startsWith('TEST_ID:') ? qr.data.slice(8).trim() : qr.data.trim();

    // Deskew using QR orientation (helps with rotated phone photos)
    let scanCtx = ctx;
    const angle = qrRotationAngle(qr);
    if (angle !== null && Math.abs(angle) > 0.015) {
        const deskewed = deskewByAngle(canvas, -angle);
        scanCtx = deskewed.ctx;
    }

    const scanImg = scanCtx.getImageData(0, 0, w, h);
    let scanWidth = w;
    let scanHeight = h;
    let scanData = scanImg.data;
    let isRectified = false;

    // For PDF scans/photos, corner markers help rectify perspective/cropping before bubble detection.
    const mTL = findCornerMarker(scanData, scanWidth, scanHeight, 'tl');
    const mTR = findCornerMarker(scanData, scanWidth, scanHeight, 'tr');
    const mBL = findCornerMarker(scanData, scanWidth, scanHeight, 'bl');
    const mBR = findCornerMarker(scanData, scanWidth, scanHeight, 'br');
    if (mTL && mTR && mBL && mBR) {
        const rect = rectifyByCornerMarkers(scanData, scanWidth, scanHeight, mTL, mTR, mBL, mBR);
        if (rect) {
            scanData = rect.data;
            scanWidth = rect.w;
            scanHeight = rect.h;
            isRectified = true;
        }
    }

    const detectedAnswers: Record<number, string> = {};
    let filledConfidenceSum = 0;
    let filledCount = 0;

    // ── 2. BUBBLE SCANNING ─────────────────────────────────────────────────
    if (testData?.omrTemplate?.sections) {
        const sections: any[] = testData.omrTemplate.sections;

        // ── Calibrated layout constants (derived from OMR print CSS) ──────
        // The printed OMR sheet has:
        //   - 10mm padding on all sides → ~5% left/right, ~3.5% top/bottom
        //   - Header+student-info block: from top-padding to ~38% of page height
        //   - Section label row: ~2% of height per section
        //   - Question grid starts after section label

        const COLS = 4; // grid-cols-4 in StudentOMRPrintPage

        const sectionRows = sections.map((sec: any) => {
            const qCount =
                sec.questionCount ||
                (sec.questionStartIndex && sec.questionEndIndex
                    ? Math.max(0, sec.questionEndIndex - sec.questionStartIndex + 1)
                    : 0);
            return { sec, rows: Math.ceil(qCount / COLS), qCount };
        });

        const expectedRows = sectionRows.reduce((sum: number, s: any) => sum + (s.rows || 0), 0);

        const qrOnDeskew = jsQR(scanData, scanWidth, scanHeight) || qr;
        const qrY = qrBottomY(qrOnDeskew);

        // ── Grid boundaries (% of canvas) ─────────────────────────────────
        // Left/right margins (5% each side for 10mm padding)
        const gridLeft   = scanWidth * (isRectified ? 0.06 : 0.07);
        const gridRight  = scanWidth * (isRectified ? 0.94 : 0.93);
        const gridWidth  = gridRight - gridLeft;

        const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
        const gridBottom = scanHeight * 0.92;

        // Column width with grid gap-x-8 (≈ 32px) taken into account
        const colGap = Math.max(12, scanWidth * 0.012);
        const colW = (gridWidth - colGap * (COLS - 1)) / COLS;

        // Within each column, the question label takes ~18% width,
        // then 4 bubbles occupy ~55% of column width.
        // Based on CSS: .flex items-center gap-2, w-6 h-6 bubbles
        // Bubble circle radius ≈ rowH * 0.28, min 5px
        const labelFrac = 0.42;   // leave room for question label + gap
        const bubblesStart = labelFrac;
        const bubblesEnd   = 0.96;
        const bubblesSpan  = bubblesEnd - bubblesStart;

        // Thresholds tuned to avoid false positives on unfilled bubbles
      const FILL_THRESH = 0.08;
const GAP_THRESH = 0.02;

        // Estimate row centers from the image itself (circle borders create strong peaks),
        // so question-to-row mapping stays correct even if the page is cropped/zoomed.
        const rowCenters = findBubbleRowCenters(scanData, scanWidth, scanHeight, expectedRows);

        const rowSpacing = (() => {
            if (!rowCenters.length) return 0;
            const diffs: number[] = [];
            for (let i = 1; i < rowCenters.length; i++) {
                const d = rowCenters[i] - rowCenters[i - 1];
                if (d > 4) diffs.push(d);
            }
            if (!diffs.length) return 0;
            diffs.sort((a, b) => a - b);
            return diffs[Math.floor(diffs.length / 2)];
        })();

        const nearestRowCenter = (targetY: number) => {
            if (!rowCenters.length) return targetY;
            let bestY = rowCenters[0];
            let bestDist = Math.abs(bestY - targetY);
            for (let i = 1; i < rowCenters.length; i++) {
                const dist = Math.abs(rowCenters[i] - targetY);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestY = rowCenters[i];
                }
            }
            return bestY;
        };

        const fallbackGridTop = qrY !== null
            ? clamp(qrY + scanHeight * 0.18, scanHeight * 0.18, scanHeight * 0.60)
            : scanHeight * 0.34;
        const fallbackRowH = (gridBottom - fallbackGridTop) / Math.max(1, expectedRows);

     const bubbleR = Math.max(8, Math.min(22, (rowSpacing || fallbackRowH) * 0.4));

        // If corner markers exist, use them to compensate perspective/keystone from phone photos.
        const tl = !isRectified ? findCornerMarker(scanData, scanWidth, scanHeight, 'tl') : null;
        const tr = !isRectified ? findCornerMarker(scanData, scanWidth, scanHeight, 'tr') : null;
        const bl = !isRectified ? findCornerMarker(scanData, scanWidth, scanHeight, 'bl') : null;
        const br = !isRectified ? findCornerMarker(scanData, scanWidth, scanHeight, 'br') : null;
        const hasMarkers = !isRectified && !!(tl && tr && bl && br);

        // Convert local template (u,v) within the marker rectangle to pixel coords (handles perspective)
        const toXY = (u: number, v: number) => {
            if (hasMarkers) return bilinearMap(u, v, tl!, tr!, bl!, br!);
            return { x: u * scanWidth, y: v * scanHeight };
        };

        // Use marker-based coordinate system if available
        const gridLeftU = hasMarkers ? 0.06 : gridLeft / scanWidth;
        const gridRightU = hasMarkers ? 0.94 : gridRight / scanWidth;
        const gridWidthU = gridRightU - gridLeftU;
        const colGapU = hasMarkers ? (colGap / (gridRight - gridLeft)) : (colGap / scanWidth);
        const colWU = (gridWidthU - colGapU * (COLS - 1)) / COLS;

        const templateGridTopV = 0.36;
        const templateGridBottomV = 0.90;
        const rowHV = (templateGridBottomV - templateGridTopV) / Math.max(1, expectedRows);

        const bubbleRTemplate = (() => {
            if (!hasMarkers) {
                // After rectification we are already in the template coordinate space.
                return Math.max(6, Math.min(18, (rowHV * scanHeight) * 0.34));
            }
            const p0 = toXY(0.5, templateGridTopV);
            const p1 = toXY(0.5, templateGridTopV + rowHV);
            const dy = Math.abs(p1.y - p0.y);
            return Math.max(6, Math.min(18, dy * 0.34));
        })();

        let rowBase = 0;
        for (const meta of sectionRows) {
            const section = meta.sec;
            const qCount = meta.qCount || 0;
            const rowsInSection = meta.rows || 0;

            const optionsPerQuestion = Number(section.optionsPerQuestion ?? 4);
            const opts = ['A', 'B', 'C', 'D'].slice(0, optionsPerQuestion);

            for (let i = 0; i < qCount; i++) {
                const qNum = (section.questionStartIndex || 1) + i;
                const col = i % COLS;
                const row = Math.floor(i / COLS);
                const rowIdx = rowBase + row;

                const rowCy = isRectified
                    ? nearestRowCenter(Math.round((templateGridTopV + rowIdx * rowHV + rowHV * 0.58) * scanHeight))
                    : rowCenters[rowIdx] ??
                      Math.round(fallbackGridTop + rowIdx * fallbackRowH + fallbackRowH * 0.58);

                if (!Number.isFinite(optionsPerQuestion) || optionsPerQuestion <= 0) continue;

                let bestLabel = '';
                let best = -1;
                let second = -1;

                // PDF rectified mode: use fixed template coordinates (stable after rectification).
                if (isRectified) {
                    const colX = gridLeft + col * (colW + colGap);
                    for (let oi = 0; oi < opts.length; oi++) {
                        const frac = bubblesStart + (oi + 0.5) * (bubblesSpan / opts.length);
                        const x = Math.round(colX + frac * colW);
                        // In rectified PDF mode, prefer full-disk fill over center-based contrast
                        // because the printed bubbles already contain letters A/B/C/D inside them.
                        const d = bubbleBestFillScore(
                            scanData,
                            scanWidth,
                            scanHeight,
                            x,
                            rowCy,
                            Math.max(7, bubbleRTemplate * 0.95)
                        );
                        if (d > best) {
                            second = best;
                            best = d;
                            bestLabel = opts[oi];
                        } else if (d > second) {
                            second = d;
                        }
                    }
                } else {
                    // If we have markers, use stable template-v mapping; else use rowCenters-derived v.
                    const v = hasMarkers
                        ? templateGridTopV + rowIdx * rowHV + rowHV * 0.58
                        : rowCy / scanHeight;

                    const colBaseU = gridLeftU + col * (colWU + colGapU);

                    const bubbles = opts.map((label, oi) => {
                        const fracInCol = bubblesStart + (oi + 0.5) * (bubblesSpan / opts.length);
                        const u = colBaseU + fracInCol * colWU;
                        const p = toXY(u, v);
                        return { label, x: Math.round(p.x), y: Math.round(p.y) };
                    });

                    for (const { label, x, y } of bubbles) {
                        const r = bubbleRTemplate;
                        const d = bubbleBestMarkScore(scanData, scanWidth, scanHeight, x, y, r);
                        if (d > best) {
                            second = best;
                            best = d;
                            bestLabel = label;
                        } else if (d > second) {
                            second = d;
                        }
                    }
                }

                const gap = best - (second >= 0 ? second : 0);
                const isFilled = best >= FILL_THRESH && gap >= GAP_THRESH;

                if (isFilled && bestLabel) {
                    detectedAnswers[qNum] = bestLabel;
                    filledConfidenceSum += Math.max(0, Math.min(1, gap / 0.2));
                    filledCount++;
                }
            }

            rowBase += rowsInSection;
        }
    }

    return {
        testId,
        answers: detectedAnswers,
        confidence:
            Object.keys(detectedAnswers).length > 0
                ? 0.75 + 0.20 * (filledCount ? filledConfidenceSum / filledCount : 0.5)
                : 0.72,
    };
};
