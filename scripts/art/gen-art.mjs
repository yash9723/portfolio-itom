// Regenerates every person-specific texture from src/data/profile.js.
// Run with: node scripts/art/gen-art.mjs [group]
//
// Strategy: reuse the original hand-drawn frames in scripts/art/templates (balloons, cards,
// device bezels, door, islands), erase their old content and draw new content in the same
// sketch fonts. Each texture has a "sketch" version and a "_painted" (crayon colour) version.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PROFILE, PROJECTS, BALLOONS, STUDIO_ITEMS, AWARDS } from '../../src/data/profile.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url)).replace(/\\/g, '/');
const TPL = `${ROOT}scripts/art/templates/`;
const OUT = `${ROOT}public/`;
const FONT = {
  sketch: `${ROOT}public/fonts/CabinSketch-Regular.ttf`,
  sketchBold: `${ROOT}public/fonts/CabinSketch-Bold.ttf`,
  scribble: `${ROOT}public/fonts/RubikScribble-Regular.ttf`,
  fred: `${ROOT}public/fonts/FrederickatheGreat-Regular.ttf`,
};
const FAMILY = { sketch: 'Cabin Sketch', sketchBold: 'Cabin Sketch Bold', scribble: 'Rubik Scribble', fred: 'Fredericka the Great' };
const INK = '#1a1a1a';
const PAPER = '#fdfcf8';

const only = process.argv[2]; // optional: run one group, e.g. `node gen-art.mjs balloons`

// ---------- primitives ----------

const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Render text to a PNG buffer with one of the site fonts. `width` enables wrapping. */
async function text(str, { font = 'sketchBold', size = 60, color = INK, width, align = 'centre' } = {}) {
  const markup = `<span foreground="${color}">${xmlEsc(str)}</span>`;
  return sharp({
    text: { text: markup, font: `${FAMILY[font]} ${size}`, fontfile: FONT[font], rgba: true, align, dpi: 72, ...(width ? { width, wrap: 'word' } : {}) },
  }).png().toBuffer({ resolveWithObject: true });
}

/** Text fitted inside maxW/maxH (shrinks until it fits), centred on cx,cy (or left-aligned with anchor:'start'). */
async function textAt(str, cx, cy, opts = {}) {
  let size = opts.size ?? 60;
  for (;;) {
    const { data, info } = await text(str, { ...opts, size });
    const fits = (!opts.maxW || info.width <= opts.maxW) && (!opts.maxH || info.height <= opts.maxH);
    if (fits || size <= 10) {
      const left = opts.anchor === 'start' ? Math.round(cx) : Math.round(cx - info.width / 2);
      const top = opts.vAnchor === 'bottom' ? Math.round(cy - info.height) : Math.round(cy - info.height / 2);
      return { input: data, left, top };
    }
    size = Math.floor(size * 0.92);
  }
}

/** SVG wrapper with the shared hand-drawn filters: #rough (wobbly lines) and #crayon (grainy fill). */
function svg(w, h, body, seed = 3) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w)}" height="${Math.round(h)}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="${seed}"/>
      <feDisplacementMap in="SourceGraphic" scale="${Math.max(3, Math.round(w / 260))}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="crayon" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="${seed + 7}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.55" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/>
    </filter>
  </defs>
  ${body}
</svg>`);
}

const sk = (shape, sw = 4) => `<g filter="url(#rough)" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${shape}</g>`;
// Crayon fill: a translucent solid base plus a grainy layer on top, so dark fills stay readable.
const fillC = (shape) => `<g opacity="0.55">${shape}</g><g filter="url(#crayon)">${shape}</g>`;
const png = (buf) => sharp(buf).png().toBuffer();

async function save(img, path, { quality = 86 } = {}) {
  mkdirSync(path.slice(0, path.lastIndexOf('/')), { recursive: true });
  await img.webp({ quality, effort: 5 }).toFile(path);
  console.log('  wrote', path.replace(OUT, 'public/'));
}

const meta = (p) => sharp(p).metadata();
const blank = (width, height) => sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });

// ---------- pencil sketch of the photo ----------

let sketchCache;
async function photoSketch() {
  if (sketchCache) return sketchCache;
  const SCALE = 4;
  const m = await meta(`${ROOT}scripts/art/photo.png`);
  const W = m.width * SCALE, H = m.height * SCALE;
  const base = sharp(`${ROOT}scripts/art/photo.png`).resize(W, H, { kernel: 'lanczos3' });
  const alpha = await base.clone().extractChannel(3).raw().toBuffer();
  const grey = await base.clone().flatten({ background: '#ffffff' }).greyscale().median(5).toColourspace('b-w').raw().toBuffer();
  const blurInv = await sharp(grey, { raw: { width: W, height: H, channels: 1 } }).negate().blur(9).toColourspace('b-w').raw().toBuffer();
  const a2 = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) {
    const t = blurInv[i];
    let v = t >= 255 ? 255 : Math.min(255, (grey[i] * 255) / (255 - t)); // colour dodge = pencil look
    v = 255 - Math.min(255, (255 - v) * 2.4);
    if (v > 214) v = 255; // drop paper speckle
    a2[i] = Math.round(((255 - v) / 255) * alpha[i]); // ink darkness -> alpha, paper -> transparent
  }
  // Ink on an opaque white silhouette (like the original cartoon), so backgrounds don't show through the body.
  // ...plus an ink contour around the silhouette (grown alpha minus original alpha).
  const grown = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(5).toColourspace('b-w').raw().toBuffer();
  const lum = Buffer.alloc(W * H), outA = Buffer.from(alpha);
  for (let i = 0; i < W * H; i++) {
    lum[i] = 255 - Math.round(a2[i] * (229 / 255));
    if (alpha[i] < 140 && grown[i] > 40) { lum[i] = 26; outA[i] = Math.min(255, grown[i] * 2); }
  }
  sketchCache = {
    W, H,
    png: await sharp(lum, { raw: { width: W, height: H, channels: 1 } })
      .joinChannel(outA, { raw: { width: W, height: H, channels: 1 } })
      .toColourspace('b-w').png().toBuffer(),
  };
  return sketchCache;
}

/** Sketch figure resized to a height; `crop` keeps the top fraction; `boil` re-jitters lines for animation frames. */
async function figure(height, { crop, boil } = {}) {
  const { W, H, png: sk0 } = await photoSketch();
  let img = sharp(sk0);
  if (crop) img = img.extract({ left: 0, top: 0, width: W, height: Math.round(H * crop) });
  const buf = await img.resize({ height }).png().toBuffer({ resolveWithObject: true });
  if (!boil) return buf;
  const { width: w, height: h } = buf.info;
  const s = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}">
    <filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="1" seed="${boil}"/><feDisplacementMap in="SourceGraphic" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <image width="${w}" height="${h}" xlink:href="data:image/png;base64,${buf.data.toString('base64')}" filter="url(#b)"/></svg>`);
  return sharp(s).png().toBuffer({ resolveWithObject: true });
}

