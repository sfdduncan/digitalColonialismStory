#!/usr/bin/env python3
"""
video_fade_merge.py
Collects video/image paths from the user in order, then stitches them together
with a cross-fade transition between each clip using ffmpeg.

Each clip plays its full CLIP_LENGTH (5s), then fades into the next over
fade_dur seconds — the fade time is extra, not subtracted from the content.

Images are automatically converted to a video clip before merging.
Supported image formats: jpg, jpeg, png, gif, bmp, webp, tiff
"""

import os
import sys
import subprocess
import shutil
import tempfile

# ── constants ─────────────────────────────────────────────────────────────────

IMAGE_EXTS  = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".tif"}
VIDEO_EXTS  = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v", ".flv", ".wmv"}
CLIP_LENGTH = 5.0   # seconds of visible content per clip (video or image)


# ── helpers ───────────────────────────────────────────────────────────────────

def is_image(path: str) -> bool:
    return os.path.splitext(path)[1].lower() in IMAGE_EXTS


def is_video(path: str) -> bool:
    return os.path.splitext(path)[1].lower() in VIDEO_EXTS


def get_video_duration(path: str) -> float:
    """Return duration of a video file in seconds via ffprobe."""
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            path,
        ],
        capture_output=True, text=True, check=True,
    )
    return float(result.stdout.strip())


def get_video_resolution(path: str) -> tuple[int, int]:
    """Return (width, height) of the first video stream."""
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=p=0",
            path,
        ],
        capture_output=True, text=True, check=True,
    )
    w, h = result.stdout.strip().split(",")
    return int(w), int(h)


def image_to_video(image_path: str, resolution: tuple[int, int],
                   tmpdir: str, index: int, fade_dur: float) -> str:
    """
    Convert a static image to an MP4 clip.
    Total duration = CLIP_LENGTH + fade_dur so the full CLIP_LENGTH of content
    plays before the fade overlap begins.
    """
    w, h = resolution
    out_path = os.path.join(tmpdir, f"img_clip_{index:03d}.mp4")
    total = CLIP_LENGTH + fade_dur

    vf = (
        f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
        f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black"
    )
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", image_path,
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-vf", vf,
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k",
        "-t", str(total),
        "-pix_fmt", "yuv420p",
        "-r", "30",
        out_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"\n✗  Failed to convert image: {image_path}")
        print(result.stderr[-2000:])
        sys.exit(1)
    return out_path


def normalise_clip(video_path: str, resolution: tuple[int, int],
                   tmpdir: str, index: int, fade_dur: float) -> str:
    """
    Re-encode a video to a consistent resolution/fps/codec.
    Total duration = CLIP_LENGTH + fade_dur so the full CLIP_LENGTH of content
    plays before the fade overlap begins.
    """
    w, h = resolution
    out_path = os.path.join(tmpdir, f"norm_clip_{index:03d}.mp4")
    total = CLIP_LENGTH + fade_dur

    vf = (
        f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
        f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black"
    )
    cmd = [
        "ffmpeg", "-y",
        "-stream_loop", "-1",   # loop input so short clips never run out
        "-i", video_path,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k",
        "-t", str(total),
        "-pix_fmt", "yuv420p",
        "-r", "30",
        out_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"\n✗  Failed to normalise clip: {video_path}")
        print(result.stderr[-2000:])
        sys.exit(1)
    return out_path


# ── prompts ───────────────────────────────────────────────────────────────────

def prompt_for_clips() -> list[str]:
    """Interactively collect video/image paths from the user."""
    print("\n┌──────────────────────────────────────────────┐")
    print("│        Video Fade-Merge Tool                  │")
    print("│  Supports: videos + images (jpg/png/webp/…)   │")
    print("└──────────────────────────────────────────────┘")
    print("Enter file paths one at a time (videos or images, in order).")
    print(f"Every clip plays for {CLIP_LENGTH}s, then fades into the next.")
    print("Press ENTER on an empty line when done (min 2 files).\n")

    clips: list[str] = []
    while True:
        idx = len(clips) + 1
        raw = input(f"  Clip {idx} path (or ENTER to finish): ").strip().strip("'\"")

        if raw == "":
            if len(clips) < 2:
                print("  ⚠  Please add at least 2 files before finishing.\n")
                continue
            break

        path = os.path.expanduser(raw)
        if not os.path.isfile(path):
            print(f"  ✗  File not found: {path}\n")
            continue

        ext = os.path.splitext(path)[1].lower()
        if ext not in IMAGE_EXTS and ext not in VIDEO_EXTS:
            all_exts = ", ".join(sorted(IMAGE_EXTS | VIDEO_EXTS))
            print(f"  ✗  Unrecognised file type '{ext}'.\n"
                  f"     Supported: {all_exts}\n")
            continue

        kind = "image 🖼 " if is_image(path) else "video 🎬"
        clips.append(path)
        print(f"  ✓  Added {kind} ({len(clips)} total)\n")

    return clips


