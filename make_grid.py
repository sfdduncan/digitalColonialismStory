#!/usr/bin/env python3
"""
Creates a 1920x1080 image grid from photos in a folder.
- Each image is center-cropped to a square
- Broken/unreadable images are skipped
- Grid is sized to fill as much of the canvas as possible
- Small gap between each photo
"""

import math
from pathlib import Path
from PIL import Image


def crop_to_square(img: Image.Image) -> Image.Image:
    """Center-crop an image to a square."""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def best_grid(n: int, canvas_width: int, canvas_height: int, padding: int):
    """Find the cols/rows layout that maximises square cell size."""
    best_cols, best_rows, best_cell = 1, n, 1

    for cols in range(1, n + 1):
        rows = math.ceil(n / cols)
        cell = min(
            (canvas_width - padding * (cols + 1)) // cols,
            (canvas_height - padding * (rows + 1)) // rows,
        )
        if cell > best_cell:
            best_cell = cell
            best_cols = cols
            best_rows = rows

    return best_cols, best_rows, best_cell


def make_grid(
    input_folder: str,
    output_file: str = "grid_output.jpg",
    canvas_width: int = 1920,
    canvas_height: int = 1080,
    padding: int = 6,
    bg_color: tuple = (255, 255, 255),
):
    supported = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".gif"}
    folder = Path(input_folder)

    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: '{input_folder}'")

    image_paths = sorted(
        p for p in folder.iterdir() if p.suffix.lower() in supported
    )

    if not image_paths:
        raise ValueError(f"No supported images found in '{input_folder}'.")

    # Load images, silently skip any that are broken
    print(f"\nLoading images from '{input_folder}'...")
    images = []
    for path in image_paths:
        try:
            img = Image.open(path)
            img.verify()                           # detect corrupt files
            img = Image.open(path).convert("RGB")  # re-open after verify
            images.append((path.name, img))
            print(f"  OK  {path.name}")
        except Exception as e:
            print(f"  SKIP  {path.name}  ({e})")

    n = len(images)
    if n == 0:
        raise ValueError("No valid images could be loaded.")

    print(f"\n{n} valid image(s) ready.")

    # Find the layout that best fills the canvas
    cols, rows, cell_size = best_grid(n, canvas_width, canvas_height, padding)

    # Centre the entire grid on the canvas
    grid_w = cols * cell_size + padding * (cols + 1)
    grid_h = rows * cell_size + padding * (rows + 1)
    origin_x = (canvas_width - grid_w) // 2
    origin_y = (canvas_height - grid_h) // 2

    print(f"Layout : {cols} cols x {rows} rows")
    print(f"Cell   : {cell_size}x{cell_size} px  |  Gap: {padding} px")

    canvas = Image.new("RGB", (canvas_width, canvas_height), bg_color)

    for idx, (name, img) in enumerate(images):
        row = idx // cols
        col = idx % cols

        x = origin_x + padding + col * (cell_size + padding)
        y = origin_y + padding + row * (cell_size + padding)

        thumb = crop_to_square(img).resize((cell_size, cell_size), Image.LANCZOS)
        canvas.paste(thumb, (x, y))
        print(f"  [{idx + 1}/{n}] {name}")

    canvas.save(output_file, quality=95)
    print(f"\nDone! Grid saved to '{output_file}'  ({canvas_width}x{canvas_height} px)")


if __name__ == "__main__":
    print("=== Photo Grid Maker (1920x1080) ===\n")

    input_folder = input("Enter the path to your images folder:\n> ").strip().strip('"').strip("'")

    output_file = input("\nEnter output filename (press Enter for 'grid_output.jpg'):\n> ").strip()
    if not output_file:
        output_file = "grid_output.jpg"

    make_grid(
        input_folder=input_folder,
        output_file=output_file,
    )