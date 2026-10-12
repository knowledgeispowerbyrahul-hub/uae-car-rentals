const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = __dirname;

// SVG Favicon: Ultra-crisp scalable vector icon for modern browsers, dark/light tab compatible
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161f30"/>
      <stop offset="100%" stop-color="#080c14"/>
    </linearGradient>
    <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="45%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
    <linearGradient id="rimG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0.2"/>
    </linearGradient>
    <filter id="carGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#ea580c" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Squircle Base -->
  <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bgG)" stroke="url(#rimG)" stroke-width="1.8"/>

  <!-- Speed lines background -->
  <path d="M10 24h18M8 32h12M12 40h10" stroke="#f97316" stroke-width="1.2" stroke-linecap="round" opacity="0.22"/>

  <!-- Luxury Sports Car Vector Silhouette -->
  <g filter="url(#carGlow)">
    <!-- Aerodynamic Roof & Body -->
    <path d="M12 37c.8-3.2 3.2-5.8 6.5-6.8l6.2-4.5c2.6-1.9 5.8-2.7 9-2.2l7.2 1.1c2.8.4 5.2 2.2 6.3 4.8l2.5 5.8c3.2.6 5.3 2.4 5.3 5 0 2.6-2.2 4.2-5.5 4.2H17.5c-3.3 0-5.5-1.6-5.5-4.2 0-1.2.4-2.3 0-3.2z" fill="url(#goldG)"/>

    <!-- Cockpit Windshield & Windows -->
    <path d="M26.2 26.2l-4.2 4.2h15.2l-3.2-3.8c-1.8-1.2-4.8-1.5-7.8-.4z" fill="#080c14" opacity="0.9"/>
    <path d="M38.8 30.4h8.2l-1.8-3.4c-.8-1.4-2.2-2.3-3.8-2.5l-2.6-.3z" fill="#080c14" opacity="0.9"/>

    <!-- Front & Rear Wheels -->
    <circle cx="21" cy="42" r="5" fill="#080c14" stroke="#fb923c" stroke-width="2"/>
    <circle cx="21" cy="42" r="2" fill="#f97316"/>
    <circle cx="43" cy="42" r="5" fill="#080c14" stroke="#fb923c" stroke-width="2"/>
    <circle cx="43" cy="42" r="2" fill="#f97316"/>

    <!-- Headlight Beam -->
    <path d="M50 38.5l4-.8c1-.2 1.8.4 2 1.2v.2c-.2.8-1 1.4-2 1.2l-4-.8v-1z" fill="#fef08a"/>
  </g>

  <!-- Speed Wing Floor Trim -->
  <path d="M14 47.5h36" stroke="#fb923c" stroke-width="2.2" stroke-linecap="round" opacity="0.75"/>
</svg>`;

// Write SVG icons
fs.writeFileSync(path.join(ROOT, 'assets/img/favicon.svg'), svgIcon);
fs.writeFileSync(path.join(ROOT, 'favicon.svg'), svgIcon);
fs.writeFileSync(path.join(ROOT, 'assets/img/site-icon.svg'), svgIcon);

// Pure Node.js PNG encoder helper
function createPng(width, height, getPixel) {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixel(x, y, width, height);
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(raw);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([t, data]));
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc, 0);
    return Buffer.concat([len, t, data, c]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([header, chunk('IHDR', ihdr), chunk('IDAT', deflated), chunk('IEND', Buffer.alloc(0))]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Pixel shader for smooth squircle car badge
function renderBadgePixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const nx = (x - cx) / (w / 2);
  const ny = (y - cy) / (h / 2);

  // Rounded squircle distance
  const rPower = 4;
  const dist = Math.pow(Math.abs(nx), rPower) + Math.pow(Math.abs(ny), rPower);

  if (dist > 1.05) return [0, 0, 0, 0]; // transparent outside

  // Edge anti-aliasing
  const edgeAlpha = dist > 0.95 ? Math.max(0, Math.min(255, Math.round((1.05 - dist) / 0.1 * 255))) : 255;

  // Outer border rim
  if (dist > 0.85) {
    return [249, 115, 22, edgeAlpha]; // #f97316 accent border
  }

  // Dark luxury gradient interior
  const t = (x + y) / (w + h);
  let r = Math.round(18 * (1 - t) + 8 * t);
  let g = Math.round(26 * (1 - t) + 12 * t);
  let b = Math.round(40 * (1 - t) + 18 * t);

  // Car silhouette rendering
  const carY1 = h * 0.40;
  const carY2 = h * 0.72;
  const carX1 = w * 0.18;
  const carX2 = w * 0.82;

  if (y >= carY1 && y <= carY2 && x >= carX1 && x <= carX2) {
    const cyRel = (y - carY1) / (carY2 - carY1);
    const cxRel = (x - carX1) / (carX2 - carX1);

    // Aerodynamic profile curve
    const roofY = Math.sin(cxRel * Math.PI) * 0.6 + 0.2;
    if (1 - cyRel <= roofY) {
      // Golden metallic gradient on car body
      r = Math.round(251 * (1 - cyRel * 0.4));
      g = Math.round(146 * (1 - cyRel * 0.3));
      b = 40;

      // Wheel arches
      const wheel1Dist = Math.hypot(x - (carX1 + (carX2 - carX1) * 0.25), y - carY2);
      const wheel2Dist = Math.hypot(x - (carX1 + (carX2 - carX1) * 0.75), y - carY2);
      const wheelR = (carX2 - carX1) * 0.12;
      if (wheel1Dist < wheelR || wheel2Dist < wheelR) {
        r = 10; g = 14; b = 22;
        if (wheel1Dist < wheelR * 0.4 || wheel2Dist < wheelR * 0.4) {
          r = 251; g = 146; b = 60;
        }
      }
    }
  }

  // Accent baseline speed wing
  if (y >= h * 0.76 && y <= h * 0.80 && x >= w * 0.22 && x <= w * 0.78) {
    r = 249; g = 115; b = 22;
  }

  return [r, g, b, edgeAlpha];
}

const png32 = createPng(32, 32, renderBadgePixel);
const png180 = createPng(180, 180, renderBadgePixel);
const png512 = createPng(512, 512, renderBadgePixel);

fs.writeFileSync(path.join(ROOT, 'assets/img/favicon-32x32.png'), png32);
fs.writeFileSync(path.join(ROOT, 'assets/img/apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(ROOT, 'apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(ROOT, 'assets/img/site-icon.png'), png512);
fs.writeFileSync(path.join(ROOT, 'favicon.ico'), png32); // Valid PNG-based ICO / direct fallback

console.log('Successfully generated site icons & favicons:');
console.log('- assets/img/favicon.svg (Scalable vector)');
console.log('- favicon.svg (Root scalable vector)');
console.log('- assets/img/favicon-32x32.png (32x32 PNG)');
console.log('- assets/img/apple-touch-icon.png (180x180 PNG)');
console.log('- apple-touch-icon.png (Root Apple touch icon)');
console.log('- assets/img/site-icon.png (512x512 PNG)');
console.log('- favicon.ico (Root ICO)');
