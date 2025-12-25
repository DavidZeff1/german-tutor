import { useState, useEffect, useRef } from "react";

export default function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const synthRef = useRef(null);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        const googleDeutsch = voices.find((v) => 
          v.name.toLowerCase().includes("google") && v.lang.startsWith("de")
        );
        if (googleDeutsch) {
          voiceRef.current = googleDeutsch;
          setVoiceReady(true);
        }
      };

      loadVoices();
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text) => {
    if (!text || !synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.lang = "de-DE";
    utterance.rate = 0.85;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  return {
    isSpeaking,
    speak,
    stopSpeaking,
    voiceReady,
  };
}
