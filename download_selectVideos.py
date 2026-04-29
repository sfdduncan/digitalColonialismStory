#!/usr/bin/env python3
# Download scholar audio clips as mp3.
# Requires: yt-dlp, ffmpeg  (pip install yt-dlp)

import os
import subprocess
import sys

OUTPUT_DIR = "downloads"

# All downloadable URLs (YouTube only — Studs Terkel blocked by Cloudflare)
# For Vine Deloria Jr., search archive.org for "Vine Deloria Studs Terkel 1975"
URLS = [
    # Scene 2 — Glen Sean Coulthard, SIS Antiracism Event Series (2021)
    # Use: before his argument about the underlying logic of colonial access
    ("Coulthard_SIS_Antiracism_2021", "https://www.youtube.com/watch?v=EGAiWAp0rhk"),

    # Scene 3 — Audra Simpson, Mohawk Interruptus IGOV lecture
    # Use: opens scene on refusal as political life
    ("Simpson_Mohawk_Interruptus_IGOV", "https://www.youtube.com/watch?v=FWzXHqGfH3U"),

    # Scene 4 — Nick Estes, Theory from the Margins talk on Our History is the Future
    # Use: before Standing Rock card, on resistance as tradition not reaction
    ("Estes_Theory_from_Margins", "https://www.youtube.com/watch?v=lT87HBpi0_M"),

    # Scene 6 — Glen Sean Coulthard, Fanonian Antinomies SFU (2017)
    # Use: opens Guacamaya scene, on land as site of resistance
    ("Coulthard_Fanonian_Antinomies_SFU_2017", "https://www.youtube.com/watch?v=UZE6HmN-RA0"),

    # Scene 7 — Nick Estes, On Civil Society talk
    # Use: before closing argument, on resistance as tradition and continuity
    ("Estes_On_Civil_Society", "https://www.youtube.com/watch?v=pbWDSzRljiE"),
]


def check_yt_dlp():
    try:
        subprocess.run(["yt-dlp", "--version"], capture_output=True, check=True)
    except FileNotFoundError:
        print("yt-dlp not found. Install it with: pip install yt-dlp")
        sys.exit(1)


def download(label, url):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\nDownloading: {label}")
    result = subprocess.run([
        "yt-dlp",
        "-x",
        "--audio-format", "mp3",
        "--output", f"{OUTPUT_DIR}/{label}.%(ext)s",
        "--no-playlist",
        "--progress",
        url,
    ])
    if result.returncode != 0:
        print(f"Failed: {label}")
    else:
        print(f"Saved: {OUTPUT_DIR}/{label}.mp3")


def main():
    check_yt_dlp()
    for label, url in URLS:
        download(label, url)
    print("\nAll done. Files saved to ./" + OUTPUT_DIR)
    print("\nNOTE: For Vine Deloria Jr. (Scene 1), the Studs Terkel archive is")
    print("blocked by Cloudflare. Search archive.org for 'Vine Deloria Studs Terkel 1975'")
    print("to find a freely downloadable version.")


if __name__ == "__main__":
    main()