// ---------- avatar ----------

async function avatars() {
  console.log('avatars');
  // Corridor: 9 frames of the standing figure with hand-drawn "line boil".
  for (let f = 1; f <= 9; f++) {
    const fig = await figure(990, { boil: f * 11 });
    await save(blank(1024, 1024).composite([{ input: fig.data, left: Math.round(512 - fig.info.width / 2), top: 1024 - fig.info.height - 12 }]),
      `${OUT}textures/corridor/avatar_anim/${f}.webp`);
  }

  // Entrance window: upper body peeking in from the bottom-right.
  {
    const fig = await figure(860, { crop: 0.45, boil: 5 });
    await save(blank(1024, 1024).composite([{ input: fig.data, left: Math.min(1024 - fig.info.width, 560), top: 1024 - fig.info.height }]),
      `${OUT}textures/entrance/avatar_window.webp`);
  }

  // About intro: figure standing in a cloud (1781x890).
  {
    const W = 1781, H = 890;
    const cloud = `<path d="M170,690 C90,690 70,600 150,570 C120,480 260,440 320,500 C360,400 520,400 560,480
      C620,380 820,380 860,470 C930,400 1090,410 1110,500 C1180,430 1340,450 1350,540 C1450,500 1610,560 1580,650
      C1700,690 1640,800 1530,790 C1480,860 1290,850 1250,800 C1180,870 980,870 930,810 C850,880 640,870 600,810
      C520,870 330,860 300,800 C200,830 110,770 170,690 Z" fill="#ffffff"/>`;
    const front = `<path d="M600,770 C560,690 700,640 760,700 C800,630 980,630 1000,700 C1060,650 1200,690 1170,780 C1150,850 640,850 600,770 Z" fill="#ffffff"/>`;
    const fig = await figure(780, { boil: 3 });
    await save(blank(W, H).composite([
      { input: await png(svg(W, H, cloud + sk(cloud, 7))) },
      { input: fig.data, left: Math.round(W / 2 - fig.info.width / 2), top: 20 },
      { input: await png(svg(W, H, front + sk(front, 7))) }, // front puff hides the feet
    ]), `${OUT}textures/about/awatarnachmurce.webp`);
  }
}

// ---------- gallery project cards ----------

// Inner "screen" window of the card template, as fractions of the image.
const CARD_WIN = { x0: 0.112, y0: 0.311, x1: 0.898, y1: 0.93 };
const CARD_BAND = 22, CARD_BAND_Y = 9; // px of the original frame lines restored around the window edge (sides, top/bottom)

