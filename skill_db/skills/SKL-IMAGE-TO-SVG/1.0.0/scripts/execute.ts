// SKL-IMAGE-TO-SVG — execute.ts
// Convierte imagen raster a SVG vectorial
// Stack: Sharp (resize/normalize) + potrace (vectorize) + svgo (optimize)

import type { SkillInput, SkillOutput } from '../../../types';

interface ImageToSvgInput {
  image: File | Buffer;
  mode?: 'auto' | 'trace' | 'outline';
  simplify?: number;
}

interface ImageToSvgOutput {
  svg: string;
  width: number;
  height: number;
  size_bytes: number;
}

export async function execute(input: ImageToSvgInput): Promise<ImageToSvgOutput> {
  // TODO: implementar con sharp + potrace
  // 1. sharp(input.image).resize(1024).greyscale().toBuffer()
  // 2. potrace.trace(buffer, { threshold: 128, turdSize: input.simplify })
  // 3. svgo.optimize(svgString)
  // 4. return { svg, width, height, size_bytes: svg.length }
  throw new Error('Not implemented — install: npm i sharp potrace svgo');
}
