import sys
from PIL import Image

def convert_to_rgb565(image_path, output_path, width=80):
    img = Image.open(image_path).convert('RGB')
    
    # Calculate aspect ratio
    w, h = img.size
    aspect = h / w
    height = int(width * aspect)
    
    img = img.resize((width, height), Image.Resampling.LANCZOS)
    w, h = img.size

    with open(output_path, 'w') as f:
        f.write("#ifndef ROVER_LOGO_H\n#define ROVER_LOGO_H\n\n")
        f.write("#include <pgmspace.h>\n\n")
        f.write(f"const int logo_width = {w};\n")
        f.write(f"const int logo_height = {h};\n\n")
        f.write("const uint16_t rover_logo[] PROGMEM = {\n")
        
        pixels = []
        for y in range(h):
            row = []
            for x in range(w):
                r, g, b = img.getpixel((x, y))
                # Convert to RGB565
                rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
                row.append(f"0x{rgb565:04X}")
            pixels.append(", ".join(row))
        
        f.write(",\n".join(pixels))
        f.write("\n};\n\n#endif\n")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_logo.py input.png output.h [width]")
        sys.exit(1)
    
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 80
    convert_to_rgb565(sys.argv[1], sys.argv[2], width)
    print(f"Converted {sys.argv[1]} to {sys.argv[2]} ({width}px width)")