function projectArt(id, w, h, painted) {
  const c = (col) => (painted ? col : 'none');
  const parts = [];
  const texts = [];
  const T = (str, x, y, o = {}) => texts.push({ str, x: x * w, y: y * h, o });
  switch (id) {
    case 'bitflow': {
      parts.push(fillC(`<rect x="${w * .06}" y="${h * .2}" width="${w * .88}" height="${h * .38}" rx="22" fill="${c('#1f2a30')}"/>`));
      parts.push(sk(`<rect x="${w * .06}" y="${h * .2}" width="${w * .88}" height="${h * .38}" rx="22"/><line x1="${w * .06}" y1="${h * .245}" x2="${w * .94}" y2="${h * .245}"/>
        <circle cx="${w * .11}" cy="${h * .222}" r="9"/><circle cx="${w * .15}" cy="${h * .222}" r="9"/><circle cx="${w * .19}" cy="${h * .222}" r="9"/>`, 5));
      const code = ['module counter(', '  input clk, rst,', '  output reg [3:0] q);', 'always @(posedge clk)', '  q <= rst ? 0 : q + 1;', 'endmodule'];
      code.forEach((line, i) => T(line, 0.1, 0.28 + i * 0.048, { font: 'sketchBold', size: 46, maxW: w * .8, color: painted ? (i === 0 || i === 5 ? '#4ee6b0' : '#f2f2f2') : INK, anchor: 'start' }));
      const wy = h * .68, amp = h * .03;
      let d = `M${w * .16},${wy + amp}`;
      for (let i = 0; i < 7; i++) { const x = w * (.16 + i * .11); d += ` L${x},${wy - amp} L${x + w * .055},${wy - amp} L${x + w * .055},${wy + amp} L${x + w * .11},${wy + amp}`; }
      parts.push(`<g filter="url(#rough)" fill="none" stroke="${painted ? '#13b07d' : INK}" stroke-width="6">${`<path d="${d}"/>`}</g>`);
      parts.push(sk(`<path d="M${w * .16},${h * .77} L${w * .93},${h * .77} M${w * .16},${h * .83} L${w * .93},${h * .83}"/>` +
        [.35, .55, .75].map((x) => `<path d="M${w * x - 14},${h * .77} L${w * x + 14},${h * .83} M${w * x - 14},${h * .83} L${w * x + 14},${h * .77}"/>`).join(''), 4));
      ['0', '1', '2', '3'].forEach((v, i) => T(v, 0.25 + i * 0.2, 0.8, { font: 'sketchBold', size: 44 }));
      T('clk', 0.03, 0.68, { font: 'sketch', size: 36, anchor: 'start' });
      T('q', 0.06, 0.8, { font: 'sketch', size: 40, anchor: 'start' });
      parts.push(fillC(`<rect x="${w * .3}" y="${h * .875}" width="${w * .4}" height="${h * .075}" rx="30" fill="${c('#2ee6a6')}"/>`));
      parts.push(sk(`<rect x="${w * .3}" y="${h * .875}" width="${w * .4}" height="${h * .075}" rx="30"/>`, 5));
      T('RUN SIM', 0.5, 0.912, { font: 'sketchBold', size: 54 });
      T('BitFlow', 0.56, 0.085, { font: 'scribble', size: 120, maxW: w * .7 });
      T('RTL coding platform', 0.5, 0.155, { font: 'sketch', size: 46 });
      break;
    }
    case 'tranatrace': {
      const cx = w * .5, cy = h * .3, s = w * .36;
      parts.push(fillC(`<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="14" fill="${c('#3a3f47')}"/>`));
      let pins = '';
      for (let i = 0; i < 6; i++) {
        const o = cy - s / 2 + s * (0.12 + i * 0.152), p = cx - s / 2 + s * (0.12 + i * 0.152);
        pins += `<line x1="${cx - s / 2}" y1="${o}" x2="${cx - s / 2 - 34}" y2="${o}"/><line x1="${cx + s / 2}" y1="${o}" x2="${cx + s / 2 + 34}" y2="${o}"/>`;
        pins += `<line x1="${p}" y1="${cy - s / 2}" x2="${p}" y2="${cy - s / 2 - 34}"/><line x1="${p}" y1="${cy + s / 2}" x2="${p}" y2="${cy + s / 2 + 34}"/>`;
      }
      parts.push(sk(`<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="14"/><circle cx="${cx - s * .32}" cy="${cy - s * .32}" r="12"/>${pins}`, 6));
      T('TT-01', 0.5, 0.3, { font: 'sketchBold', size: 70, color: painted ? '#f4f4f4' : INK });
      const st = [['IDLE', .22, .58], ['ARMED', .78, .58], ['ALERT', .78, .82], ['TRACE', .22, .82]];
      const fills = ['#cde8ff', '#ffe08a', '#ff9a8a', '#a8f0c6'];
      st.forEach(([, x, y], i) => parts.push(fillC(`<circle cx="${w * x}" cy="${h * y}" r="${w * .14}" fill="${c(fills[i])}"/>`)));
      parts.push(sk(st.map(([, x, y]) => `<circle cx="${w * x}" cy="${h * y}" r="${w * .14}"/>`).join('') +
        `<path d="M${w * .37},${h * .58} L${w * .63},${h * .58} m-24,-14 l24,14 l-24,14"/>
         <path d="M${w * .78},${h * .64} L${w * .78},${h * .76} m-14,-22 l14,22 l14,-22"/>
         <path d="M${w * .63},${h * .82} L${w * .37},${h * .82} m24,-14 l-24,14 l24,14"/>
         <path d="M${w * .22},${h * .76} L${w * .22},${h * .64} m-14,22 l14,-22 l14,22"/>`, 5));
      st.forEach(([name, x, y]) => T(name, x, y, { font: 'sketchBold', size: 46, maxW: w * .24 }));
      T('Trana-Trace', 0.5, 0.075, { font: 'scribble', size: 104, maxW: w * .94 });
      T('mobile security chip, designed as an FSM in Verilog', 0.5, 0.95, { font: 'sketch', size: 36, maxW: w * .94 });
      break;
    }
    case 'naviel': {
      const cx = w * .5, cy = h * .36;
      const shield = `M${cx},${cy - w * .27} L${cx + w * .25},${cy - w * .17} C${cx + w * .25},${cy + w * .12} ${cx + w * .14},${cy + w * .26} ${cx},${cy + w * .33} C${cx - w * .14},${cy + w * .26} ${cx - w * .25},${cy + w * .12} ${cx - w * .25},${cy - w * .17} Z`;
      parts.push(fillC(`<path d="${shield}" fill="${c('#5aa9ff')}"/>`));
      parts.push(sk(`<path d="${shield}"/><path d="M${cx - w * .1},${cy + w * .02} L${cx - w * .02},${cy + w * .1} L${cx + w * .12},${cy - w * .07}" stroke-width="12"/>`, 6));
      const bx = w * .14, by = h * .66, bw = w * .56, bh = h * .17;
      parts.push(fillC(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="${c('#2f7d4a')}"/>`));
      parts.push(sk(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10"/>
        <rect x="${bx + bw * .36}" y="${by + bh * .25}" width="${bw * .28}" height="${bh * .5}"/>
        <path d="M${bx + bw * .06},${by + bh * .2} l20,0 l0,30 l20,0 l0,-30 l20,0 l0,30 l20,0"/>
        <circle cx="${bx + bw * .9}" cy="${by + bh * .3}" r="10"/>
        <path d="M${w * .76},${h * .7} q40,40 0,80 M${w * .82},${h * .68} q70,60 0,124"/>`, 5));
      T('NAVIEL', 0.5, 0.075, { font: 'scribble', size: 120 });
      T('safety hardware for citizens', 0.5, 0.93, { font: 'sketch', size: 44, maxW: w * .9 });
      break;
    }
    case 'optica': {
      const tri = `M${w * .5},${h * .22} L${w * .74},${h * .5} L${w * .26},${h * .5} Z`;
      parts.push(fillC(`<path d="${tri}" fill="${c('#dff1ff')}"/>`));
      ['#ff4d4d', '#ff9f1a', '#ffe14d', '#3ddc84', '#3d8bff', '#8e5cff'].forEach((col, i) =>
        parts.push(`<g filter="url(#rough)"><path d="M${w * .62},${h * (.37 + i * .004)} L${w * .97},${h * (.42 + i * .03)}" stroke="${painted ? col : INK}" stroke-width="${painted ? 16 : 4}" fill="none"/></g>`));
      parts.push(sk(`<path d="${tri}"/><path d="M${w * .03},${h * .45} L${w * .4},${h * .36}" stroke-width="8"/>`, 6));
      parts.push(fillC(`<ellipse cx="${w * .5}" cy="${h * .7}" rx="${w * .09}" ry="${h * .12}" fill="${c('#bfe6ff')}"/>`));
      parts.push(sk(`<ellipse cx="${w * .5}" cy="${h * .7}" rx="${w * .09}" ry="${h * .12}"/>
        <path d="M${w * .06},${h * .62} L${w * .45},${h * .62} L${w * .86},${h * .7} M${w * .06},${h * .78} L${w * .45},${h * .78} L${w * .86},${h * .7}"/>
        <circle cx="${w * .87}" cy="${h * .7}" r="10"/>`, 5));
      T('OPTICA', 0.5, 0.075, { font: 'scribble', size: 120 });
      T('Student Chapter', 0.5, 0.15, { font: 'sketchBold', size: 54 });
      T('workshops - talks - research', 0.5, 0.93, { font: 'sketch', size: 44, maxW: w * .9 });
      break;
    }
  }
  return { body: parts.join('\n'), texts };
}

