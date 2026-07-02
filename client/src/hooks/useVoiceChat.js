import { useState, useRef, useEffect } from "react";

export function useVoiceChat(doctorVoiceConfig) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");
  const [error, setError] = useState("");
  
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = currentTranscript;
      setTranscript(currentTranscript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (error) return;
    transcriptRef.current = "";
    setTranscript("");
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      // already started
    }
  };

  const stopListening = () => {
    if (error || !recognitionRef.current) return transcriptRef.current;
    setIsListening(false);
    recognitionRef.current.stop();
    return transcriptRef.current;
  };

  const audioRef = useRef(null);

  const speak = async (text, onEndCallback, onPlayStart, voiceOverride) => {
    if (!text) return;
    
    // Cancel current speech if any
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    
    setIsSpeaking(true);
    
    try {
        const token = localStorage.getItem("token");
        const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "http://localhost:5000/api";
        const voice = voiceOverride || (typeof doctorVoiceConfig === "string" ? doctorVoiceConfig : "en-US-AriaNeural");
        
        // Direct stream URL via GET
        const url = `${baseUrl}/ai/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}&token=${token}`;
        
        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.onended = () => {
            setIsSpeaking(false);
            if (onEndCallback) onEndCallback();
        };
        
        audio.onerror = () => {
            setIsSpeaking(false);
        };
        
        // Resolve duration and start typing ONLY when audio is actively playing to sync text & voice
        if (onPlayStart) {
            audio.addEventListener("playing", () => {
                onPlayStart(audio.duration || text.length * 0.05);
            });
        }

        // Start playing immediately to minimize latency
        audio.play().catch(err => {
            console.error("Audio playback error:", err);
            setIsSpeaking(false);
        });
        
    } catch (err) {
        console.error("TTS Fetch error:", err);
        setIsSpeaking(false);
    }
  };
  
  const stopSpeaking = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
  }

  const clearTranscript = () => {
    transcriptRef.current = "";
    setTranscript("");
  };

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    clearTranscript,
    speak,
    stopSpeaking
  };
}
