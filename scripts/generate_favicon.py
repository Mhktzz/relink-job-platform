import zlib
import struct
import math

def create_relink_image(size=64):
    # Create RGBA buffer
    pixels = bytearray(size * size * 4)
    scale = size / 64.0

    # Draw transparent background
    for y in range(size):
        for x in range(size):
            # Main loop (around center (28*scale, 32*scale))
            dx = (x - 28 * scale)
            dy = (y - 32 * scale)
            dist = math.sqrt(dx * dx + dy * dy)
            angle = math.atan2(dy, dx)

            # Outer border for contrast on light mode
            in_outer_border = (11 * scale <= dist <= 25 * scale) and not (-0.4 < angle < 0.8)

            # Loop body: radius ~ 18*scale, thickness ~ 6*scale
            in_loop = (13 * scale <= dist <= 23 * scale) and not (-0.4 < angle < 0.8)

            # Hot pink dot/accent at (40*scale, 38*scale), radius 8*scale
            pdx = x - 40 * scale
            pdy = y - 38 * scale
            pdist = math.sqrt(pdx * pdx + pdy * pdy)
            in_pink = (pdist <= 9 * scale)

            idx = (y * size + x) * 4
            if in_pink:
                # Hot pink #FF3D8B -> (255, 61, 139)
                pixels[idx] = 255
                pixels[idx + 1] = 61
                pixels[idx + 2] = 139
                pixels[idx + 3] = 255
            elif in_loop:
                # Crisp White for clear visibility on dark tabs -> (255, 255, 255)
                pixels[idx] = 255
                pixels[idx + 1] = 255
                pixels[idx + 2] = 255
                pixels[idx + 3] = 255
            elif in_outer_border:
                # Subtle dark navy border for separation -> (15, 27, 61)
                pixels[idx] = 15
                pixels[idx + 1] = 27
                pixels[idx + 2] = 61
                pixels[idx + 3] = 180
            else:
                # Fully Transparent
                pixels[idx] = 0
                pixels[idx + 1] = 0
                pixels[idx + 2] = 0
                pixels[idx + 3] = 0

    return bytes(pixels)

def encode_png(width, height, rgba):
    png = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + ihdr_crc

    raw = b''
    for y in range(height):
        raw += b'\x00' + rgba[y * width * 4 : (y + 1) * width * 4]
    idat_data = zlib.compress(raw, 9)
    idat_crc = struct.pack('>I', zlib.crc32(b'IDAT' + idat_data) & 0xffffffff)
    png += struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data + idat_crc

    iend_crc = struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff)
    png += struct.pack('>I', 0) + b'IEND' + iend_crc
    return png

def make_ico(png_bytes, width, height):
    header = struct.pack('<HHH', 0, 1, 1)
    w = width if width < 256 else 0
    h = height if height < 256 else 0
    entry = struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, len(png_bytes), 6 + 16)
    return header + entry + png_bytes

def main():
    rgba32 = create_relink_image(32)
    png32 = encode_png(32, 32, rgba32)
    ico32 = make_ico(png32, 32, 32)

    with open('public/favicon.ico', 'wb') as f:
        f.write(ico32)

    print('Updated favicon.ico with high-contrast white loop & pink accent')

if __name__ == '__main__':
    main()