async function galleryCards() {
  console.log('gallery cards');
  for (const p of PROJECTS) {
    for (const painted of [false, true]) {
      const tpl = `${TPL}card${painted ? '_painted' : ''}.webp`;
      const { width: W, height: H } = await meta(tpl);
      const x0 = Math.round(W * CARD_WIN.x0), y0 = Math.round(H * CARD_WIN.y0);
      const w = Math.round(W * (CARD_WIN.x1 - CARD_WIN.x0)), h = Math.round(H * (CARD_WIN.y1 - CARD_WIN.y0));
      const bg = `<rect width="${w}" height="${h}" fill="${painted ? '#f6f1e3' : PAPER}"/>` + (painted ? fillC(`<rect width="${w}" height="${h}" fill="#eadfc6"/>`) : '');
      const { body, texts } = projectArt(p.id, w, h, painted);
      // Original frame lines inside the edge band, re-applied over the new content.
      const ink = await sharp(tpl).extract({ left: x0, top: y0, width: w, height: h }).greyscale().threshold(110).negate().toColourspace('b-w').raw().toBuffer();
      const band = await sharp(svg(w, h, `<rect x="0" y="0" width="${w}" height="${h}" fill="#fff"/><rect x="${CARD_BAND}" y="${CARD_BAND_Y}" width="${w - 2 * CARD_BAND}" height="${h - 2 * CARD_BAND_Y}" fill="#000"/>`)).greyscale().toColourspace('b-w').raw().toBuffer();
      for (let i = 0; i < ink.length; i++) ink[i] = Math.min(ink[i], band[i]);
      const frameLines = await sharp(Buffer.alloc(w * h, 26), { raw: { width: w, height: h, channels: 1 } }).joinChannel(ink, { raw: { width: w, height: h, channels: 1 } }).toColourspace('b-w').png().toBuffer();
      const layers = [{ input: await png(svg(w, h, bg + body, 5)), left: x0, top: y0 }];
      for (const t of texts) {
        const r = await textAt(t.str, t.x, t.y, { maxW: w * 0.92, ...t.o });
        layers.push({ input: r.input, left: x0 + r.left, top: y0 + r.top });
      }
      layers.push({ input: frameLines, left: x0, top: y0 });
      if (p.id === 'bitflow') {
        let logo = sharp(`${ROOT}scripts/art/bitflow_logo.png`).trim().resize({ width: Math.round(w * 0.2) });
        if (!painted) logo = logo.greyscale();
        const l = await logo.png().toBuffer({ resolveWithObject: true });
        layers.push({ input: l.data, left: x0 + Math.round(w * 0.04), top: y0 + Math.round(h * 0.085 - l.info.height / 2) });
      }
      await save(sharp(tpl).composite(layers), `${OUT}${p[painted ? 'painted' : 'front'].slice(1)}`);
    }
  }
}

