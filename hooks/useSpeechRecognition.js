import { useState, useEffect, useRef, useCallback } from "react";

export default function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);

  const recognitionRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");

  const createRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = "de-DE"; // German - will still catch common English words

    recognition.onresult = (event) => {
      let interim = "";
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          final += text + " ";
          finalTranscriptRef.current = final;
        } else {
          interim += text;
        }
      }

      setTranscript(final.trim());
      setInterimText(interim);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      } else {
        setIsListening(false);
        setInterimText("");
        setRecordingDuration(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      
      isListeningRef.current = false;
      setIsListening(false);
      setInterimText("");
      setRecordingDuration(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };

    return recognition;
  }, []);

  useEffect(() => {
    recognitionRef.current = createRecognition();

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [createRecognition]);

  const startListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition();
      if (!recognitionRef.current) {
        alert("Speech recognition not supported. Please use Chrome.");
        return;
      }
    }

    setTranscript("");
    setInterimText("");
    finalTranscriptRef.current = "";
    setRecordingDuration(0);
    isListeningRef.current = true;
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (e) {
      recognitionRef.current = createRecognition();
      try {
        recognitionRef.current?.start();
      } catch (e2) {
        isListeningRef.current = false;
        setIsListening(false);
      }
    }

    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopListening = () => {
    isListeningRef.current = false;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    // Keep interim text
    if (interimText) {
      const final = (finalTranscriptRef.current + interimText).trim();
      setTranscript(final);
      finalTranscriptRef.current = final;
    }

    setInterimText("");
    setRecordingDuration(0);
    setIsListening(false);

    try {
      recognitionRef.current?.stop();
    } catch (e) {}
  };

  return {
    isListening,
    transcript,
    interimText,
    setTranscript,
    recordingDuration,
    startListening,
    stopListening,
  };
}
