export function slugifySpeech(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "word";
}

let currentAudio: HTMLAudioElement | null = null;

function speakWithWebSpeech(text: string, lang = "en-US"): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

async function speakWithEdgeTts(text: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/speech?text=${encodeURIComponent(text)}`);
    if (!response.ok) return false;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

export async function speak(text: string, lang = "en-US"): Promise<void> {
  if (typeof window === "undefined") return;

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const staticUrl = `/audio/${slugifySpeech(text)}.mp3`;
  try {
    const probe = await fetch(staticUrl, { method: "HEAD" });
    if (probe.ok) {
      const audio = new Audio(staticUrl);
      currentAudio = audio;
      await audio.play();
      return;
    }
  } catch {
    // segue para edge-tts ou fallback
  }

  const edgeOk = await speakWithEdgeTts(text);
  if (!edgeOk) {
    speakWithWebSpeech(text, lang);
  }
}

export function stopSpeaking(): void {
  if (typeof window === "undefined") return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