// ---------- tech logos (gallery card backs) ----------

const LOGOS = {
  veriloglogo: { label: 'Verilog', color: '#7b5cff' },
  pythonlogo: { label: 'Python', color: '#3776ab' },
  dockerlogo: { label: 'Docker', color: '#1d91e6' },
  chiplogo: { label: 'VLSI', color: '#455a64' },
  esp32logo: { label: 'ESP32', color: '#e7352c' },
  raspilogo: { label: 'R-Pi', color: '#c51a4a' },
  pcblogo: { label: 'PCB', color: '#2e7d32' },
  clogo: { label: 'C', color: '#5c6bc0' },
  opticslogo: { label: 'Optics', color: '#00acc1' },
  matlablogo: { label: 'MATLAB', color: '#ef6c00' },
  cadencelogo: { label: 'Cadence', color: '#c62828' },
};

async function techLogos() {
  console.log('tech logos');
  for (const [name, { label, color }] of Object.entries(LOGOS)) {
    for (const painted of [false, true]) {
      const S = 512;
      const shape = `<rect x="40" y="40" width="432" height="432" rx="90" fill="${painted ? color : '#ffffff'}"/>`;
      const base = svg(S, S, shape + (painted ? fillC(shape.replace(color, '#000000').replace('fill=', 'fill-opacity="0.15" fill=')) : '') + sk(`<rect x="40" y="40" width="432" height="432" rx="90"/>`, 14), 9);
      const t = await textAt(label, S / 2, S / 2, { font: 'sketchBold', size: 220, maxW: 360, maxH: 300, color: painted ? '#ffffff' : INK });
      const buf = await sharp(base).composite([t]).png().toBuffer();
      await save(sharp(buf).resize(128, 128), `${OUT}textures/gallery/${name}${painted ? '_painted' : ''}.webp`);
    }
  }
}

// ---------- round "sticker" used on balloons and the studio door ----------

async function sticker(W, H, spot, label, painted, accent) {
  const cx = W * spot.cx, cy = H * spot.cy, r = W * spot.r;
  const deco = painted ? `<circle cx="${cx}" cy="${cy}" r="${r * 0.84}" fill="none" stroke="${accent}" stroke-width="${r * 0.07}"/>` : '';
  const base = await png(svg(W, H, `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fffdf6"/>${fillC(deco)}` +
    sk(`<circle cx="${cx}" cy="${cy}" r="${r}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.94}"/>`, Math.max(3, W / 170)), 11));
  const t = await textAt(label, cx, cy, { font: 'sketchBold', size: Math.round(r * 0.8), maxW: r * 1.5, maxH: r * 1.2, color: painted ? accent : INK, width: Math.round(r * 1.6) });
  return [{ input: base }, t];
}

// ---------- balloons ----------

// Where the old logo sits on each balloon template (fractions of width/height).
const BALLOON_SPOT = { large: { cx: 0.5, cy: 0.305, r: 0.36 }, medium: { cx: 0.507, cy: 0.272, r: 0.375 }, small: { cx: 0.494, cy: 0.272, r: 0.375 } };
// Hue shifts give each painted balloon its own colour (large=blue, medium=yellow, small=orange bases).
const BALLOON_HUE = { verilog: 0, vlsi: 70, esp32: 230, python: 0, c: 160, raspi: 300, matlab: 0, cadence: 320, pcb: 90, html: 200 };
const BALLOON_INK = { verilog: '#1f4e8c', vlsi: '#5a2d91', esp32: '#2e7d32', python: '#8a6d00', c: '#1565c0', raspi: '#c2185b', matlab: '#d84315', cadence: '#b71c1c', pcb: '#2e7d32', html: '#1565c0' };

