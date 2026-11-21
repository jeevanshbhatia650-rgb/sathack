'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  Download,
  GitBranch,
  Server,
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
  Paperclip,
  Send,
  Sparkles,
  ChevronDown,
  Copy,
  Check,
  Zap,
  Radio,
  Sliders,
  X,
  FileCode,
  Box,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  BarChart2
} from 'lucide-react';

const GithubIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

/* =========================================================================
   INFOGRAPHIC PRIMITIVES (Cream #F3EEE3, Ink Black #111111, Burnt Orange #D9541E)
   ========================================================================= */

export const ConcentricArcs = ({
  dockerPct = 65,
  pixelatePct = 25,
}: {
  dockerPct?: number;
  pixelatePct?: number;
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r="66" stroke="#222222" strokeWidth="8" fill="none" />
          <circle cx="80" cy="80" r="50" stroke="#222222" strokeWidth="8" fill="none" />
          <circle cx="80" cy="80" r="34" stroke="#222222" strokeWidth="8" fill="none" />

          {/* Outer Arc: Docker Build (Burnt Orange) */}
          <circle
            cx="80"
            cy="80"
            r="66"
            stroke="#D9541E"
            strokeWidth="8"
            strokeDasharray={414}
            strokeDashoffset={414 - (414 * dockerPct) / 100}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700"
          />

          {/* Middle Arc: Pixelate GPU (Cream) */}
          <circle
            cx="80"
            cy="80"
            r="50"
            stroke="#F3EEE3"
            strokeWidth="8"
            strokeDasharray={314}
            strokeDashoffset={314 - (314 * (dockerPct + pixelatePct)) / 100}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700"
          />

          {/* Inner Arc: Dual Sync */}
          <circle
            cx="80"
            cy="80"
            r="34"
            stroke="#8E3410"
            strokeWidth="8"
            strokeDasharray={213}
            strokeDashoffset={213 - (213 * 85) / 100}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-mono font-bold text-[#F3EEE3]">94%</span>
          <span className="text-[9px] uppercase tracking-wider font-mono text-[#D9541E] font-semibold">HEALTH</span>
        </div>
      </div>

      <div className="space-y-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D9541E]" />
          <span className="text-[#F3EEE3] font-semibold">{dockerPct}% Docker Daemon</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F3EEE3]" />
          <span className="text-[#BDB5A7]">{pixelatePct}% Pixelate GPU Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8E3410]" />
          <span className="text-[#888888]">10% Dual-Server TLS Net</span>
        </div>
      </div>
    </div>
  );
};

