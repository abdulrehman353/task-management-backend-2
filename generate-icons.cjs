const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Beautiful Emerald Gradient + TaskFlow layers icon generator
function createStyledPng(width, height) {
  const rowLength = width * 4 + 1;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None
    
    // Normalized y ratio for vertical gradient
    const yRatio = y / height;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Normalized coordinates from -1 to 1
      const nx = (x / width) * 2 - 1;
      const ny = (y / height) * 2 - 1;

      // Rounded squircle app icon base
      const cornerRadius = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);

      if (cornerRadius <= 0.88) {
        // Deep emerald background gradient (#047857 to #064e3b)
        let r = Math.round(5 - yRatio * 2);
        let g = Math.round(150 - yRatio * 60);
        let b = Math.round(105 - yRatio * 40);

        // Draw 3 Stacked Task Flow Layers in white/emerald-light
        let isLogoPixel = false;

        const checkDiamond = (cx, cy, rx, ry) => {
          return Math.abs(x - cx) / rx + Math.abs(y - cy) / ry <= 1.0;
        };

        const midX = width / 2;
        const iconSizeX = width * 0.28;
        const iconSizeY = height * 0.11;

        // Layer 1 (Top)
        if (checkDiamond(midX, height * 0.38, iconSizeX, iconSizeY)) {
          isLogoPixel = true;
        }
        // Layer 2 (Middle)
        else if (checkDiamond(midX, height * 0.50, iconSizeX, iconSizeY) && 
                !checkDiamond(midX, height * 0.46, iconSizeX * 0.85, iconSizeY * 0.85)) {
          isLogoPixel = true;
        }
        // Layer 3 (Bottom)
        else if (checkDiamond(midX, height * 0.62, iconSizeX, iconSizeY) && 
                !checkDiamond(midX, height * 0.58, iconSizeX * 0.85, iconSizeY * 0.85)) {
          isLogoPixel = true;
        }

        if (isLogoPixel) {
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Transparent border outside squircle
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // CRC32 calculations
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const publicDir = path.join(__dirname, 'public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createStyledPng(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createStyledPng(512, 512));

console.log('✨ Stylish TaskFlow PWA Icons generated successfully in public/ folder!');