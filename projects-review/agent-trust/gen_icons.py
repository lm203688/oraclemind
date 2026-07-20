"""
Generate simple tab bar icons for WeChat Mini Program.
Creates 8 minimal PNG icons (4 normal + 4 active) at 81x81px.
"""
import struct
import zlib
import os

def create_png(width, height, rgba_pixels):
    """Create a PNG file from RGBA pixel data."""
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)

    # IDAT - raw pixel data with filter byte per row
    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter type 0 (none)
        for x in range(width):
            idx = (y * width + x) * 4
            raw += bytes(rgba_pixels[idx:idx+4])
    idat = zlib.compress(raw)

    # IEND
    iend = b''

    return sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', iend)

def draw_icon(size, color, icon_type):
    """Draw a simple icon centered on transparent background."""
    pixels = [0] * (size * size * 4)  # transparent

    cx, cy = size // 2, size // 2
    r, g, b = color

    for y in range(size):
        for x in range(size):
            idx = (y * size + x) * 4
            dx, dy = x - cx, y - cy
            dist = (dx*dx + dy*dy) ** 0.5

            if icon_type == 'dashboard':
                # Grid icon: 2x2 rounded squares
                sq_size = size // 5
                in_sq1 = abs(dx + size//5) < sq_size and abs(dy + size//5) < sq_size
                in_sq2 = abs(dx - size//5) < sq_size and abs(dy + size//5) < sq_size
                in_sq3 = abs(dx + size//5) < sq_size and abs(dy - size//5) < sq_size
                in_sq4 = abs(dx - size//5) < sq_size and abs(dy - size//5) < sq_size
                if in_sq1 or in_sq2 or in_sq3 or in_sq4:
                    pixels[idx:idx+4] = [r, g, b, 255]

            elif icon_type == 'agent':
                # Robot icon: circle head + body
                head_r = size // 4
                body_w = size // 3
                body_h = size // 4
                in_head = dist < head_r
                in_body = abs(dx) < body_w and 0 < dy < body_h
                if in_head or in_body:
                    pixels[idx:idx+4] = [r, g, b, 255]

            elif icon_type == 'tx':
                # Transaction icon: arrow
                arrow_w = size // 6
                arrow_h = size // 3
                in_arrow = abs(dx) < arrow_w and abs(dy) < arrow_h
                # Arrow head
                in_head = dy < -size//6 and abs(dx) < size//4 + dy + size//6
                if in_arrow or in_head:
                    pixels[idx:idx+4] = [r, g, b, 255]

            elif icon_type == 'profile':
                # Person icon: circle head + shoulders
                head_r = size // 5
                in_head = dist < head_r and dy < 0
                in_body = dy > 0 and dist < size//3
                if in_head or in_body:
                    pixels[idx:idx+4] = [r, g, b, 255]

    return pixels

def main():
    static_dir = os.path.join(os.path.dirname(__file__), 'miniprogram', 'static')
    os.makedirs(static_dir, exist_ok=True)

    size = 81
    normal_color = (102, 102, 102)   # #666666
    active_color = (255, 107, 53)    # #ff6b35

    icons = ['dashboard', 'agent', 'tx', 'profile']

    for icon in icons:
        # Normal (gray)
        pixels = draw_icon(size, normal_color, icon)
        png_data = create_png(size, size, pixels)
        with open(os.path.join(static_dir, f'tab-{icon}.png'), 'wb') as f:
            f.write(png_data)

        # Active (orange)
        pixels = draw_icon(size, active_color, icon)
        png_data = create_png(size, size, pixels)
        with open(os.path.join(static_dir, f'tab-{icon}-active.png'), 'wb') as f:
            f.write(png_data)

        print(f'  Generated: tab-{icon}.png, tab-{icon}-active.png')

    print(f'\nAll 8 icons generated in {static_dir}')

if __name__ == '__main__':
    main()