def prompt_settings() -> tuple[float, str]:
    """Ask for fade duration and output path."""
    print()
    raw_fade = input("Fade duration in seconds [default 1.0]: ").strip()
    fade_dur = float(raw_fade) if raw_fade else 1.0

    raw_out  = input("Output file path [default: output.mp4]: ").strip().strip("'\"")
    out_path = os.path.expanduser(raw_out) if raw_out else "output.mp4"

    return fade_dur, out_path


# ── filter builder ────────────────────────────────────────────────────────────

def build_crossfade_filter(n: int, fade_dur: float) -> tuple[str, str, str]:
    """
    Build an ffmpeg filtergraph that cross-fades N clips sequentially.

    Each clip has been encoded to CLIP_LENGTH + fade_dur seconds.
    The xfade offset is set to CLIP_LENGTH so the fade starts only after the
    full content plays, then advances by CLIP_LENGTH per clip.

    Returns (filter_complex_str, final_video_label, final_audio_label).
    """
    filter_parts: list[str] = []
    cur_v  = "[0:v]"
    cur_a  = "[0:a]"
    offset = CLIP_LENGTH   # fade starts after the full content of clip 0

    for i in range(1, n):
        out_v = f"[v{i}]"
        out_a = f"[a{i}]"

        filter_parts.append(
            f"{cur_v}[{i}:v]xfade=transition=fade"
            f":duration={fade_dur}:offset={offset:.6f}{out_v}"
        )
        filter_parts.append(
            f"{cur_a}[{i}:a]acrossfade=d={fade_dur}{out_a}"
        )

        cur_v   = out_v
        cur_a   = out_a
        offset += CLIP_LENGTH   # next fade starts after another full clip

    return ";".join(filter_parts), cur_v, cur_a


# ── main merge ────────────────────────────────────────────────────────────────

def merge_clips(clips: list[str], fade_dur: float, output: str) -> None:
    n = len(clips)
    print(f"\n⏳  Preparing {n} clips …")

    # Use the first video's resolution as reference; fall back to 1920×1080
    reference_res: tuple[int, int] = (1920, 1080)
    for c in clips:
        if is_video(c):
            reference_res = get_video_resolution(c)
            break

    tmpdir = tempfile.mkdtemp(prefix="fade_merge_")
    try:
        prepared: list[str] = []

        for i, path in enumerate(clips):
            name = os.path.basename(path)
            if is_image(path):
                print(f"  → Converting image  [{i+1}/{n}]: {name}"
                      f"  ({CLIP_LENGTH}s + {fade_dur}s fade padding)")
                clip = image_to_video(path, reference_res, tmpdir, i, fade_dur)
            else:
                vw, vh = get_video_resolution(path)
                extra  = f"  ({vw}×{vh} → {reference_res[0]}×{reference_res[1]}, " \
                         f"trimmed to {CLIP_LENGTH}s + {fade_dur}s fade padding)"
                print(f"  → Normalising video [{i+1}/{n}]: {name}{extra}")
                clip = normalise_clip(path, reference_res, tmpdir, i, fade_dur)
            prepared.append(clip)

        filter_complex, final_v, final_a = build_crossfade_filter(n, fade_dur)

        inputs: list[str] = []
        for p in prepared:
            inputs += ["-i", p]

        cmd = [
            "ffmpeg", "-y",
            *inputs,
            "-filter_complex", filter_complex,
            "-map", final_v,
            "-map", final_a,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "20",
            "-c:a", "aac",
            "-b:a", "192k",
            output,
        ]

        print("\n⚙️   Running ffmpeg …\n")
        result = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)

        if result.returncode != 0:
            print("✗  ffmpeg failed. Error output:\n")
            print(result.stderr[-3000:])
            sys.exit(1)

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

    size_mb = os.path.getsize(output) / 1_048_576
    print(f"\n✅  Done!  →  {output}  ({size_mb:.1f} MB)")


# ── entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            sys.exit(f"Error: '{tool}' not found. Please install ffmpeg.")

    clips            = prompt_for_clips()
    fade_dur, output = prompt_settings()
    merge_clips(clips, fade_dur, output)


if __name__ == "__main__":
    main()