export const SpeedometerGauge = ({ value = 75 }: { value?: number }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-20 overflow-hidden flex items-end justify-center">
        <svg viewBox="0 0 160 90" className="w-full h-full">
          {Array.from({ length: 15 }).map((_, i) => {
            const angle = (i / 14) * 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = 80 - 74 * Math.cos(rad);
            const y1 = 85 - 74 * Math.sin(rad);
            const x2 = 80 - 70 * Math.cos(rad);
            const y2 = 85 - 70 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i < 11 ? '#D9541E' : '#333333'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
          <path d="M 80,85 L 18,85 A 62 62 0 0 1 36,41 Z" fill="#20130E" />
          <path d="M 80,85 L 36,41 A 62 62 0 0 1 80,23 Z" fill="#5E2209" />
          <path d="M 80,85 L 80,23 A 62 62 0 0 1 124,41 Z" fill="#D9541E" />
          <path d="M 80,85 L 124,41 A 62 62 0 0 1 142,85 Z" fill="#F3EEE3" />
          <line
            x1="80"
            y1="85"
            x2={80 - 54 * Math.cos(((value / 100) * 180 * Math.PI) / 180)}
            y2={85 - 54 * Math.sin(((value / 100) * 180 * Math.PI) / 180)}
            stroke="#F3EEE3"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="80" cy="85" r="5" fill="#D9541E" />
        </svg>
      </div>
      <div className="flex items-center justify-between w-36 text-[10px] font-mono text-[#BDB5A7] mt-1">
        <span>0 Mbps</span>
        <span className="text-[#F3EEE3] font-bold">14.8 Mbps</span>
        <span>25+</span>
      </div>
    </div>
  );
};

export const VerticalCapsuleBars = () => {
  const levels = [
    { fill: 68, split: '#D9541E' },
    { fill: 85, split: '#F3EEE3' },
    { fill: 42, split: '#8E3410' },
    { fill: 92, split: '#D9541E' },
    { fill: 60, split: '#F3EEE3' },
    { fill: 74, split: '#D9541E' },
  ];

  return (
    <div className="flex items-center justify-center gap-2.5 h-28 px-2">
      {levels.map((item, idx) => (
        <div
          key={idx}
          className="relative w-3.5 h-24 rounded-full bg-[#202020] border border-[#2D2D2D] overflow-hidden flex flex-col justify-end p-0.5"
        >
          <div
            className="w-full rounded-full transition-all duration-500 relative"
            style={{
              height: `${item.fill}%`,
              backgroundColor: item.split,
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#111111] border border-[#F3EEE3]" />
          </div>
        </div>
      ))}
    </div>
  );
};

/* =========================================================================
   USER-FRIENDLY, IMPECCABLE ORCHESTRATOR APP
   ========================================================================= */

export function OrchestratorAgentApp() {
  // State
  const [repoUrl, setRepoUrl] = useState('https://github.com/jeevanshbhatia650-rgb/sathack');
  const [branch, setBranch] = useState('main');
  const [activeTab, setActiveTab] = useState<'terminal' | 'telemetry' | 'chat'>('terminal');

  const [server1, setServer1] = useState({
    name: 'Server 1: Docker Host',
    endpoint: 'https://api-orchestrator.sathack.internal:8443',
    latency: 14,
  });

  const [server2, setServer2] = useState({
    name: 'Server 2: Pixelate GPU Node',
    endpoint: 'https://stream-node-02.sathack.io:9092',
    latency: 22,
  });

  const [isEditingServers, setIsEditingServers] = useState(false);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'completed'>('completed');
  const [copiedLogs, setCopiedLogs] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const initialLogs = [
    '[05:15:10] [SYSTEM] Sathack Agentic Orchestrator v2.4 initialized.',
    '[05:15:11] [NET] Connected to Server 1 (Docker Daemon: 8443) -> TLS OK (14ms)',
    '[05:15:11] [NET] Connected to Server 2 (Pixelate GPU: 9092) -> WebRTC DataChannel OK (22ms)',
    '[05:15:12] [GIT] Ingested: https://github.com/jeevanshbhatia650-rgb/sathack (branch: main)',
    '[05:15:13] [DOCKER] [+] Building 12.8s (7/7) FINISHED',
    '[05:15:14] [DOCKER] => [1/7] FROM node:20-alpine AS runtime',
    '[05:15:15] [DOCKER] => [2/7] RUN apk add --no-cache python3 make g++ ffmpeg',
    '[05:15:16] [DOCKER] => [3/7] WORKDIR /app/sathack',
    '[05:15:17] [DOCKER] => [4/7] COPY package.json package-lock.json ./',
    '[05:15:18] [DOCKER] => [5/7] RUN npm ci --production',
    '[05:15:19] [DOCKER] => [6/7] COPY . .',
    '[05:15:20] [DOCKER] => [7/7] RUN npm run build:pixelate-bundle',
    '[05:15:21] [PIXELATE] WebGL2 frame buffer allocated: 60 FPS WebRTC stream active',
    '[05:15:22] [ORCHESTRATOR] HEALTHCHECK: http://localhost:8080/healthz passed [200 OK]',
    '[05:15:23] [ARTIFACT] Release artifact package generated: sathack-deployable-bundle-v2.4.0.tar.gz (48.4 MB)',
    '[05:15:24] [READY] Ready for autonomous execution.'
  ];

  const [logs, setLogs] = useState<string[]>(initialLogs);

  const [telemetry, setTelemetry] = useState({
    fps: 60.0,
    bitrate: 14.8,
    latency: 18.2,
    packetLoss: 0.01,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        fps: +(59.2 + Math.random() * 1.5).toFixed(1),
        bitrate: +(14.2 + Math.random() * 1.2).toFixed(1),
        latency: +(16.5 + Math.random() * 3.2).toFixed(1),
      }));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const [prompt, setPrompt] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string }>>([
    { name: 'Dockerfile', size: '1.4 KB' },
    { name: 'pixelate.config.json', size: '2.8 KB' },
  ]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Sathack Orchestrator is connected to both servers. Ready to analyze repository jeevanshbhatia650-rgb/sathack or trigger fresh builds.'
    }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerBuild = () => {
    setActiveTab('terminal');
    setBuildStatus('building');
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [BUILD-TRIGGER] Manual build started by operator for branch '${branch}'...`,
      `[${new Date().toLocaleTimeString()}] [DOCKER] Step 1/3: Fetching base image node:20-alpine...`,
      `[${new Date().toLocaleTimeString()}] [DOCKER] Step 2/3: Compiling Pixelate GPU shader engine...`,
    ]);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [DOCKER] Step 3/3: Container verification succeeded: 200 OK`,
        `[${new Date().toLocaleTimeString()}] [ARTIFACT] Release bundle ready: sathack-deployable-bundle-v2.4.0.tar.gz`,
      ]);
      setBuildStatus('completed');
    }, 2500);
  };

  const handleDownloadArtifact = () => {
    const blob = new Blob([
      `SATHACK ORCHESTRATOR DEPLOYABLE ARTIFACT v2.4.0\n` +
      `Repository: ${repoUrl}\n` +
      `Branch: ${branch}\n` +
      `Server 1 (Docker): ${server1.endpoint}\n` +
      `Server 2 (Pixelate): ${server2.endpoint}\n` +
      `Timestamp: ${new Date().toISOString()}\n`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sathack-deployable-bundle-v2.4.0.tar.gz';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = () => {
    if (!prompt.trim() && attachedFiles.length === 0) return;
    const text = prompt.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text }]);
    setPrompt('');

    setTimeout(() => {
      let reply = `Agent received request for ${repoUrl}. Both Server 1 and Server 2 report normal operation.`;
      if (text.toLowerCase().includes('build') || text.toLowerCase().includes('docker')) {
        reply = 'Triggered multi-stage Docker build. Switching to Terminal HUD view to monitor output.';
        handleTriggerBuild();
      }
      setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    }, 800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 text-[#F3EEE3] font-sans">
      
      {/* =========================================================================
          HERO PRIMARY ACTION CARD (Distilled: ONE clear primary action)
          ========================================================================= */}
      <div className="mb-6 p-6 rounded-3xl bg-[#161616] border border-[#262626] shadow-xl">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#F3EEE3] mb-2">
          Repository &amp; Branch to Orchestrate
        </label>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full bg-[#0E0E0E] border border-[#2B2B2B] text-xs font-mono text-[#F3EEE3] rounded-2xl px-4 py-3.5 pl-10 focus:outline-none focus:border-[#D9541E] transition-all"
            />
            <GithubIcon className="absolute left-3.5 top-4 text-[#888888]" />
          </div>

          <div className="w-full sm:w-44">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-[#0E0E0E] border border-[#2B2B2B] text-xs font-mono text-[#F3EEE3] rounded-2xl px-3.5 py-3.5 focus:outline-none focus:border-[#D9541E] cursor-pointer"
            >
              <option value="main">branch: main</option>
              <option value="v2.4-stream">branch: v2.4-stream</option>
              <option value="pixelate-dev">branch: pixelate-dev</option>
            </select>
          </div>

          <button
            onClick={handleTriggerBuild}
            disabled={buildStatus === 'building'}
            className="px-6 py-3.5 rounded-2xl bg-[#D9541E] text-white hover:bg-[#E8632B] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D9541E]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play size={14} className={buildStatus === 'building' ? 'animate-spin' : ''} />
            <span>{buildStatus === 'building' ? 'Building...' : 'Start Orchestration'}</span>
          </button>
        </div>

        {/* Presets & Servers Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-[#222222] text-xs font-mono">
          <div className="flex items-center gap-2 text-[#888888]">
            <span>Quick test:</span>
            <button
              onClick={() => setRepoUrl('https://github.com/jeevanshbhatia650-rgb/sathack')}
              className="text-[#D9541E] hover:underline cursor-pointer font-semibold"
            >
              jeevanshbhatia650-rgb/sathack
            </button>
          </div>

          <div className="flex items-center gap-2 text-[#888888]">
            <span className="w-2 h-2 rounded-full bg-[#D9541E] animate-pulse" />
            <span className="text-[#F3EEE3]">Server 1 (8443)</span>
            <span>·</span>
            <span className="text-[#F3EEE3]">Server 2 (9092)</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PROGRESSIVE DISCLOSURE TABS (User Friendly & Easy to Navigate)
          ========================================================================= */}
      <div className="flex items-center gap-2 mb-4 p-1.5 rounded-2xl bg-[#161616] border border-[#262626] w-fit">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeTab === 'terminal'
              ? 'bg-[#D9541E] text-white shadow-md'
              : 'text-[#888888] hover:text-[#F3EEE3]'
          }`}
        >
          <Terminal size={14} />
          <span>Build Logs &amp; Artifact</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeTab === 'telemetry'
              ? 'bg-[#D9541E] text-white shadow-md'
              : 'text-[#888888] hover:text-[#F3EEE3]'
          }`}
        >
          <BarChart2 size={14} />
          <span>Infographic Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-[#D9541E] text-white shadow-md'
              : 'text-[#888888] hover:text-[#F3EEE3]'
          }`}
        >
          <MessageSquare size={14} />
          <span>AI Assistant</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: TERMINAL & ARTIFACT (Clean, Focused, Direct Output)
          ========================================================================= */}
      {activeTab === 'terminal' && (
        <div className="rounded-3xl bg-[#141414] border border-[#262626] overflow-hidden shadow-xl mb-6">
          <div className="px-5 py-3.5 bg-[#1A1A1A] border-b border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${buildStatus === 'building' ? 'bg-amber-400 animate-ping' : 'bg-[#D9541E]'}`} />
              <span className="text-xs font-mono font-bold text-[#F3EEE3]">
                {buildStatus === 'building' ? 'Building Container Layers...' : 'Container Verified [200 OK]'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(logs.join('\n'));
                  setCopiedLogs(true);
                  setTimeout(() => setCopiedLogs(false), 2000);
                }}
                className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-[#888888] text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                {copiedLogs ? <Check size={12} className="text-[#D9541E]" /> : <Copy size={12} />}
                <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 font-mono text-[11px] leading-relaxed max-h-[220px] overflow-y-auto bg-[#0C0C0C] space-y-1">
            {logs.map((log, index) => {
              let color = 'text-[#BDB5A7]';
              if (log.includes('[DOCKER]')) color = 'text-[#F3EEE3]';
              if (log.includes('[PIXELATE]')) color = 'text-[#D9541E] font-semibold';
              if (log.includes('[ORCHESTRATOR]') || log.includes('[READY]')) color = 'text-white font-bold';
              if (log.includes('[ARTIFACT]')) color = 'text-[#E8632B] font-bold';

              return (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-[#444444] select-none text-[10px] w-5 text-right">{index + 1}</span>
                  <span className={color}>{log}</span>
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>

          {/* Download Artifact Return Banner */}
          <div className="p-4 bg-[#181818] border-t border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#221712] border border-[#D9541E]/40 flex items-center justify-center text-[#D9541E]">
                <Box size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#F3EEE3]">sathack-deployable-bundle-v2.4.0.tar.gz</div>
                <div className="text-[10px] font-mono text-[#888888]">48.4 MB · Ready for production deployment</div>
              </div>
            </div>

            <button
              onClick={handleDownloadArtifact}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-mono font-bold bg-[#D9541E] text-white hover:bg-[#E8632B] shadow-md shadow-[#D9541E]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download size={14} />
              Download Artifact (.tar.gz)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: INFOGRAPHIC TELEMETRY (Clean, Uncluttered Visual Data)
          ========================================================================= */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Concentric Progress Gauge */}
          <div className="p-6 rounded-3xl bg-[#161616] border border-[#262626]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F3EEE3] mb-4">
              Cluster Resource Distribution
            </h3>
            <ConcentricArcs dockerPct={65} pixelatePct={25} />
          </div>

          {/* Speedometer & Capsule Equalizer */}
          <div className="p-6 rounded-3xl bg-[#161616] border border-[#262626]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F3EEE3] mb-4">
              Pixelate GPU Shader Telemetry (60 FPS)
            </h3>
            <div className="grid grid-cols-2 gap-4 items-center">
              <SpeedometerGauge value={75} />
              <VerticalCapsuleBars />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: AI ASSISTANT CHAT (Friendly, Focused Conversational Dock)
          ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="rounded-3xl bg-[#161616] border border-[#262626] p-5 mb-6">
          <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#221712] border border-[#D9541E]/30 text-[#F3EEE3] ml-8'
                    : 'bg-[#101010] border border-[#222222] text-[#BDB5A7] mr-8'
                }`}
              >
                <div className="text-[10px] font-mono text-[#D9541E] font-bold mb-1">
                  {msg.role === 'user' ? 'Operator' : 'Sathack Agent'}
                </div>
                <div>{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#222222]">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask agent: 'Trigger Docker build', 'Check GPU latency', or 'Explain pipeline'..."
              className="flex-1 bg-[#0E0E0E] border border-[#2B2B2B] text-xs font-mono text-[#F3EEE3] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#D9541E]"
            />
            <button
              onClick={handleSendMessage}
              className="p-3 rounded-2xl bg-[#D9541E] text-white hover:bg-[#E8632B] transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
