import { useState, useEffect } from "react";

export default function useProgress() {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [todayMessages, setTodayMessages] = useState(0);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("german-tutor-progress");
    if (saved) {
      const data = JSON.parse(saved);
      setXp(data.xp || 0);
      setStreak(data.streak || 0);
      
      // Check if last session was today
      const lastDate = data.lastDate;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastDate === today) {
        setTodayMessages(data.todayMessages || 0);
      } else if (lastDate === yesterday) {
        // Keep streak, reset today's messages
        setTodayMessages(0);
      } else if (lastDate) {
        // Streak broken
        setStreak(0);
        setTodayMessages(0);
      }
    }
  }, []);

  const addMessage = () => {
    const newXp = xp + 10;
    const newTodayMessages = todayMessages + 1;
    const today = new Date().toDateString();
    
    // First message of the day = streak +1
    const newStreak = todayMessages === 0 ? streak + 1 : streak;

    setXp(newXp);
    setTodayMessages(newTodayMessages);
    setStreak(newStreak);

    localStorage.setItem("german-tutor-progress", JSON.stringify({
      xp: newXp,
      streak: newStreak,
      todayMessages: newTodayMessages,
      lastDate: today,
    }));

    return { xp: newXp, streak: newStreak, todayMessages: newTodayMessages };
  };

  const getLevel = () => {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    if (xp < 2500) return 6;
    if (xp < 4000) return 7;
    if (xp < 6000) return 8;
    if (xp < 9000) return 9;
    return 10;
  };

  const getNextLevelXp = () => {
    const thresholds = [100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000, 99999];
    return thresholds[getLevel() - 1];
  };

  return { xp, streak, todayMessages, addMessage, getLevel, getNextLevelXp };
}
