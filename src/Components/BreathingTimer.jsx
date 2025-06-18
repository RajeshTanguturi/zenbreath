import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Palette } from 'lucide-react';

const BreathingTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [countdown, setCountdown] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const themeButtonRef = useRef(null);
  const themeSelectorRef = useRef(null);

  const themes = [
    { name: 'Deep Calm', gradient: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' },
    { name: 'Sky Meditation', gradient: 'bg-gradient-to-tl from-blue-800 via-sky-700 to-cyan-600' },
    { name: 'Inner Peace', gradient: 'bg-gradient-to-br from-teal-900 via-indigo-900 to-rose-900' },
    { name: 'Sunrise Tranquility', gradient: 'bg-gradient-to-tr from-rose-800 via-pink-700 to-amber-600' },
    { name: 'Lavender Mist', gradient: 'bg-gradient-to-r from-violet-900 via-purple-800 to-pink-700' },
    { name: 'Ocean Breath', gradient: 'bg-gradient-to-b from-cyan-900 via-blue-900 to-indigo-800' },
    { name: 'Forest Zen', gradient: 'bg-gradient-to-r from-green-900 via-emerald-800 to-teal-700' },
    { name: 'Midnight Dark', gradient: 'bg-gradient-to-br from-gray-900 via-black to-gray-800' },
  ];

  // Handle outside clicks for theme selector
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showThemeSelector &&
          themeButtonRef.current && 
          themeSelectorRef.current &&
          !themeButtonRef.current.contains(event.target) && 
          !themeSelectorRef.current.contains(event.target)) {
        setShowThemeSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showThemeSelector]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playSound = (frequency = 440, duration = 200) => {
    if (!soundEnabled || !audioContextRef.current) return;
    try {
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration / 1000);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);

      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  const getPhaseConfig = (currentPhase) => {
    switch (currentPhase) {
      case 'inhale': return { duration: 4, next: 'hold', color: 'bg-blue-500', sound: 523 };
      case 'hold': return { duration: 7, next: 'exhale', color: 'bg-yellow-500', sound: 659 };
      case 'exhale': return { duration: 8, next: 'inhale', color: 'bg-green-500', sound: 392 };
      default: return { duration: 4, next: 'hold', color: 'bg-blue-500', sound: 523 };
    }
  };

  const startTimer = async () => {
    if (audioContextRef.current?.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (err) {
        console.error(err);
      }
    }
    setIsRunning(true);
    setPhase('inhale');
    setCountdown(4);
    setCycleCount(0);
  };

  const stopTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setPhase('inhale');
    setCountdown(4);
    setCycleCount(0);
  };

  const toggleSound = () => setSoundEnabled(!soundEnabled);
  const toggleThemeSelector = () => setShowThemeSelector(!showThemeSelector);

  const selectTheme = (themeIndex) => {
    setCurrentTheme(themeIndex);
    setShowThemeSelector(false);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCountdown((prevCountdown) => {
          const newCountdown = prevCountdown - 0.1;

          if (newCountdown <= 0) {
            const currentConfig = getPhaseConfig(phase);
            if (soundEnabled) playSound(currentConfig.sound, 300);
            const nextPhase = currentConfig.next;
            const nextConfig = getPhaseConfig(nextPhase);
            setPhase(nextPhase);
            if (phase === 'exhale') setCycleCount((prev) => prev + 1);
            return nextConfig.duration;
          }

          return newCountdown;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, phase, soundEnabled]);

  const currentConfig = getPhaseConfig(phase);
  const progress = ((currentConfig.duration - countdown) / currentConfig.duration) * 100;
  const displayCountdown = Math.ceil(countdown);

  return (
    <div className={`min-h-screen ${themes[currentTheme].gradient} flex items-center justify-center p-4 relative`}>
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">4-7-8 Breathing</h1>
          <p className="text-white/70 mb-6">Inhale for 4, hold for 7, exhale for 8</p>

          {/* Theme Selector */}
          <div className="relative mb-6">
            <button
              ref={themeButtonRef}
              onClick={toggleThemeSelector}
              className="bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-full transition-all duration-200 text-sm flex items-center gap-2 mx-auto"
              title="Change Theme"
            >
              <Palette size={16} />
              {themes[currentTheme].name}
            </button>

            {showThemeSelector && (
              <div 
                ref={themeSelectorRef}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/20 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 z-50"
              >
                <div className="grid grid-cols-2 gap-3 min-w-72">
                  {themes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => selectTheme(index)}
                      className={`relative p-3 rounded-xl transition-all duration-200 text-sm font-medium overflow-hidden ${currentTheme === index
                          ? 'ring-2 ring-white/70 ring-offset-2'
                          : 'hover:ring-2 hover:ring-white/40 ring-offset-2'
                        }`}
                    >
                      <div className={`absolute inset-0 ${theme.gradient} opacity-80`} />
                      <div className="relative z-10 bg-black/30 backdrop-blur-sm rounded-lg p-2">
                        <span className="text-white text-xs font-medium">{theme.name}</span>
                      </div>
                      {currentTheme === index && (
                        <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full z-20" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cycle Counter */}
          <div className="text-white/80 mb-6">
            <span className="text-sm">Cycles completed: </span>
            <span className="text-lg font-semibold">{cycleCount}</span>
          </div>

          {/* Breathing Circle */}
          <div className="relative mb-8">
            <div className="w-48 h-48 mx-auto rounded-full border-4 border-white/30 relative overflow-hidden">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out ${currentConfig.color} opacity-20`}
                style={{ transform: `scale(${isRunning ? 0.3 + (progress / 100) * 0.7 : 0.3})` }}
              />
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - Math.max(0, Math.min(100, progress)) / 100)}`}
                  style={{ transition: countdown <= 0.1 ? 'none' : 'stroke-dashoffset 100ms ease-out' }}
                />
              </svg>
              <div
                className={`absolute inset-8 rounded-full transition-all ease-in-out ${currentConfig.color} opacity-10`}
                style={{
                  transform: `scale(${isRunning ? 0.5 + Math.sin((progress / 100) * Math.PI) * 0.3 : 0.5})`,
                  transitionDuration: '1000ms',
                }}
              />
              <div className="absolute inset-4 bg-white/5 rounded-full flex flex-col items-center justify-center backdrop-blur-sm border border-white/10">
                <div className="text-white text-xl font-bold mb-1 capitalize">{phase}</div>
                <div className="text-white text-4xl font-bold">{displayCountdown}</div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-white/80 mb-6 text-sm">
            {phase === 'inhale' && 'Breathe in slowly through your nose'}
            {phase === 'hold' && 'Hold your breath'}
            {phase === 'exhale' && 'Exhale slowly through your mouth'}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={isRunning ? stopTimer : startTimer}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full transition-all duration-200 flex items-center gap-2 font-semibold"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? 'Stop' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="bg-white/15 hover:bg-white/25 text-white w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={toggleSound}
              className={`${soundEnabled ? 'bg-green-500/30 hover:bg-green-500/40' : 'bg-red-500/30 hover:bg-red-500/40'} text-white w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center`}
              title={soundEnabled ? 'Sound On' : 'Sound Off'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          {/* Phase Indicator */}
          <div className="flex justify-center gap-2">
            {['inhale', 'hold', 'exhale'].map((p) => (
              <div
                key={p}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${phase === p ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingTimer;