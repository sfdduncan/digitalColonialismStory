import whisper
import os


def transcribe_audio(file_path: str, model_size: str = "base") -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    print(f"Loading Whisper model ({model_size})...")
    model = whisper.load_model(model_size)

    print(f"Transcribing: {file_path}")
    result = model.transcribe(file_path)

    return result["text"]


def save_transcription(text: str, audio_path: str) -> str:
    base = os.path.splitext(audio_path)[0]
    output_path = base + ".txt"

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text.strip())

    return output_path


if __name__ == "__main__":
    audio_file = input("Enter the path to your audio file: ").strip()
    model_size = input("Enter model size (tiny/base/small/medium/large) [default: base]: ").strip() or "base"

    text = transcribe_audio(audio_file, model_size)
    output_file = save_transcription(text, audio_file)

    print(f"\n✅ Transcription complete!")
    print(f"📄 Saved to: {output_file}")
    print(f"\n--- Preview ---\n{text[:500]}{'...' if len(text) > 500 else ''}")