#!/usr/bin/env python3
# Clip audio from a video file by timestamp.
# Requires: ffmpeg  (https://ffmpeg.org/download.html)
# Usage: python clip_audio.py

import os
import subprocess
import sys


def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
    except FileNotFoundError:
        print("ffmpeg not found. Install it from https://ffmpeg.org/download.html")
        sys.exit(1)


def parse_timestamp(ts):
    """Accept HH:MM:SS or MM:SS format."""
    parts = ts.strip().split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    elif len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    else:
        raise ValueError(f"Invalid timestamp format: {ts}")


def clip(input_file, start, end, output_path):
    duration = end - start
    result = subprocess.run([
        "ffmpeg",
        "-ss", str(start),
        "-i", input_file,
        "-t", str(duration),
        "-vn",                  # audio only
        "-acodec", "libmp3lame",
        "-q:a", "2",            # high quality
        "-y",                   # overwrite without asking
        output_path,
    ], capture_output=True)
    if result.returncode != 0:
        print("ffmpeg error:")
        print(result.stderr.decode())
        return False
    return True


def main():
    check_ffmpeg()

    # Get input file
    input_file = input("Path to video or audio file: ").strip().strip('"')
    if not os.path.exists(input_file):
        print(f"File not found: {input_file}")
        sys.exit(1)

    base_name = os.path.splitext(os.path.basename(input_file))[0]
    output_dir = os.path.join(os.path.dirname(input_file), f"{base_name}_clips")
    os.makedirs(output_dir, exist_ok=True)

    clip_count = 1
    print(f"\nClips will be saved to: {output_dir}")
    print("Enter timestamps as MM:SS or HH:MM:SS (e.g. 18:17-18:38)")
    print("Type N to finish.\n")

    while True:
        entry = input(f"Clip {clip_count} timestamps (start-end) or N to quit: ").strip()

        if entry.lower() == "n":
            print(f"\nDone. {clip_count - 1} clip(s) saved to {output_dir}")
            break

        if "-" not in entry:
            print("Please use the format start-end, e.g. 18:17-18:38")
            continue

        try:
            start_str, end_str = entry.split("-", 1)
            start = parse_timestamp(start_str)
            end = parse_timestamp(end_str)
        except ValueError as e:
            print(f"Error: {e}")
            continue

        if end <= start:
            print("End time must be after start time.")
            continue

        label = input(f"Label for this clip (or press Enter for 'clip_{clip_count}'): ").strip()
        if not label:
            label = f"clip_{clip_count}"

        output_path = os.path.join(output_dir, f"{label}.mp3")
        print(f"Clipping {start_str} to {end_str}...")

        if clip(input_file, start, end, output_path):
            print(f"Saved: {output_path}\n")
            clip_count += 1
        else:
            print("Clip failed, try again.\n")


if __name__ == "__main__":
    main()
