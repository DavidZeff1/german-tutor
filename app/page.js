"use client";

import { useState, useRef, useEffect } from "react";
import TutorAvatar from "../components/TutorAvatar";
import RecordingIndicator from "../components/RecordingIndicator";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useProgress from "../hooks/useProgress";
import useApiKey from "../hooks/useApiKey";

const SCENARIOS = [
  { id: "free", name: "Free Chat", icon: "💬" },
  { id: "cafe", name: "Café", icon: "☕" },
  { id: "restaurant", name: "Restaurant", icon: "🍽️" },
  { id: "shopping", name: "Shopping", icon: "🛒" },
  { id: "travel", name: "Travel", icon: "🚂" },
  { id: "doctor", name: "Doctor", icon: "🏥" },
  { id: "phone", name: "Phone Call", icon: "📞" },
];

const LEVELS = ["A1", "A2", "B1", "B2"];

export default function GermanTutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [scenario, setScenario] = useState("free");
  const [level, setLevel] = useState("A1");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [showKeyInfo, setShowKeyInfo] = useState(false);

  const messagesEndRef = useRef(null);
  const { isSpeaking, speak, stopSpeaking } = useSpeechSynthesis(0.85);
  const { isListening, transcript, interimText, setTranscript, recordingDuration, startListening, stopListening } = useSpeechRecognition();
  const { xp, streak, addMessage, getLevel, getNextLevelXp } = useProgress();
  const { apiKey, saveApiKey, clearApiKey, isLoaded } = useApiKey();

  const currentLevel = getLevel();
  const progress = Math.round((xp / getNextLevelXp()) * 100);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSaveKey = () => {
    if (!keyInput.trim()) {
      setKeyError("Please enter an API key");
      return;
    }
    if (!keyInput.startsWith("sk-ant-")) {
      setKeyError("Invalid key format. Should start with sk-ant-");
      return;
    }
    saveApiKey(keyInput.trim());
    setKeyInput("");
    setKeyError("");
  };

  const startLesson = async () => {
    setHasStarted(true);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStart: true, scenario, level, apiKey }),
      });
      const data = await res.json();
      
      if (data.error === "Invalid API key") {
        clearApiKey();
        setHasStarted(false);
        setIsLoading(false);
        return;
      }
      
      if (data.error) throw new Error(data.error);
      setMessages([{ role: "assistant", content: data.message }]);
      if (autoSpeak) setTimeout(() => speak(data.message), 500);
    } catch {
      setMessages([{ role: "assistant", content: "Hallo! Connection error. Try again!" }]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (isListening) stopListening();

    const prevLevel = currentLevel;
    const userMessage = input.trim();
    setInput("");
    setTranscript("");
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    stopSpeaking();

    addMessage();
    if (getLevel() > prevLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, scenario, level, apiKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      if (autoSpeak) setTimeout(() => speak(data.message), 300);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error. Try again!" }]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endLesson = () => {
    stopSpeaking();
    if (isListening) stopListening();
    setMessages([]);
    setHasStarted(false);
    setInput("");
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      setInput("");
      startListening();
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // API Key Setup Screen
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg">
                <img 
                  src="https://api.dicebear.com/7.x/personas/svg?seed=Frau&backgroundColor=fef3c7&hair=long&hairColor=6b4423&mouth=smile&eyes=happy&skinColor=f5d0c5"
                  alt="Anna"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold">German Tutor</h1>
            <p className="text-gray-500 text-sm mt-1">Setup your API key to start</p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => { setKeyInput(e.target.value); setKeyError(""); }}
                placeholder="sk-ant-..."
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              {keyError && <p className="text-red-500 text-sm mt-1">{keyError}</p>}
            </div>

            <button
              onClick={handleSaveKey}
              className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
            >
              Save & Start
            </button>

            <button
              onClick={() => setShowKeyInfo(!showKeyInfo)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              {showKeyInfo ? "Hide instructions" : "How do I get an API key?"}
            </button>

            {showKeyInfo && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-3">
                <p className="font-medium text-gray-800">Get your Anthropic API key:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">console.anthropic.com</a></li>
                  <li>Sign up or log in</li>
                  <li>Go to <strong>API Keys</strong> in the sidebar</li>
                  <li>Click <strong>Create Key</strong></li>
                  <li>Copy the key (starts with <code className="bg-gray-200 px-1 rounded">sk-ant-</code>)</li>
                  <li>Paste it above</li>
                </ol>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Your key is stored locally in your browser only. It's never sent to our servers - it goes directly to Anthropic's API.
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    <strong>Cost:</strong> ~$0.01-0.03 per conversation. Anthropic gives new accounts $5 free credit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main app with API key set
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg">
                <img 
                  src="https://api.dicebear.com/7.x/personas/svg?seed=Frau&backgroundColor=fef3c7&hair=long&hairColor=6b4423&mouth=smile&eyes=happy&skinColor=f5d0c5"
                  alt="Anna"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Anna</h1>
            
            <div className="mt-2 flex items-center justify-center gap-3 text-sm">
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Lvl {currentLevel}</span>
              {streak > 0 && <span className="text-orange-500">🔥 {streak}</span>}
            </div>
            <div className="mt-2 w-32 mx-auto h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{xp} XP</p>
          </div>

          {/* Level */}
          <div className="mb-4">
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    level === l ? "bg-amber-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`p-3 rounded-xl text-center transition ${
                    scenario === s.id ? "bg-amber-100 ring-2 ring-amber-400" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="text-xl">{s.icon}</div>
                  <div className="text-xs mt-1 text-gray-600">{s.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startLesson}
            disabled={isLoading}
            className="w-full py-4 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition disabled:opacity-50"
          >
            {isLoading ? "Starting..." : "Start"}
          </button>

          <button
            onClick={clearApiKey}
            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600"
          >
            Change API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-2xl mx-auto">
      {showLevelUp && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          Level {currentLevel}!
        </div>
      )}

      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TutorAvatar isSpeaking={isSpeaking} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Anna</span>
                {scenario !== "free" && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                    {SCENARIOS.find(s => s.id === scenario)?.icon}
                  </span>
                )}
              </div>
              <span className={`text-xs ${isSpeaking ? "text-green-500" : "text-gray-400"}`}>
                {isSpeaking ? "Speaking..." : level}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium text-amber-600">Lvl {currentLevel}</span>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-lg border transition ${autoSpeak ? "bg-green-50 border-green-200" : ""}`}
            >
              {autoSpeak ? "🔊" : "🔇"}
            </button>
            <button onClick={endLesson} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
              End
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === "user" 
                ? "bg-amber-500 text-white rounded-br-sm" 
                : "bg-white shadow-sm border rounded-bl-sm"
            }`}>
              {msg.role === "assistant" && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Anna</span>
                  <div className="flex gap-1">
                    <button onClick={() => speak(msg.content, 0.6)} className="text-xs p-1 hover:bg-gray-100 rounded">🐢</button>
                    <button onClick={() => speak(msg.content)} className="text-sm p-1 hover:bg-gray-100 rounded">🔊</button>
                  </div>
                </div>
              )}
              <p className="whitespace-pre-wrap text-[15px]">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isSpeaking && (
        <div className="bg-amber-50 border-t border-amber-100 px-4 py-2 flex justify-center items-center gap-3">
          <div className="flex items-center gap-1">
            {[3, 5, 4, 5, 3].map((h, i) => (
              <div key={i} className="w-1 bg-amber-500 rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
          <button onClick={stopSpeaking} className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg">Stop</button>
        </div>
      )}

      {isListening && (
        <div className="bg-red-50 border-t border-red-100 px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-600 text-sm">Listening...</span>
          </div>
          <RecordingIndicator duration={recordingDuration} />
        </div>
      )}

      <div className="bg-white border-t p-4">
        {isListening && (transcript || interimText) && (
          <div className="mb-2 p-2 bg-gray-50 rounded-lg text-sm border border-dashed">
            <span>{transcript}</span>
            {interimText && <span className="text-gray-400 italic"> {interimText}</span>}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleMicClick}
            className={`p-3 rounded-xl border flex-shrink-0 transition ${
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {isListening ? "⏹️" : "🎤"}
          </button>
          <textarea
            value={isListening ? "" : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isListening ? "Speaking..." : "Type or speak..."}
            className={`flex-1 px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 ${isListening ? "bg-gray-100" : ""}`}
            rows={2}
            disabled={isListening}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 flex-shrink-0 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