async function balloons() {
  console.log('balloons');
  for (const b of BALLOONS) {
    for (const painted of [false, true]) {
      const tpl = `${TPL}balloon_${b.size}${painted ? '_painted' : ''}.webp`;
      const { width: W, height: H } = await meta(tpl);
      let img = sharp(tpl);
      if (painted && BALLOON_HUE[b.key]) img = sharp(await img.modulate({ hue: BALLOON_HUE[b.key] }).png().toBuffer());
      const layers = await sticker(W, H, BALLOON_SPOT[b.size], b.label, painted, BALLOON_INK[b.key]);
      await save(sharp(await img.composite(layers).png().toBuffer()), `${OUT}${(painted ? b.paintedTexture : b.texture).slice(1)}`);
    }
  }
}

// ---------- journey islands ----------

async function island(tpl, word, out, { eraseY, grassY, x0, x1 }) {
  const { width: W, height: H } = await meta(tpl);
  const eraser = svg(W, H, `<rect x="0" y="0" width="${W}" height="${eraseY}" fill="#fff"/>`);
  // new grass edge with tufts along the top of the island
  let tufts = '';
  for (let x = x0 + 10; x < x1 - 10; x += 13) {
    const y = grassY + Math.sin(x / 37) * 4;
    tufts += `M${x},${y} l${3 + (x % 5)},-${9 + (x % 13)} M${x + 6},${y} l-3,-${6 + (x % 9)} `;
  }
  const grass = svg(W, H, sk(`<path d="${tufts}" stroke-width="2.5"/>`, 3), 4);
  // letters stand on the grass: bottom-anchored just below the grass line
  const cy = grassY + H * 0.005;
  const opts = { font: 'fred', size: Math.round(H * 0.36), maxW: (x1 - x0) * 0.95, maxH: H * 0.4, vAnchor: 'bottom' };
  const shadow = await textAt(word, (x0 + x1) / 2 + W * 0.007, cy + H * 0.01, { ...opts, color: '#a0a0a0' });
  const front = await textAt(word, (x0 + x1) / 2, cy, opts);
  await save(sharp(tpl).composite([{ input: await png(eraser) }, shadow, front, { input: await png(grass) }]), `${OUT}textures/about/${out}`);
}

async function islands() {
  console.log('islands');
  await island(`${TPL}island_a.webp`, 'ADITYA', 'adityawyspa.webp', { eraseY: 262, grassY: 285, x0: 330, x1: 1040 });
  await island(`${TPL}island_b.webp`, 'OPTICA', 'opticawyspa.webp', { eraseY: 228, grassY: 250, x0: 120, x1: 1240 });
}

// ---------- award cards (shown in the About overlay) ----------

async function certificates() {
  console.log('certificates');
  const items = Object.values(AWARDS).flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));
  for (const item of items) {
    const W = 600, H = 846;
    const ribbon = `<path d="M260,170 L230,60 L280,60 L300,140 L320,60 L370,60 L340,170 Z" fill="#e53935"/>`;
    const medal = `<circle cx="300" cy="230" r="80" fill="#ffca28"/>`;
    const base = svg(W, H, `<rect width="${W}" height="${H}" fill="#fbf7ec"/>` + fillC(ribbon + medal) +
      sk(`<rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="6"/><rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="4"/>
          <path d="M260,170 L230,60 L280,60 L300,140 L320,60 L370,60 L340,170"/><circle cx="300" cy="230" r="80"/><circle cx="300" cy="230" r="58"/>
          <path d="M150,700 L450,700"/>`, 4), 21);
    const layers = [
      await textAt('*', 300, 238, { font: 'scribble', size: 120 }),
      await textAt(item.group.toUpperCase(), 300, 360, { font: 'sketchBold', size: 40, maxW: 480 }),
      await textAt(item.label, 300, 475, { font: 'sketchBold', size: 58, maxW: 480, maxH: 200, width: 480 }),
      await textAt(item.date, 300, 600, { font: 'sketch', size: 40, maxW: 480 }),
      await textAt(PROFILE.fullName, 300, 735, { font: 'sketch', size: 30, maxW: 440 }),
    ];
    await save(sharp(await png(base)).composite(layers), `${OUT}${item.image.slice(1)}`);
  }
}

// ---------- studio ----------

// Remove the baked-in "ITOM" from the monitor bezel (must run before studioScreens).
async function monitorBezel() {
  console.log('monitor bezel');
  for (const painted of [false, true]) {
    const tpl = `${TPL}monitor${painted ? '_painted' : ''}.webp`;
    const { width: W, height: H } = await meta(tpl);
    const box = { left: Math.round(W * 0.43), top: Math.round(H * 0.905), width: Math.round(W * 0.14), height: Math.round(H * 0.085) };
    const patch = await sharp(tpl).extract({ ...box, left: Math.round(W * 0.26) }).toBuffer();
    const label = await textAt(PROFILE.shortName, box.left + box.width / 2, box.top + box.height / 2, { font: 'sketchBold', size: Math.round(H * 0.06), color: '#333333' });
    await save(sharp(tpl).composite([{ input: patch, left: box.left, top: box.top }, label]), `${OUT}textures/studio/monitor_front${painted ? '_painted' : ''}.webp`);
  }
}

