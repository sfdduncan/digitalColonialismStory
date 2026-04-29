#!/usr/bin/env python3
# Download a YouTube video as mp4.
# Requires: yt-dlp, ffmpeg  (pip install yt-dlp)

import os
import subprocess
import sys

OUTPUT_DIR = "downloads"


def check_yt_dlp():
    try:
        subprocess.run(["yt-dlp", "--version"], capture_output=True, check=True)
    except FileNotFoundError:
        print("yt-dlp not found. Install it with: pip install yt-dlp")
        sys.exit(1)


def download(url):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    result = subprocess.run([
        "yt-dlp",
        "--format",  "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "--output", f"{OUTPUT_DIR}/%(title)s.%(ext)s",
        "--no-playlist",
        "--quiet",
        "--progress",
        url,
    ])
    if result.returncode != 0:
        print("Download failed.")
    else:
        print(f"Saved to ./{OUTPUT_DIR}/")


def main():
    check_yt_dlp()
    url = input("YouTube URL: ").strip()
    if not url:
        print("No URL provided.")
        sys.exit(1)
    download(url)


if __name__ == "__main__":
    main()
