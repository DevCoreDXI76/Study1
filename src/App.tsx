/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  X, 
  Maximize, 
  Type, 
  Zap, 
  Menu,
  ChevronRight,
  Monitor
} from 'lucide-react';

type Mode = 'INTRO' | 'SETUP' | 'RUN';

export default function App() {
  const [mode, setMode] = useState<Mode>('INTRO');
  const [script, setScript] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [scrollSpeed, setScrollSpeed] = useState(50); // 1-100
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(null);

  // Auto-scroll logic
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined && isPlaying) {
      const deltaTime = time - lastTimeRef.current;
      // speed adjustment: 1 is very slow, 100 is fast
      const velocity = (scrollSpeed / 100) * (fontSize / 20) * (deltaTime / 16.6); 
      setScrollPos((prev) => prev + velocity);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying, scrollSpeed, fontSize]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'RUN') {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsPlaying((prev) => !prev);
        } else if (e.code === 'Escape') {
          setMode('SETUP');
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  const handleStart = () => {
    if (!script.trim()) {
      alert('대본을 입력해주세요.');
      return;
    }
    setScrollPos(0);
    setMode('RUN');
    setIsPlaying(true);
  };

  const resetScroll = () => {
    setScrollPos(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-red-600/30 overflow-hidden">
      {/* Background News Motif */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full border-[40px] border-neutral-100/10" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-neutral-100" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-neutral-100" />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'INTRO' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-screen px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative mb-8"
            >
              <div className="absolute -inset-4 bg-red-600/20 blur-2xl rounded-full" />
              <Monitor className="w-20 h-20 text-red-600 relative z-10" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-black mb-6 tracking-tighter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Array.from("당신의 발표를 완벽하게").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.08, duration: 0.3 }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              className="text-neutral-400 text-lg mb-10 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              뉴스룸 스타일의 전문적인 프롬프트 서비스
            </motion.p>

            <motion.button
              id="intro-start-btn"
              onClick={() => setMode('SETUP')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-red-600 font-bold rounded-sm tracking-widest uppercase hover:bg-red-700 transition-colors flex items-center gap-2 group"
            >
              시스템 시작
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}

        {mode === 'SETUP' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 md:p-12 max-w-6xl mx-auto h-screen flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 text-white px-3 py-1 font-black text-sm tracking-tighter animate-pulse">
                  STATION LIVE
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase">프롬프트 설정</h2>
              </div>
              <div className="text-xs font-mono text-neutral-500 hidden md:block">
                SYS: ACTIVE_MODE_SETUP // V_1.0.4
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
              {/* Script Input */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-2">
                  <Menu className="w-3 h-3" /> 대본 입력 (다국어 지원)
                </label>
                <textarea
                  id="script-input"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="여기에 발표할 내용을 입력하세요..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 p-6 rounded-sm focus:outline-none focus:border-red-600 resize-none font-medium leading-relaxed text-lg transition-colors placeholder:text-neutral-700"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-8 bg-neutral-900/50 p-8 border border-neutral-800 rounded-sm">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-2">
                        <Type className="w-3 h-3" /> 글자 크기
                      </label>
                      <span className="font-mono text-red-600 font-bold">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-2">
                        <Zap className="w-3 h-3" /> 스크롤 속도
                      </label>
                      <span className="font-mono text-red-600 font-bold">{scrollSpeed}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={scrollSpeed}
                      onChange={(e) => setScrollSpeed(Number(e.target.value))}
                      className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <motion.button
                    id="setup-start-btn"
                    onClick={handleStart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-red-600 hover:bg-red-700 p-5 rounded-sm font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-colors"
                  >
                    프롬프트 시작
                    <Play className="w-5 h-5 fill-current" />
                  </motion.button>
                  <p className="text-[10px] text-neutral-600 text-center uppercase tracking-widest">
                    시작 후 Space Bar로 일시정지 가능
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'RUN' && (
          <motion.div
            key="run"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-screen bg-black w-full flex flex-col"
          >
            {/* Guide Lines */}
            <div className="absolute top-1/2 left-0 w-full h-24 -translate-y-1/2 border-y border-red-600/30 bg-red-600/5 pointer-events-none z-10 flex items-center">
              <div className="absolute left-4 w-4 h-4 bg-red-600 rotate-45" />
              <div className="absolute right-4 w-4 h-4 bg-red-600 rotate-45" />
            </div>

            {/* Scroll Container */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-hidden relative cursor-default"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <div 
                ref={textRef}
                style={{ 
                  transform: `translateY(-${scrollPos}px)`,
                  fontSize: `${fontSize}px`,
                  paddingTop: '45vh',
                  paddingBottom: '100vh'
                }}
                className="max-w-5xl mx-auto px-8 font-bold leading-[1.4] text-center"
              >
                {script.split('\n').map((line, i) => (
                  <div key={i} className="mb-8 last:mb-0 transition-opacity duration-300">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Controls Overlay */}
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-neutral-900 shadow-2xl shadow-black/50 border border-neutral-800 p-4 rounded-full flex items-center gap-6 z-20 backdrop-blur-md"
            >
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-red-600 rounded-full hover:bg-red-700 text-white transition-colors"
                title={isPlaying ? "일시정지 (Space)" : "재생 (Space)"}
              >
                {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
              </button>
              <div className="flex items-center gap-4 border-l border-neutral-800 pl-6 pr-2">
                <button 
                  onClick={resetScroll}
                  className="p-2 hover:text-red-500 transition-colors"
                  title="다시 시작"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setMode('SETUP')}
                  className="p-2 hover:text-red-500 transition-colors"
                  title="설정으로 돌아가기"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setMode('SETUP')}
                  className="p-2 hover:text-red-500 transition-colors"
                  title="종료 (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Status Bar */}
            <div className="bg-neutral-900 border-t border-neutral-800 p-2 text-[10px] uppercase font-bold tracking-[0.2em] flex items-center justify-between px-6 z-20">
              <div className="flex items-center gap-3">
                <span className="text-red-600 animate-pulse">● BROADCASTING</span>
                <span className="text-neutral-500">SPD: {scrollSpeed}</span>
                <span className="text-neutral-500">SZ: {fontSize}PX</span>
              </div>
              <div className="text-neutral-500">
                {isPlaying ? 'RUNNING' : 'PAUSED'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