const DEVICE = {
  tv: { tpl: 'textures/studio/tv_front', win: { x0: 0.12, y0: 0.15, x1: 0.71, y1: 0.75 } },
  monitor: { tpl: 'textures/studio/monitor_front', win: { x0: 0.06, y0: 0.09, x1: 0.94, y1: 0.87 } },
  phone: { tpl: 'textures/studio/phone_front', win: { x0: 0.07, y0: 0.11, x1: 0.93, y1: 0.89 } },
};
const SHAPE = { talk: 'tv', event: 'monitor', update: 'phone' };

function icon(kind, cx, cy, s, painted) {
  const c = (col) => (painted ? col : 'none');
  const sw = s / 22;
  if (kind === 'talk') { // microphone
    return fillC(`<rect x="${cx - s * .22}" y="${cy - s * .6}" width="${s * .44}" height="${s * .75}" rx="${s * .22}" fill="${c('#9e9e9e')}"/>`) +
      sk(`<rect x="${cx - s * .22}" y="${cy - s * .6}" width="${s * .44}" height="${s * .75}" rx="${s * .22}"/><path d="M${cx - s * .38},${cy} q0,${s * .42} ${s * .38},${s * .42} q${s * .38},0 ${s * .38},-${s * .42} M${cx},${cy + s * .42} L${cx},${cy + s * .62} M${cx - s * .2},${cy + s * .62} L${cx + s * .2},${cy + s * .62}"/>`, sw);
  }
  if (kind === 'event') { // calendar with a tick
    return fillC(`<rect x="${cx - s * .5}" y="${cy - s * .45}" width="${s}" height="${s * .25}" fill="${c('#ef5350')}"/>`) +
      sk(`<rect x="${cx - s * .5}" y="${cy - s * .45}" width="${s}" height="${s * .9}" rx="10"/><line x1="${cx - s * .5}" y1="${cy - s * .2}" x2="${cx + s * .5}" y2="${cy - s * .2}"/>
        <line x1="${cx - s * .25}" y1="${cy - s * .58}" x2="${cx - s * .25}" y2="${cy - s * .36}"/><line x1="${cx + s * .25}" y1="${cy - s * .58}" x2="${cx + s * .25}" y2="${cy - s * .36}"/>
        <path d="M${cx - s * .22},${cy + s * .12} l${s * .14},${s * .14} l${s * .3},-${s * .3}" stroke-width="${s / 12}"/>`, sw);
  }
  // megaphone
  return fillC(`<path d="M${cx - s * .45},${cy - s * .15} L${cx + s * .35},${cy - s * .5} L${cx + s * .35},${cy + s * .5} L${cx - s * .45},${cy + s * .15} Z" fill="${c('#ffb300')}"/>`) +
    sk(`<path d="M${cx - s * .45},${cy - s * .15} L${cx + s * .35},${cy - s * .5} L${cx + s * .35},${cy + s * .5} L${cx - s * .45},${cy + s * .15} Z"/>
      <path d="M${cx - s * .3},${cy + s * .15} L${cx - s * .22},${cy + s * .45} L${cx - s * .08},${cy + s * .42} L${cx - s * .12},${cy + s * .2}"/>
      <path d="M${cx + s * .5},${cy - s * .2} q${s * .15},${s * .2} 0,${s * .4}"/>`, sw);
}

async function studioScreens() {
  console.log('studio screens');
  for (const item of STUDIO_ITEMS) {
    const dev = SHAPE[item.platform];
    for (const painted of [false, true]) {
      const tpl = `${OUT}${DEVICE[dev].tpl}${painted ? '_painted' : ''}.webp`;
      const { width: W, height: H } = await meta(tpl);
      const win = DEVICE[dev].win;
      const x0 = W * win.x0, y0 = H * win.y0, w = W * (win.x1 - win.x0), h = H * (win.y1 - win.y0);
      const vertical = dev === 'phone';
      const s = vertical ? w * 0.42 : h * 0.42;
      const icx = vertical ? x0 + w / 2 : x0 + w * 0.17, icy = vertical ? y0 + h * 0.25 : y0 + h * 0.5;
      const tx = vertical ? x0 + w / 2 : x0 + w * 0.64, tw = vertical ? w * 0.88 : w * 0.62;
      const base = Math.round((vertical ? w : h) * 0.14);
      const layers = [
        { input: await png(svg(W, H, icon(item.platform, icx, icy, s, painted), 13)) },
        await textAt(item.platform.toUpperCase(), tx, vertical ? y0 + h * 0.5 : y0 + h * 0.16, { font: 'sketchBold', size: Math.round(base * 0.6), maxW: tw, color: painted ? '#c0392b' : INK }),
        await textAt(item.title, tx, vertical ? y0 + h * 0.67 : y0 + h * 0.5, { font: 'sketchBold', size: base, maxW: tw, maxH: h * (vertical ? 0.28 : 0.5), width: Math.round(tw) }),
        await textAt(item.date, tx, vertical ? y0 + h * 0.87 : y0 + h * 0.84, { font: 'sketch', size: Math.round(base * 0.7), maxW: tw, color: '#444444' }),
      ];
      await save(sharp(tpl).composite(layers), `${OUT}${(painted ? item.paintedFrontTexture : item.frontTexture).slice(1)}`);
    }
  }
}

// ---------- studio door (corridor) ----------

