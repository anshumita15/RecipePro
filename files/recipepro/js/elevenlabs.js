// elevenlabs.js – ElevenLabs Text-to-Speech and Speech Recognition

const ELEVENLABS_API_KEY = 'sk_8775fa6694771596a2c91226b707907615e8d0143b77387e';
const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // "Bella" – warm, friendly voice
const ELEVENLABS_TTS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;

let currentAudio = null;
let isSpeaking = false;

// ── Text-to-Speech ──────────────────────────────────────────────────────────
async function speakText(text) {
  // Stop any ongoing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    isSpeaking = false;
  }

  try {
    const response = await fetch(ELEVENLABS_TTS_URL, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs TTS error:', errText);
      // Fallback to browser speech
      browserSpeak(text);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);
    isSpeaking = true;

    currentAudio.onended = () => {
      isSpeaking = false;
      URL.revokeObjectURL(url);
    };

    currentAudio.onerror = () => {
      isSpeaking = false;
      browserSpeak(text);
    };

    await currentAudio.play();
  } catch (err) {
    console.error('TTS error, falling back to browser speech:', err);
    browserSpeak(text);
  }
}

function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    isSpeaking = false;
  }
  window.speechSynthesis?.cancel();
}

// Browser fallback TTS
function browserSpeak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 1.05;
  utter.volume = 1;
  window.speechSynthesis.speak(utter);
}

// ── Speech-to-Text (Web Speech API with ElevenLabs as primary) ─────────────
let recognition = null;
let isListening = false;
let onCommandCallback = null;

function initSpeechRecognition(onCommand) {
  onCommandCallback = onCommand;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Speech recognition not supported in this browser');
    return false;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    const lastResult = event.results[event.results.length - 1];
    if (lastResult.isFinal) {
      const transcripts = Array.from(lastResult)
        .map(alt => alt.transcript.toLowerCase().trim());

      console.log('Voice heard:', transcripts);
      processVoiceCommand(transcripts);
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech' || event.error === 'audio-capture') {
      // Silently restart
      if (isListening) {
        setTimeout(() => {
          if (isListening && recognition) recognition.start();
        }, 500);
      }
    }
  };

  recognition.onend = () => {
    if (isListening) {
      // Auto-restart
      setTimeout(() => {
        if (isListening && recognition) {
          try { recognition.start(); } catch(e) {}
        }
      }, 300);
    }
  };

  return true;
}

function processVoiceCommand(transcripts) {
  const COMMANDS = {
    next: ['next', 'next step', 'go next', 'move forward', 'forward'],
    previous: ['previous', 'previous step', 'go back', 'back', 'prior'],
    play: ['play', 'read', 'read step', 'read aloud', 'say it', 'speak', 'what does it say'],
    repeat: ['repeat', 'again', 'say again', 'repeat that', 'once more'],
    done: ['done', 'finish', 'finished', "i'm done", 'complete', 'end', 'stop cooking']
  };

  for (const transcript of transcripts) {
    for (const [command, triggers] of Object.entries(COMMANDS)) {
      if (triggers.some(t => transcript.includes(t))) {
        if (onCommandCallback) onCommandCallback(command, transcript);
        return;
      }
    }
  }

  // Unknown command – show feedback
  if (onCommandCallback) onCommandCallback('unknown', transcripts[0]);
}

function startListening() {
  if (!recognition) {
    const supported = initSpeechRecognition(onCommandCallback);
    if (!supported) return false;
  }
  if (!isListening) {
    isListening = true;
    try { recognition.start(); } catch(e) {}
  }
  return true;
}

function stopListening() {
  isListening = false;
  if (recognition) {
    try { recognition.stop(); } catch(e) {}
  }
}

function isCurrentlyListening() { return isListening; }
