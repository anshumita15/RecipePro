export class VoiceService {
  private recognition: any;
  private isListening: boolean = false;
  private audio: HTMLAudioElement | null = null;

  constructor(private onCommand: (command: string) => void) {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.toLowerCase().trim();
        console.log("Heard:", text);
        
        // Use regex for more flexible command matching
        if (/\b(next|continue|forward)\b/.test(text)) {
          this.playConfirmation();
          this.onCommand("next");
        } else if (/\b(play|read|start)\b/.test(text)) {
          this.playConfirmation();
          this.onCommand("play");
        } else if (/\b(repeat|again|say that again)\b/.test(text)) {
          this.playConfirmation();
          this.onCommand("repeat");
        } else if (/\b(previous|back|go back)\b/.test(text)) {
          this.playConfirmation();
          this.onCommand("previous");
        } else if (/\b(done|finish|stop|exit)\b/.test(text)) {
          this.playConfirmation();
          this.onCommand("done");
        }
      };

      this.recognition.onend = () => {
        console.log("Speech recognition ended");
        // Auto-restart if we are still supposed to be listening
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Ignore if already started
            if (e.name !== 'InvalidStateError') {
              console.error("Failed to restart recognition:", e);
            }
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'aborted') {
          console.log("Speech recognition aborted (expected during stop/restart)");
          return;
        }
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          this.isListening = false;
        }
      };
    }
  }

  async speak(text: string): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        let errorMessage = "TTS failed";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || 
                           (typeof errorData.detail === 'string' ? errorData.detail : errorData.detail?.message) || 
                           errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch (e) {
          console.warn("Failed to parse TTS error response", e);
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      this.audio = new Audio(url);
      
      return new Promise((resolve, reject) => {
        this.audio!.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        this.audio!.onerror = (e) => reject(e);
        this.audio!.play().catch(reject);
      });
    } catch (error) {
      console.error("VoiceService speak error:", error);
      // Fallback to browser TTS if ElevenLabs fails
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    }
  }

  stopSpeaking() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    window.speechSynthesis.cancel();
  }

  playConfirmation() {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    
    oscillator.connect(gain);
    gain.connect(context.destination);
    
    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