async function door() {
  console.log('studio door');
  const spots = [
    { cx: 0.4, cy: 0.152, r: 0.21, label: 'TALKS' },
    { cx: 0.585, cy: 0.408, r: 0.19, label: 'EVENTS' },
    { cx: 0.487, cy: 0.745, r: 0.25, label: 'NEWS' },
  ];
  for (const painted of [false, true]) {
    const tpl = `${TPL}door${painted ? '_painted' : ''}.webp`;
    const { width: W, height: H } = await meta(tpl);
    const layers = [];
    for (const [i, sp] of spots.entries()) layers.push(...await sticker(W, H, sp, sp.label, painted, ['#c0392b', '#1e6fd9', '#e67e22'][i]));
    await save(sharp(tpl).composite(layers), `${OUT}textures/corridor/doors/drzwisocial${painted ? '_painted' : ''}.webp`);
  }
}

// ---------- corridor wall drawing ----------

async function wallArt() {
  console.log('wall art');
  // Shown on a 1.1 x 1.1 plane in CorridorDecorations, so keep it square.
  const W = 753, H = 753, sz = 190, cx = 250, cy = 400;
  let pins = '';
  for (let i = 0; i < 5; i++) {
    const o = cy - sz / 2 + sz * (0.14 + i * 0.18);
    pins += `<line x1="${cx - sz / 2}" y1="${o}" x2="${cx - sz / 2 - 28}" y2="${o}"/><line x1="${cx + sz / 2}" y1="${o}" x2="${cx + sz / 2 + 28}" y2="${o}"/>`;
  }
  const body = sk(`<rect x="${cx - sz / 2}" y="${cy - sz / 2}" width="${sz}" height="${sz}" rx="12"/><circle cx="${cx - sz * .32}" cy="${cy - sz * .32}" r="9"/>${pins}
      <path d="M420,330 l40,0 l0,-50 l40,0 l0,50 l40,0 l0,-50 l40,0 l0,50 l40,0"/>
      <path d="M420,470 l40,0 l40,-50 l40,0 l40,50 l80,0"/>
      <path d="M340,400 C370,400 380,330 410,320 M340,400 C370,400 380,460 410,470"/>`, 5);
  const layers = [
    await textAt('it works', W / 2, 120, { font: 'scribble', size: 110, maxW: 660 }),
    await textAt('in simulation!', W / 2, 215, { font: 'sketchBold', size: 70, maxW: 660 }),
    await textAt('1011', cx, cy, { font: 'sketchBold', size: 58 }),
    await textAt('clk', 640, 300, { font: 'sketch', size: 40 }),
    await textAt('q', 640, 440, { font: 'sketch', size: 40 }),
    await textAt('...now try it on the FPGA', W / 2, 640, { font: 'sketch', size: 52, maxW: 680 }),
  ];
  await save(sharp(await png(svg(W, H, body, 31))).composite(layers), `${OUT}textures/corridor/rysuneknaobraz1.webp`);
}

// ---------- favicon + social card ----------

async function brand() {
  console.log('favicon + og image');
  {
    const S = 426;
    const base = svg(S, S, `<circle cx="${S / 2}" cy="${S / 2}" r="190" fill="#ffffff"/>` + sk(`<circle cx="${S / 2}" cy="${S / 2}" r="190"/><circle cx="${S / 2}" cy="${S / 2}" r="176"/>`, 8), 2);
    const t = await textAt('AJ', S / 2, S / 2 + 6, { font: 'scribble', size: 210, maxW: 300 });
    await sharp(await png(base)).composite([t]).png().toFile(`${OUT}favico.png`);
    console.log('  wrote public/favico.png');
  }
  {
    const W = 1200, H = 630;
    const fig = await figure(590, { boil: 2 });
    const base = svg(W, H, `<rect width="${W}" height="${H}" fill="${PAPER}"/>` + sk(`<rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="8"/>
      <path d="M74,470 l40,0 l0,-36 l40,0 l0,36 l40,0 l0,-36 l40,0 l0,36 l40,0 l0,-36 l40,0 l0,36 l40,0"/>`, 4), 6);
    const layers = [
      await textAt('ABHILASH', 70, 160, { font: 'scribble', size: 130, anchor: 'start', maxW: 760 }),
      await textAt('Joyeal Uppalaguptha', 74, 262, { font: 'sketchBold', size: 62, anchor: 'start', maxW: 760 }),
      await textAt('< VLSI & embedded engineer />', 74, 350, { font: 'sketch', size: 46, anchor: 'start', maxW: 760, color: '#555555' }),
      await textAt('Verilog - ESP32 - IoT - BitFlow - Trana-Trace', 74, 545, { font: 'sketch', size: 34, anchor: 'start', maxW: 760, color: '#555555' }),
      { input: fig.data, left: W - fig.info.width - 110, top: 20 },
    ];
    await save(sharp(await png(base)).composite(layers), `${OUT}og-image.webp`, { quality: 88 });
  }
}

const GROUPS = { avatars, galleryCards, techLogos, balloons, islands, certificates, monitorBezel, studioScreens, door, wallArt, brand };
if (only && !GROUPS[only]) throw new Error(`Unknown group "${only}". Groups: ${Object.keys(GROUPS).join(', ')}`);
for (const [name, fn] of Object.entries(GROUPS)) {
  if (!only || only === name) await fn();
}
