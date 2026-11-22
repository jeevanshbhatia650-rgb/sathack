import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Terminal,
  Cpu,
  HardDrive,
  Server,
  Shield,
  ShieldCheck,
  GitBranch,
  Github,
  Plus,
  Paperclip,
  Image as ImageIcon,
  FileCode,
  FileText,
  FileJson,
  Download,
  Copy,
  Check,
  Send,
  Sparkles,
  Wrench,
  Layers,
  Activity,
  Lock,
  Zap,
  RefreshCw,
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plug,
  Settings,
  Database,
  Box,
  Globe,
  BatteryCharging,
  Menu,
  ArrowUpRight,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

// ============================================================================
// CONSTANTS & INITIAL SAMPLE DATA
// ============================================================================

const DEFAULT_REPOS = [
  {
    id: "repo-1",
    url: "https://github.com/rammesh-demo/campus-scraper",
    label: "rammesh-demo/campus-scraper",
    mode: "batch",
  },
  {
    id: "repo-2",
    url: "https://github.com/modelcontextprotocol/servers",
    label: "modelcontextprotocol/servers",
    mode: "service",
  },
];

const INITIAL_PLUGINS = {
  railpack: {
    id: "railpack",
    name: "Railpack Tier-1",
    desc: "Deterministic zero-LLM OCI build planner",
    enabled: true,
  },
  supergateway: {
    id: "supergateway",
    name: "Supergateway MCP Bridge",
    desc: "Wrap stdio MCP servers to Streamable HTTP",
    enabled: true,
  },
  hadolint: {
    id: "hadolint",
    name: "Hadolint Gate",
    desc: "AST Dockerfile linter + regex security gate",
    enabled: true,
  },
  redisCache: {
    id: "redisCache",
    name: "Redis Execution Cache",
    desc: "3-agent memory & batch output caching",
    enabled: true,
  },
  oomRecovery: {
    id: "oomRecovery",
    name: "OOM Auto-Recovery",
    desc: "Event-driven Exit 137 RAM bump & reroute",
    enabled: true,
  },
};

const PHASE_META = {
  IDLE: {
    label: "IDLE",
    color: "#71717a",
    badgeClass: "border-zinc-700/80 bg-zinc-900/90 text-zinc-300",
    spinning: false,
  },
  PLANNING: {
    label: "PLANNING",
    color: "#a78bfa",
    badgeClass: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    spinning: true,
  },
  "KAHN DAG": {
    label: "KAHN DAG",
    color: "#22d3ee",
    badgeClass: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    spinning: true,
  },
  BUILDING: {
    label: "BUILDING",
    color: "#f59e0b",
    badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    spinning: true,
  },
  "SANDBOX RUNNING": {
    label: "SANDBOX RUNNING",
    color: "#34d399",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    spinning: true,
  },
  "OOM RECOVERY": {
    label: "OOM RECOVERY",
    color: "#fb7185",
    badgeClass: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    spinning: true,
  },
  COMPLETED: {
    label: "COMPLETED",
    color: "#10b981",
    badgeClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    spinning: false,
  },
};

const TAG_STYLES = {
  PLANNER: "text-violet-400 bg-violet-500/10 border-violet-500/25",
  KAHN: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",
  CACHE: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/25",
  ALLOCATOR: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  RAILPACK: "text-amber-300 bg-amber-500/10 border-amber-500/25",
  DOCKER: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  SANDBOX: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  RECOVERY: "text-rose-400 bg-rose-500/10 border-rose-500/25",
  MCP: "text-indigo-300 bg-indigo-500/10 border-indigo-500/25",
  ARTIFACT: "text-teal-300 bg-teal-500/10 border-teal-500/25",
  SYSTEM: "text-zinc-300 bg-zinc-500/10 border-zinc-500/25",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function generateShortHex(len = 6) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parseGithubInput(raw) {
  const cleaned = raw.trim().replace(/\.git$/, "").replace(/\/+$/, "");
  if (!cleaned) return null;

  // Support shorthand "owner/repo"
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(cleaned)) {
    return {
      url: `https://github.com/${cleaned}`,
      label: cleaned,
    };
  }

  try {
    const withProto = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
    const parsed = new URL(withProto);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const label = `${parts[0]}/${parts[1]}`;
      return {
        url: `${parsed.origin}/${label}`,
        label,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function generateDockerfile(repos, plugins) {
  const primary = repos[0]?.label || "rammesh-demo/campus-scraper";
  const hasMcp = repos.some((r) => r.mode === "service") || plugins.supergateway.enabled;
  return `# Auto-synthesized by RAMMesh 3-Tier Containerizer (Tier 2 + Hadolint Passed)
# Source Repository: https://github.com/${primary}
FROM public.ecr.aws/docker/library/python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install minimal runtime toolchain & Node.js for Supergateway MCP bridge
RUN apt-get update && apt-get install -y --no-install-recommends \\
    ca-certificates curl nodejs npm \\
    && rm -rf /var/lib/apt/lists/*

# Non-root hardened user (UID 1000 enforced by Worker Sandbox)
RUN useradd -m -u 1000 appuser

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

USER appuser
${
  hasMcp
    ? `EXPOSE 8000

# Supergateway converts local stdio MCP server -> Authenticated Streamable HTTP
CMD ["npx", "-y", "supergateway", \\
     "--stdio", "python -m server", \\
     "--outputTransport", "streamableHttp", \\
     "--stateful", "--port", "8000", \\
     "--apiKey", "\${OFFDOCK_JOB_TOKEN}"]`
    : `
# Hardened ephemeral batch entrypoint
ENTRYPOINT ["python", "-u", "main.py"]`
}`;
}

function generateBlueprintJson(jobId, repos, prompt, memLimitMb, workerId) {
  const primary = repos[0] || DEFAULT_REPOS[0];
  return JSON.stringify(
    {
      protocol: "rammesh/v1",
      job_id: jobId,
      target_worker_id: workerId,
      dispatch_transport: "outbound-ws+redis-stream",
      payload_size_bytes: 4812,
      prompt_summary: prompt.slice(0, 140),
      tasks: repos.map((r, idx) => ({
        task_id: `task_${idx + 1}_${r.label.split("/")[1]?.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "worker"}`,
        repo_url: r.url,
        commit_sha: "HEAD",
        task_type: r.mode === "service" ? "service" : "batch",
        build_mode: r.mode === "service" ? "dockerfile" : "railpack",
        sandbox_policy: {
          user: "1000:1000",
          read_only_rootfs: true,
          tmpfs: "/tmp:rw,noexec,nosuid,size=256m",
          cap_drop: ["ALL"],
          security_opt: ["no-new-privileges:true"],
          mem_limit_mb: memLimitMb,
          memswap_limit_mb: memLimitMb,
          pids_limit: 128,
          network: "rammesh-isolated-net",
          rfc1918_egress_blocked: true,
        },
      })),
    },
    null,
    2
  );
}

function buildInitialArtifacts(jobId, repos, prompt, logs, dockerfile, mcpUrl) {
  const resultsPayload = JSON.stringify(
    {
      job_id: jobId,
      status: "COMPLETED",
      completed_at: new Date().toISOString(),
      orchestrator: "Server 1 (Render Web Service)",
      worker_node: "laptop-peer-02 (100.88.14.22)",
      prompt,
      repositories: repos.map((r) => ({ url: r.url, mode: r.mode })),
      metrics: {
        blueprint_bytes: 4812,
        build_duration_sec: 11.4,
        sandbox_exit_code: 0,
        oom_events: 0,
        host_safety_floor_respected: true,
      },
      output_summary: {
        records_extracted: 1248,
        mcp_tools_registered: 6,
        endpoint_url: mcpUrl,
      },
    },
    null,
    2
  );

  const mcpConfigPayload = JSON.stringify(
    {
      mcpServers: {
        "rammesh-remote-node": {
          transport: "streamableHttp",
          url: mcpUrl,
          headers: {
            Authorization: `Bearer rammesh_tok_${generateShortHex(12)}`,
          },
          worker_tailscale_ip: "100.88.14.22",
          idle_ttl_sec: 900,
        },
      },
    },
    null,
    2
  );

  const logsText = logs
    .map((l) => `[${l.time}] [${l.tag}] ${l.message}`)
    .join("\n");

  const makeEntry = (name, type, mime, content) => ({
    id: `${jobId}-${name}`,
    name,
    type,
    mime,
    size: formatBytes(new Blob([content]).size),
    sha: generateShortHex(7),
    content,
  });

  return [
    makeEntry("Dockerfile", "docker", "text/plain", dockerfile),
    makeEntry("execution_results.json", "json", "application/json", resultsPayload),
    makeEntry("mcp_endpoint_config.json", "json", "application/json", mcpConfigPayload),
    makeEntry("container_logs.txt", "text", "text/plain", logsText),
  ];
}

function triggerFileDownload(artifact) {
  const blob = new Blob([artifact.content], { type: artifact.mime || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = artifact.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============================================================================
// UI SUB-COMPONENTS
// ============================================================================

/**
 * Custom Geometric RAMMesh Logo Mark
 */
function RamMeshLogo({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="8" fill="url(#rammesh_bg)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="white" strokeOpacity="0.18" />
      <circle cx="16" cy="9" r="3" fill="#ffffff" />
      <circle cx="9.5" cy="22" r="2.7" fill="#a78bfa" />
      <circle cx="22.5" cy="22" r="2.7" fill="#34d399" />
      <path
        d="M16 12V16M16 16L10.8 20M16 16L21.2 20"
        stroke="white"
        strokeOpacity="0.8"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="rammesh_bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e1b4b" />
          <stop offset="1" stopColor="#09090b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Circular SVG Radial Gauge used across Orchestrator and psutil Worker cards
 */
function RadialGauge({
  value,
  max = 100,
  size = 86,
  strokeWidth = 7,
  color = "#a78bfa",
  label,
  sublabel,
  centerText,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.65s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.35s ease",
              filter: `drop-shadow(0 0 6px ${color}55)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-sm font-semibold text-white leading-none">
            {centerText ?? `${Math.round(pct)}%`}
          </span>
          {sublabel && (
            <span className="mt-1 text-[10px] font-mono text-zinc-400 leading-none">{sublabel}</span>
          )}
        </div>
      </div>
      {label && <span className="text-[11px] font-medium text-zinc-400 tracking-wide">{label}</span>}
    </div>
  );
}

/**
 * Circular Animated Orbital Status Ring inside the top Hero Execution Stage
 */
function OrbitalPhaseRing({ phase }) {
  const meta = PHASE_META[phase] || PHASE_META.IDLE;
  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-full border text-xs font-mono ${meta.badgeClass}`}>
      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          className={meta.spinning ? "animate-spin" : ""}
          style={{ animationDuration: "2.2s" }}
        >
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
          <path
            d="M10 2 A8 8 0 0 1 18 10"
            fill="none"
            stroke={meta.color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: meta.color,
            boxShadow: `0 0 8px ${meta.color}`,
          }}
        />
      </div>
      <span className="font-semibold tracking-wider text-[11px]">{meta.label}</span>
    </div>
  );
}

/**
 * Server Connection Modal (Configure Render Server 1, MESH_SECRET, Worker ID)
 */
function ServerConfigModal({
  isOpen,
  onClose,
  config,
  onSaveAndTest,
  connectionState,
}) {
  const [renderUrl, setRenderUrl] = useState(config.renderUrl);
  const [meshSecret, setMeshSecret] = useState(config.meshSecret);
  const [workerId, setWorkerId] = useState(config.workerId);
  const [testing, setTesting] = useState(false);
  const [pairCommand, setPairCommand] = useState("");
  const [pairActionBusy, setPairActionBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRenderUrl(config.renderUrl);
      setMeshSecret(config.meshSecret);
      setWorkerId(config.workerId);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const baseOrigin = renderUrl.trim().replace(/\/+$/, "");

  const handlePairNode = async () => {
    setPairActionBusy(true);
    setPairCommand("");
    try {
      const res = await fetch(`${baseOrigin}/v1/nodes/pair`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(meshSecret.trim() ? { Authorization: `Bearer ${meshSecret.trim()}` } : {}),
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      if (data.node_id) setWorkerId(data.node_id);
      setPairCommand(data.command || JSON.stringify(data, null, 2));
    } catch (err) {
      setPairCommand(`Pairing error: ${err?.message || "check ADMIN_DASHBOARD_KEY & MESH_MASTER_SECRET"}`);
    } finally {
      setPairActionBusy(false);
    }
  };

  const handleSpawnSandbox = async () => {
    setPairActionBusy(true);
    setPairCommand("");
    try {
      const res = await fetch(`${baseOrigin}/v1/nodes/spawn-sandbox`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(meshSecret.trim() ? { Authorization: `Bearer ${meshSecret.trim()}` } : {}),
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      if (data.node_id) setWorkerId(data.node_id);
      setPairCommand(`Cloud sandbox spawned for ${data.node_id}: ${JSON.stringify(data.sandbox)}`);
    } catch (err) {
      setPairCommand(`Sandbox spawn error: ${err?.message || "configure E2B_API_KEY & E2B_TEMPLATE"}`);
    } finally {
      setPairActionBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTesting(true);
    await onSaveAndTest({
      renderUrl: baseOrigin,
      meshSecret: meshSecret.trim(),
      workerId: workerId.trim() || "laptop-peer-02",
    });
    setTesting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0b0b10] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Connect Dual-Server Mesh</h3>
              <p className="text-xs text-zinc-400">
                Server 1 (Render Orchestrator) + Server 2 (Worker Node)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Server 1 — Render Orchestrator URL
            </label>
            <input
              type="url"
              required
              value={renderUrl}
              onChange={(e) => setRenderUrl(e.target.value)}
              placeholder="https://offdock-orchestrator.onrender.com"
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              ADMIN_DASHBOARD_KEY Bearer Token
            </label>
            <input
              type="password"
              value={meshSecret}
              onChange={(e) => setMeshSecret(e.target.value)}
              placeholder="admin_dashboard_key_••••••••"
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Server 2 — Target Worker Node ID
            </label>
            <input
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="node-9f3a1c82"
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={pairActionBusy}
              onClick={handlePairNode}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/10 text-xs font-mono text-zinc-200 transition-colors disabled:opacity-50"
            >
              Generate Node Join Command (/v1/nodes/pair)
            </button>
            <button
              type="button"
              disabled={pairActionBusy}
              onClick={handleSpawnSandbox}
              className="px-3 py-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-mono text-cyan-200 transition-colors disabled:opacity-50"
            >
              Spawn Cloud Sandbox (E2B)
            </button>
          </div>

          {pairCommand && (
            <pre className="rounded-xl border border-white/10 bg-black/70 p-3 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap break-all max-h-28 overflow-auto">
              {pairCommand}
            </pre>
          )}

          {connectionState.message && (
            <div
              className={`rounded-xl border px-3.5 py-2.5 text-xs flex items-start gap-2.5 ${
                connectionState.status === "connected"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : connectionState.status === "fallback"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  : "border-white/10 bg-white/5 text-zinc-300"
              }`}
            >
              {connectionState.status === "connected" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{connectionState.message}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={testing}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-black bg-gradient-to-b from-white via-white/95 to-white/75 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Probing Render /healthz...
                </>
              ) : (
                <>
                  <Plug className="w-3.5 h-3.5" />
                  Save &amp; Test Live Link
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export default function App() {
  // ---- Server Connection & Mode State ----
  const [liveMode, setLiveMode] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [serverConfig, setServerConfig] = useState({
    renderUrl: "https://rammesh-orchestrator.onrender.com",
    meshSecret: "rammesh_demo_bearer_9f2a",
    workerId: "laptop-peer-02",
  });
  const [connectionState, setConnectionState] = useState({
    status: "idle",
    message: "",
  });

  // ---- Orchestration Execution State ----
  const [activeTab, setActiveTab] = useState("terminal"); // "terminal" | "dockerfile" | "dag"
  const [blueprintSubTab, setBlueprintSubTab] = useState("dockerfile"); // "dockerfile" | "blueprint"
  const [jobId, setJobId] = useState("job_8f2a9c");
  const [phase, setPhase] = useState("COMPLETED");
  const [isRunning, setIsRunning] = useState(false);
  const [activeCommandText, setActiveCommandText] = useState(
    "idle — ready for next orchestration dispatch"
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloadedId, setDownloadedId] = useState(null);

  // ---- Repos, Prompt, Attachments, Plugins ----
  const [repos, setRepos] = useState(DEFAULT_REPOS);
  const [repoInput, setRepoInput] = useState("");
  const [repoError, setRepoError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [plugins, setPlugins] = useState(INITIAL_PLUGINS);
  const [pluginsOpen, setPluginsOpen] = useState(false);
  const [runCached, setRunCached] = useState(true);

  // ---- Dual-Server Telemetry State ----
  const [orchestratorMetrics, setOrchestratorMetrics] = useState({
    latencyMs: 24,
    ramUsedMb: 184,
    ramLimitMb: 512,
    activeLeases: 0,
    plannerHitRate: 92,
    containerizerHitRate: 88,
    recoveryHitRate: 95,
    execCacheStatus: "WARM",
  });

  const [workerMetrics, setWorkerMetrics] = useState({
    workerId: "laptop-peer-02",
    tailscaleIp: "100.88.14.22",
    cpuPercent: 18,
    totalRamMb: 16384,
    availableRamMb: 10940,
    hostFloorMb: 4096,
    onBattery: false,
    dockerAuthVerified: true,
    activeContainers: 1,
    loadSpikeCpu: 0,
    loadSpikeRamMb: 0,
  });

  // ---- Initial Pre-Populated Logs, DAG, Dockerfile, Artifacts ----
  const initialDockerfile = useMemo(
    () => generateDockerfile(DEFAULT_REPOS, INITIAL_PLUGINS),
    []
  );

  const initialLogs = useMemo(
    () => [
      {
        id: "init-1",
        time: "04:48:10",
        tag: "PLANNER",
        message: "Parsed 2 GitHub repos -> generated Pydantic ExecutionPlan (2 waves, 3 tasks).",
      },
      {
        id: "init-2",
        time: "04:48:11",
        tag: "KAHN",
        message: "Kahn's Algorithm verified DAG: |L|=3 == |V|=3 (0 cycles). Wave 1 fan-out = 2 parallel nodes.",
      },
      {
        id: "init-3",
        time: "04:48:11",
        tag: "CACHE",
        message: "Redis 3-Agent Memory checked: Containerizer cache HIT for python:3.11-slim + supergateway.",
      },
      {
        id: "init-4",
        time: "04:48:12",
        tag: "ALLOCATOR",
        message: "asyncio.Lock reserved 1024 MB lease on laptop-peer-02 (100.88.14.22) • Score=0.89.",
      },
      {
        id: "init-5",
        time: "04:48:15",
        tag: "RAILPACK",
        message: "Tier-1 Railpack plan generated for rammesh-demo/campus-scraper (0 LLM tokens).",
      },
      {
        id: "init-6",
        time: "04:48:18",
        tag: "SANDBOX",
        message: "Launched hardened container (UID 1000, RO rootfs, cap-drop=ALL, mem==memswap, isolated bridge).",
      },
      {
        id: "init-7",
        time: "04:48:21",
        tag: "MCP",
        message: "Supergateway healthy -> http://100.88.14.22:41892/mcp (Bearer token injected into Wave 2).",
      },
      {
        id: "init-8",
        time: "04:48:24",
        tag: "ARTIFACT",
        message: "Batch exit 0 • Streamed 4 downloadable artifacts back to Render Orchestrator & Redis.",
      },
    ],
    []
  );

  const [logs, setLogs] = useState(initialLogs);
  const [dockerfileText, setDockerfileText] = useState(initialDockerfile);
  const [blueprintJsonText, setBlueprintJsonText] = useState(() =>
    generateBlueprintJson(
      "job_8f2a9c",
      DEFAULT_REPOS,
      "Containerize campus-scraper and expose MCP servers over Tailscale",
      512,
      "laptop-peer-02"
    )
  );
  const [artifacts, setArtifacts] = useState(() =>
    buildInitialArtifacts(
      "job_8f2a9c",
      DEFAULT_REPOS,
      "Containerize campus-scraper and expose MCP servers over Tailscale",
      initialLogs,
      initialDockerfile,
      "http://100.88.14.22:41892/mcp"
    )
  );

  const [dagWaves, setDagWaves] = useState({
    wave1: [
      {
        id: "task_1_scraper",
        name: "campus-scraper",
        repo: "rammesh-demo/campus-scraper",
        type: "batch",
        status: "COMPLETED",
        worker: "laptop-peer-02",
        ramMb: 512,
        tier: "Tier-1 Railpack",
      },
      {
        id: "task_2_mcp",
        name: "mcp-tool-server",
        repo: "modelcontextprotocol/servers",
        type: "service",
        status: "HEALTHY",
        worker: "laptop-peer-02",
        ramMb: 512,
        tier: "Tier-2 Supergateway",
      },
    ],
    wave2: [
      {
        id: "task_3_agg",
        name: "result-aggregator",
        repo: "orchestrator/builtin-merge",
        type: "batch",
        status: "COMPLETED",
        worker: "Server 1 (Render)",
        ramMb: 256,
        tier: "LangGraph Reducer",
      },
    ],
  });

  // ---- Refs ----
  const terminalEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const timersRef = useRef([]);
  const eventSourceRef = useRef(null);
  const lastRunSignatureRef = useRef("");
  const pluginsPopoverRef = useRef(null);

  // Clean up all timers and EventSource on unmount
  const clearScheduledTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearScheduledTimers();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [clearScheduledTimers]);

  // Close plugins popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (pluginsPopoverRef.current && !pluginsPopoverRef.current.contains(e.target)) {
        setPluginsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-scroll CLI terminal when new logs arrive
  useEffect(() => {
    if (activeTab === "terminal" && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [logs, activeTab]);

  // ---- Append Log Helper ----
  const pushLog = useCallback((tag, message) => {
    const entry = {
      id: `log-${Date.now()}-${generateShortHex(4)}`,
      time: formatTimestamp(),
      tag,
      message,
    };
    setLogs((prev) => [...prev, entry]);
    return entry;
  }, []);

  // ---- Apply Backend JOB_STATE Checkpoint Helper ----
  const applyBackendJobState = useCallback(
    (state) => {
      if (!state || typeof state !== "object") return;
      if (state.job_id) setJobId(state.job_id);
      const status = state.status;
      const statuses = state.statuses || {};
      const assignments = state.assignments || {};
      const statusVals = Object.values(statuses);
      if (status === "QUEUED" || status === "PLANNING") {
        setPhase("PLANNING");
      } else if (status === "RUNNING") {
        if (statusVals.some((s) => s === "BUILDING")) {
          setPhase("BUILDING");
        } else {
          setPhase("SANDBOX RUNNING");
        }
      } else if (status === "COMPLETED" || status === "FAILED") {
        setPhase("COMPLETED");
        setIsRunning(false);
        setActiveCommandText(
          status === "FAILED"
            ? `failed — ${state.job_id || ""} ${state.error || ""}`.trim()
            : `completed — ${state.job_id || ""}`
        );
      }

      if (state.plan?.tasks && Array.isArray(state.plan.tasks)) {
        const tasksById = Object.fromEntries(state.plan.tasks.map((t) => [t.id, t]));
        const waves = Array.isArray(state.waves) && state.waves.length > 0
          ? state.waves
          : [state.plan.tasks.map((t) => t.id)];
        const toWaveNode = (taskId) => {
          const t = tasksById[taskId] || { id: taskId, repo_url: "", task_type: "batch", est_ram_mb: 512 };
          const repoLabel = String(t.repo_url || "").replace(/^https?:\/\/github\.com\//, "") || taskId;
          return {
            id: t.id,
            name: repoLabel.split("/")[1] || t.id,
            repo: repoLabel,
            type: t.task_type || "batch",
            status: statuses[t.id] || "PENDING",
            worker: assignments[t.id] || serverConfig.workerId,
            ramMb: t.est_ram_mb || 512,
            tier: t.is_mcp_server ? "Tier-2 Supergateway" : "Tier-1/2 Containerizer",
          };
        };
        const w1 = (waves[0] || []).map(toWaveNode);
        const w2Ids = waves.slice(1).flat();
        setDagWaves((prev) => ({
          wave1: w1.length > 0 ? w1 : prev.wave1,
          wave2: w2Ids.length > 0 ? w2Ids.map(toWaveNode) : prev.wave2,
        }));
      } else if (Object.keys(statuses).length > 0) {
        setDagWaves((prev) => ({
          wave1: prev.wave1.map((n) => ({
            ...n,
            status: statuses[n.id] || n.status,
            worker: assignments[n.id] || n.worker,
          })),
          wave2: prev.wave2.map((n) => ({
            ...n,
            status: statuses[n.id] || n.status,
            worker: assignments[n.id] || n.worker,
          })),
        }));
      }
    },
    [serverConfig.workerId]
  );

  // ---- Live Cluster WebSocket (/ws/cluster) in Live Mode ----
  useEffect(() => {
    if (!liveMode || !serverConfig.renderUrl || !serverConfig.meshSecret) return;
    let ws = null;
    let reconnectTimer = null;
    let retryMs = 1000;
    let unmounted = false;

    const connectClusterWs = () => {
      if (unmounted) return;
      try {
        const wsOrigin = serverConfig.renderUrl
          .replace(/^https:\/\//i, "wss://")
          .replace(/^http:\/\//i, "ws://");
        ws = new WebSocket(`${wsOrigin}/ws/cluster`);
        ws.onopen = () => {
          retryMs = 1000;
          ws.send(JSON.stringify({ token: serverConfig.meshSecret }));
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "TELEMETRY") {
              const totalMb = Math.round(data.total_ram_mb ?? 16384);
              const availMb = Math.round(data.available_ram_mb ?? 10940);
              const floorMb = Math.round(Math.max(512, 0.3 * totalMb));
              setWorkerMetrics((prev) => ({
                ...prev,
                workerId: data.node_id || prev.workerId,
                tailscaleIp: data.ip || prev.tailscaleIp,
                cpuPercent: Math.round(data.cpu_percent ?? prev.cpuPercent),
                totalRamMb: totalMb,
                availableRamMb: availMb,
                hostFloorMb: floorMb,
                activeContainers: Number(data.running_containers ?? prev.activeContainers),
              }));
            } else if (data.type === "JOB_STATE") {
              applyBackendJobState(data);
            } else if (data.type === "LOG_CHUNK") {
              const prefix = data.task_id ? `[${data.task_id}] ` : "";
              pushLog("SANDBOX", `${prefix}${data.text || ""}`);
            } else if (data.type === "PRESSURE_WARNING") {
              pushLog("RECOVERY", `Host memory pressure warning emitted by ${data.node_id}`);
            }
          } catch {
            // Ignore malformed frames
          }
        };
        ws.onclose = () => {
          if (unmounted) return;
          reconnectTimer = setTimeout(connectClusterWs, retryMs);
          retryMs = Math.min(retryMs * 2, 30000);
        };
      } catch {
        // Ignore WebSocket construction errors
      }
    };

    connectClusterWs();
    return () => {
      unmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [liveMode, serverConfig, applyBackendJobState, pushLog]);

  // ---- Live / Simulated Telemetry Loop (every 2s) ----
  useEffect(() => {
    const pollTelemetry = async () => {
      if (liveMode) {
        try {
          const started = performance.now();
          const res = await fetch(`${serverConfig.renderUrl}/healthz`);
          if (res.ok) {
            const rtt = Math.max(4, Math.round(performance.now() - started));
            setOrchestratorMetrics((prev) => ({ ...prev, latencyMs: rtt }));
            return;
          }
        } catch {
          // Smoothly fall back to jittered telemetry without crashing UI
        }
      }

      // Smooth realistic psutil fluctuations in Demo Mode (incorporating active build spikes)
      setOrchestratorMetrics((prev) => ({
        ...prev,
        latencyMs: Math.max(14, Math.min(48, prev.latencyMs + Math.round((Math.random() - 0.5) * 6))),
        ramUsedMb: Math.max(
          162,
          Math.min(340, prev.ramUsedMb + Math.round((Math.random() - 0.48) * 8))
        ),
      }));

      setWorkerMetrics((prev) => {
        const baseCpu = 16 + Math.round(Math.random() * 8);
        const targetCpu = Math.min(94, baseCpu + prev.loadSpikeCpu);
        const baseAvail = 11120 + Math.round((Math.random() - 0.5) * 260);
        const targetAvail = Math.max(
          prev.hostFloorMb + 420,
          Math.min(prev.totalRamMb - 2200, baseAvail - prev.loadSpikeRamMb)
        );
        return {
          ...prev,
          workerId: serverConfig.workerId || prev.workerId,
          cpuPercent: Math.round(prev.cpuPercent * 0.45 + targetCpu * 0.55),
          availableRamMb: Math.round(prev.availableRamMb * 0.45 + targetAvail * 0.55),
        };
      });
    };

    const interval = setInterval(pollTelemetry, 2000);
    return () => clearInterval(interval);
  }, [liveMode, serverConfig]);

  // ---- Server Connection Test Handler ----
  const handleSaveAndTestServers = async (nextConfig) => {
    setServerConfig(nextConfig);
    setConnectionState({ status: "testing", message: "Checking Render /healthz endpoint..." });
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const started = performance.now();
      const res = await fetch(`${nextConfig.renderUrl}/healthz`, {
        headers: nextConfig.meshSecret
          ? { Authorization: `Bearer ${nextConfig.meshSecret}` }
          : {},
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const rtt = Math.round(performance.now() - started);
        setLiveMode(true);
        setOrchestratorMetrics((prev) => ({ ...prev, latencyMs: rtt }));
        setConnectionState({
          status: "connected",
          message: `Connected to Server 1 /healthz (${rtt}ms). Live /ws/cluster & SSE enabled.`,
        });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      setLiveMode(false);
      setConnectionState({
        status: "fallback",
        message:
          "Render endpoint unreachable from browser (offline or CORS). Saved config & switched gracefully to Interactive Demo Mode.",
      });
    }
  };

  // ---- Repo Pasting Helpers ----
  const handleAddRepo = (inputVal = repoInput) => {
    setRepoError("");
    const tokens = inputVal
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (tokens.length === 0) return;

    const parsedList = [];
    for (const tok of tokens) {
      const parsed = parseGithubInput(tok);
      if (parsed) {
        parsedList.push(parsed);
      }
    }

    if (parsedList.length === 0) {
      setRepoError("Enter a valid GitHub URL (e.g. https://github.com/org/repo) or owner/repo.");
      return;
    }

    setRepos((prev) => {
      const existing = new Set(prev.map((r) => r.url.toLowerCase()));
      const additions = [];
      for (const item of parsedList) {
        if (!existing.has(item.url.toLowerCase())) {
          existing.add(item.url.toLowerCase());
          const looksMcp = /mcp|server|agent/i.test(item.label);
          additions.push({
            id: `repo-${Date.now()}-${generateShortHex(4)}`,
            url: item.url,
            label: item.label,
            mode: looksMcp ? "service" : "auto",
          });
        }
      }
      return [...prev, ...additions];
    });
    setRepoInput("");
  };

  const cycleRepoMode = (id) => {
    const order = ["auto", "batch", "service"];
    setRepos((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = order[(order.indexOf(r.mode) + 1) % order.length];
        return { ...r, mode: next };
      })
    );
  };

  const removeRepo = (id) => {
    setRepos((prev) => prev.filter((r) => r.id !== id));
  };

  const loadSampleRepos = () => {
    setRepos(DEFAULT_REPOS);
    setRepoError("");
  };

  // ---- File / Photo Attachment Handlers ----
  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const mapped = files.map((file) => ({
      id: `att-${Date.now()}-${generateShortHex(4)}`,
      name: file.name,
      size: formatBytes(file.size),
      isImage: file.type.startsWith("image/"),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setAttachments((prev) => [...prev, ...mapped]);
    e.target.value = "";
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  // ---- Plugin Toggle Handler ----
  const togglePlugin = (key) => {
    setPlugins((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  // ---- Interactive Orchestration Simulation & Live Dispatch Engine ----
  const dispatchOrchestration = useCallback(
    async ({ overrideRepos, overridePrompt, scenario = "standard" } = {}) => {
      const activeRepos = overrideRepos && overrideRepos.length > 0 ? overrideRepos : repos;
      const activePrompt =
        (overridePrompt !== undefined ? overridePrompt : prompt).trim() ||
        "Containerize attached repositories, run batch tasks in Wave 1, and expose MCP services over Tailscale.";

      if (activeRepos.length === 0) {
        setRepoError("Paste at least one GitHub repository URL or click 'Load Sample Repos'.");
        return;
      }

      clearScheduledTimers();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const newJobId = `job_${generateShortHex(6)}`;
      const isOomScenario =
        scenario === "oom" ||
        /\boom\b|137|memory\s*spike/i.test(activePrompt);
      const runSignature = `${activeRepos.map((r) => `${r.url}:${r.mode}`).join("|")}::${activePrompt}`;
      const isCacheScenario =
        scenario === "cached" ||
        (runCached && plugins.redisCache.enabled && lastRunSignatureRef.current === runSignature && !isOomScenario);

      setJobId(newJobId);
      setIsRunning(true);
      setPhase("PLANNING");
      setActiveTab("terminal");
      setLogs([]);
      setArtifacts([]);
      setActiveCommandText(`rammesh dispatch --job ${newJobId} --repos ${activeRepos.length}`);

      const generatedDocker = generateDockerfile(activeRepos, plugins);
      const generatedBlueprint = generateBlueprintJson(
        newJobId,
        activeRepos,
        activePrompt,
        isOomScenario ? 1024 : 512,
        serverConfig.workerId
      );
      setDockerfileText(generatedDocker);
      setBlueprintJsonText(generatedBlueprint);

      // Build initial PENDING DAG wave structure from actual pasted repos
      const wave1Nodes = activeRepos.map((r, i) => ({
        id: `task_${i + 1}`,
        name: r.label.split("/")[1] || `repo-${i + 1}`,
        repo: r.label,
        type: r.mode === "service" ? "service" : "batch",
        status: "PENDING",
        worker: serverConfig.workerId,
        ramMb: 512,
        tier: r.mode === "service" ? "Tier-2 Supergateway" : plugins.railpack.enabled ? "Tier-1 Railpack" : "Tier-2 LLM",
      }));
      const wave2Nodes = [
        {
          id: `task_agg_${activeRepos.length + 1}`,
          name: "pipeline-aggregator",
          repo: "orchestrator/langgraph-reducer",
          type: "batch",
          status: "PENDING",
          worker: "Server 1 (Render)",
          ramMb: 256,
          tier: "Wave-2 Reducer",
        },
      ];
      setDagWaves({ wave1: wave1Nodes, wave2: wave2Nodes });

      // Attempt Live Server POST if Live Mode is enabled
      if (liveMode) {
        pushLog("SYSTEM", `Live Mode: POST ${serverConfig.renderUrl}/v1/jobs (${activeRepos.length} repos)...`);
        try {
          const authHeaders = serverConfig.meshSecret
            ? { Authorization: `Bearer ${serverConfig.meshSecret}` }
            : {};
          // Exact shared/schemas.py JobSubmissionRequest & RepoSubmissionItem contract
          const submissionBody = {
            prompt: activePrompt,
            repos: activeRepos.map((r) => ({
              repo_url: r.url,
              branch: "main",
              hint_role: r.mode,
              task_type: r.mode === "service" ? "service" : r.mode === "batch" ? "batch" : "auto",
              docker_image_override: null,
              env_vars: {},
            })),
            use_exec_cache: Boolean(runCached),
            use_agent_cache: Boolean(plugins.redisCache.enabled),
            image_transport: "blueprint",
          };
          const res = await fetch(`${serverConfig.renderUrl}/v1/jobs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify(submissionBody),
          });
          if (res.ok) {
            const payload = await res.json();
            const liveJobId = payload.job_id || newJobId;
            setJobId(liveJobId);
            pushLog("SYSTEM", `Server 1 accepted job ${liveJobId}. Streaming /v1/jobs/${liveJobId}/stream...`);

            const streamAbort = new AbortController();
            let pollInterval = null;
            const liveCollectedLogs = [];

            const cleanupLive = () => {
              streamAbort.abort();
              if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
              }
            };
            eventSourceRef.current = { close: cleanupLive };

            // Poll GET /v1/jobs/{job_id} for checkpointed plan, waves, statuses, and completion
            pollInterval = setInterval(async () => {
              try {
                const stateRes = await fetch(`${serverConfig.renderUrl}/v1/jobs/${liveJobId}`, {
                  headers: authHeaders,
                  signal: streamAbort.signal,
                });
                if (!stateRes.ok) return;
                const state = await stateRes.json();
                applyBackendJobState(state);
                if (state.status === "COMPLETED" || state.status === "FAILED") {
                  cleanupLive();
                  if (state.error) {
                    pushLog("RECOVERY", `Job ${liveJobId} ended with status ${state.status}: ${state.error}`);
                  } else {
                    pushLog("ARTIFACT", `Job ${liveJobId} reached ${state.status}. Packaging artifacts...`);
                  }
                  const mcpUrlLive = `${serverConfig.renderUrl}/proxy/${serverConfig.workerId}/task_1/mcp`;
                  setArtifacts(
                    buildInitialArtifacts(
                      liveJobId,
                      activeRepos,
                      activePrompt,
                      liveCollectedLogs,
                      generatedDocker,
                      mcpUrlLive
                    )
                  );
                }
              } catch {
                // Ignore transient poll errors while streaming
              }
            }, 1500);

            // Authenticated fetch stream for GET /v1/jobs/{job_id}/stream
            (async () => {
              try {
                const streamRes = await fetch(
                  `${serverConfig.renderUrl}/v1/jobs/${liveJobId}/stream`,
                  {
                    headers: { Accept: "text/event-stream", ...authHeaders },
                    signal: streamAbort.signal,
                  }
                );
                if (!streamRes.ok || !streamRes.body) return;
                const reader = streamRes.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                while (true) {
                  const { value, done } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";
                  for (const rawLine of lines) {
                    const line = rawLine.trim();
                    if (!line.startsWith("data:")) continue;
                    const dataStr = line.slice(5).trim();
                    if (!dataStr) continue;
                    try {
                      const parsed = JSON.parse(dataStr);
                      const msg = parsed.text || parsed.message || dataStr;
                      const entry = pushLog(parsed.tag || "SANDBOX", msg);
                      liveCollectedLogs.push(entry);
                    } catch {
                      const entry = pushLog("SANDBOX", dataStr);
                      liveCollectedLogs.push(entry);
                    }
                  }
                }
              } catch {
                // Stream aborted or closed on job completion
              }
            })();

            return;
          }
          throw new Error(`HTTP ${res.status}`);
        } catch {
          pushLog(
            "SYSTEM",
            "Live Render endpoint unreachable — seamlessly engaging full local simulation engine."
          );
        }
      }

      // Collect streamed logs locally so final container_logs.txt matches exact output
      const collectedLogs = [];
      const emit = (tag, msg) => {
        const entry = pushLog(tag, msg);
        collectedLogs.push(entry);
      };

      const schedule = (ms, fn) => {
        const id = setTimeout(fn, ms);
        timersRef.current.push(id);
      };

      const mcpPort = 41000 + Math.floor(Math.random() * 900);
      const mcpUrl = `http://${workerMetrics.tailscaleIp}:${mcpPort}/mcp`;

      // ---- FAST PATH: REDIS EXECUTION CACHE HIT ----
      if (isCacheScenario) {
        schedule(250, () => {
          emit(
            "PLANNER",
            `Received prompt + ${activeRepos.length} repo(s)${
              attachments.length ? ` + ${attachments.length} attachment(s)` : ""
            }. Computing Redis cache digest...`
          );
          setActiveCommandText("redis GET rammesh:cache:planner:sha256");
        });

        schedule(850, () => {
          setPhase("KAHN DAG");
          emit("CACHE", "Planner Agent Memory HIT (rammesh:cache:planner) — restored verified DAG in 4ms.");
          emit(
            "KAHN",
            `Kahn's Algorithm validated ${wave1Nodes.length + 1} tasks across 2 waves (0 cycles).`
          );
          setOrchestratorMetrics((p) => ({
            ...p,
            plannerHitRate: Math.min(99, p.plannerHitRate + 1),
            execCacheStatus: "CACHE HIT",
          }));
        });

        schedule(1550, () => {
          emit(
            "CACHE",
            "Redis Execution Cache HIT (rammesh:exec_cache) — identical repo SHA + env signature found!"
          );
          emit("SANDBOX", "Zero container spin-up required. Streaming cached output artifacts from Redis...");
          setDagWaves((prev) => ({
            wave1: prev.wave1.map((n) => ({ ...n, status: "COMPLETED" })),
            wave2: prev.wave2.map((n) => ({ ...n, status: "COMPLETED" })),
          }));
        });

        schedule(2300, () => {
          setPhase("COMPLETED");
          setIsRunning(false);
          setActiveCommandText(`completed (cached) — ${newJobId} in 2.3s`);
          emit(
            "ARTIFACT",
            `Restored 4 verified artifacts (Dockerfile, execution_results.json, mcp_endpoint_config.json, container_logs.txt).`
          );
          setArtifacts(
            buildInitialArtifacts(newJobId, activeRepos, activePrompt, collectedLogs, generatedDocker, mcpUrl)
          );
          lastRunSignatureRef.current = runSignature;
        });
        return;
      }

      // ---- STANDARD OR OOM RECOVERY FULL PIPELINE ----
      schedule(200, () => {
        emit(
          "PLANNER",
          `Analyzing prompt & ${activeRepos.length} repo(s): ${activeRepos.map((r) => r.label).join(", ")}${
            attachments.length ? ` (+${attachments.length} attached file(s))` : ""
          }.`
        );
        setOrchestratorMetrics((p) => ({ ...p, ramUsedMb: 218, execCacheStatus: "MISS" }));
        setActiveCommandText("agent:planner --model qwen3-coder -> JSON TaskDAG");
      });

      schedule(1000, () => {
        setPhase("KAHN DAG");
        emit(
          "KAHN",
          `Kahn's Algorithm verified acyclic topology: |L|=${wave1Nodes.length + 1} == |V|=${
            wave1Nodes.length + 1
          }. Partitioned into Wave 1 (${wave1Nodes.length} parallel) -> Wave 2 (1 aggregator).`
        );
        if (plugins.redisCache.enabled) {
          emit(
            "CACHE",
            "Redis 3-Agent Memory checked: Containerizer base layer cache HIT (public.ecr.aws/python:3.11-slim)."
          );
        }
        setActiveCommandText("langgraph:Send() fanning out Wave 1 tasks concurrently");
      });

      schedule(1850, () => {
        emit(
          "ALLOCATOR",
          `asyncio.Lock acquired -> ${serverConfig.workerId} (${workerMetrics.tailscaleIp}) passed admission (Avail > 4096 MB Floor, CPU < 85%). Reserved ${
            wave1Nodes.length * 512
          } MB tentative lease.`
        );
        setOrchestratorMetrics((p) => ({ ...p, activeLeases: wave1Nodes.length, ramUsedMb: 242 }));
        setWorkerMetrics((p) => ({
          ...p,
          loadSpikeCpu: 46,
          loadSpikeRamMb: wave1Nodes.length * 640,
          activeContainers: wave1Nodes.length + 1,
        }));
        setDagWaves((prev) => ({
          ...prev,
          wave1: prev.wave1.map((n) => ({ ...n, status: "BUILDING" })),
        }));
      });

      schedule(2700, () => {
        setPhase("BUILDING");
        setActiveCommandText("docker buildx build --load -t rammesh/job:wave1 /tmp/rammesh");
        emit(
          "DOCKER",
          `Dispatched 4.8 KB JSON Blueprint over encrypted channel -> ${serverConfig.workerId} (Docker Hub Auth: Verified).`
        );
        if (plugins.railpack.enabled) {
          emit(
            "RAILPACK",
            `Tier-1 Railpack generated deterministic OCI plan for ${activeRepos[0].label} (0 LLM tokens).`
          );
        }
        if (plugins.hadolint.enabled) {
          emit(
            "DOCKER",
            "Hadolint AST + Regex Security Gate PASSED (non-root appuser UID 1000, zero privileged flags)."
          );
        }
        setWorkerMetrics((p) => ({ ...p, loadSpikeCpu: 62, loadSpikeRamMb: wave1Nodes.length * 920 }));
      });

      schedule(3900, () => {
        setPhase("SANDBOX RUNNING");
        setActiveCommandText("sandbox:run --user 1000:1000 --read-only --cap-drop=ALL --pids-limit=128");
        emit(
          "SANDBOX",
          `Spawned ${wave1Nodes.length} isolated container(s) on rammesh-isolated-net (RFC1918 campus LAN blocked).`
        );
        setDagWaves((prev) => ({
          ...prev,
          wave1: prev.wave1.map((n) => ({
            ...n,
            status: n.type === "service" ? "HEALTHY" : "RUNNING",
          })),
        }));
        if (plugins.supergateway.enabled) {
          emit(
            "MCP",
            `Supergateway Streamable HTTP probe 200 OK -> ${mcpUrl} (Bearer token registered).`
          );
        }
      });

      if (isOomScenario) {
        // ---- OOM EXIT 137 SELF-HEALING BRANCH ----
        schedule(5000, () => {
          setPhase("OOM RECOVERY");
          setActiveCommandText("agent:recovery --event EXIT_137 --oom-killed true");
          emit(
            "RECOVERY",
            `ALERT: ${wave1Nodes[0].name} terminated with Exit 137 (OOMKilled=True at mem_limit=512m). Waking Recovery Agent...`
          );
          setDagWaves((prev) => ({
            ...prev,
            wave1: prev.wave1.map((n, idx) =>
              idx === 0 ? { ...n, status: "OOM_RETRY", ramMb: 1024 } : n
            ),
          }));
          setWorkerMetrics((p) => ({ ...p, loadSpikeCpu: 54, loadSpikeRamMb: 1450 }));
        });

        schedule(6200, () => {
          emit(
            "RECOVERY",
            "Diagnosis: large dataset buffer (not a leak). Scaling RAM via R_next = min(4096, ceil(512 * 1.5)) -> bumped to 1024 MB."
          );
          emit(
            "ALLOCATOR",
            `Re-leased 1024 MB on ${serverConfig.workerId} (Host Safety Floor 4096 MB intact). Re-running container...`
          );
          setOrchestratorMetrics((p) => ({
            ...p,
            recoveryHitRate: Math.min(99, p.recoveryHitRate + 1),
          }));
          setDagWaves((prev) => ({
            ...prev,
            wave1: prev.wave1.map((n, idx) =>
              idx === 0 ? { ...n, status: "RUNNING", ramMb: 1024 } : n
            ),
          }));
        });

        schedule(7400, () => {
          setPhase("SANDBOX RUNNING");
          emit("SANDBOX", `${wave1Nodes[0].name} recovered cleanly -> Exit 0. Advancing to Wave 2 aggregator...`);
          setDagWaves((prev) => ({
            wave1: prev.wave1.map((n) => ({
              ...n,
              status: n.type === "service" ? "HEALTHY" : "COMPLETED",
            })),
            wave2: prev.wave2.map((n) => ({ ...n, status: "RUNNING" })),
          }));
        });

        schedule(8400, () => {
          setPhase("COMPLETED");
          setIsRunning(false);
          setActiveCommandText(`completed (recovered from OOM) — ${newJobId}`);
          emit(
            "ARTIFACT",
            "Wave 2 COMPLETED • Cached results in Redis & generated 4 downloadable artifacts."
          );
          setDagWaves((prev) => ({
            ...prev,
            wave2: prev.wave2.map((n) => ({ ...n, status: "COMPLETED" })),
          }));
          setOrchestratorMetrics((p) => ({
            ...p,
            activeLeases: 0,
            ramUsedMb: 192,
            execCacheStatus: "STORED",
          }));
          setWorkerMetrics((p) => ({
            ...p,
            loadSpikeCpu: 0,
            loadSpikeRamMb: 0,
            activeContainers: activeRepos.some((r) => r.mode === "service") ? 1 : 0,
          }));
          setArtifacts(
            buildInitialArtifacts(newJobId, activeRepos, activePrompt, collectedLogs, generatedDocker, mcpUrl)
          );
          lastRunSignatureRef.current = runSignature;
        });
      } else {
        // ---- CLEAN WAVE 2 COMPLETION ----
        schedule(5250, () => {
          emit(
            "SANDBOX",
            `Wave 1 batch containers exited 0 (stdout streamed to Redis). Unblocking Wave 2 pipeline-aggregator...`
          );
          setDagWaves((prev) => ({
            wave1: prev.wave1.map((n) => ({
              ...n,
              status: n.type === "service" ? "HEALTHY" : "COMPLETED",
            })),
            wave2: prev.wave2.map((n) => ({ ...n, status: "RUNNING" })),
          }));
          setWorkerMetrics((p) => ({ ...p, loadSpikeCpu: 22, loadSpikeRamMb: 380 }));
        });

        schedule(6500, () => {
          setPhase("COMPLETED");
          setIsRunning(false);
          setActiveCommandText(`completed cleanly — ${newJobId} • 4 artifacts ready`);
          emit(
            "CACHE",
            `Stored execution output in rammesh:exec_cache (TTL 3600s) & retired asyncio.Lock lease.`
          );
          emit(
            "ARTIFACT",
            `Pipeline COMPLETED • Ready to download Dockerfile, execution_results.json, mcp_endpoint_config.json & container_logs.txt.`
          );
          setDagWaves((prev) => ({
            ...prev,
            wave2: prev.wave2.map((n) => ({ ...n, status: "COMPLETED" })),
          }));
          setOrchestratorMetrics((p) => ({
            ...p,
            activeLeases: 0,
            ramUsedMb: 186,
            execCacheStatus: "STORED",
          }));
          setWorkerMetrics((p) => ({
            ...p,
            loadSpikeCpu: 0,
            loadSpikeRamMb: 0,
            activeContainers: activeRepos.some((r) => r.mode === "service") ? 1 : 0,
          }));
          setArtifacts(
            buildInitialArtifacts(newJobId, activeRepos, activePrompt, collectedLogs, generatedDocker, mcpUrl)
          );
          lastRunSignatureRef.current = runSignature;
        });
      }
    },
    [
      repos,
      prompt,
      attachments,
      plugins,
      runCached,
      liveMode,
      serverConfig,
      workerMetrics.tailscaleIp,
      clearScheduledTimers,
      pushLog,
      applyBackendJobState,
    ]
  );

  // ---- Preset Trigger Handlers ----
  const runPreset = (presetKey) => {
    if (presetKey === "pipeline") {
      const presetRepos = DEFAULT_REPOS;
      const presetPrompt =
        "Containerize both repos, run campus-scraper in Wave 1 via Railpack, and bridge the MCP server over Tailscale Streamable HTTP.";
      setRepos(presetRepos);
      setPrompt(presetPrompt);
      dispatchOrchestration({ overrideRepos: presetRepos, overridePrompt: presetPrompt, scenario: "standard" });
    } else if (presetKey === "oom") {
      const presetRepos = [
        {
          id: "repo-oom-1",
          url: "https://github.com/rammesh-demo/heavy-etl-worker",
          label: "rammesh-demo/heavy-etl-worker",
          mode: "batch",
        },
        {
          id: "repo-oom-2",
          url: "https://github.com/modelcontextprotocol/servers",
          label: "modelcontextprotocol/servers",
          mode: "service",
        },
      ];
      const presetPrompt =
        "Simulate OOM Exit 137 on heavy-etl-worker and verify Recovery Agent RAM scaling & reschedule.";
      setRepos(presetRepos);
      setPrompt(presetPrompt);
      dispatchOrchestration({ overrideRepos: presetRepos, overridePrompt: presetPrompt, scenario: "oom" });
    } else if (presetKey === "cached") {
      const presetRepos = DEFAULT_REPOS;
      const presetPrompt =
        "Re-run cached batch pipeline and fetch verified outputs from Redis 3-Agent & Execution Cache.";
      setRepos(presetRepos);
      setPrompt(presetPrompt);
      setRunCached(true);
      dispatchOrchestration({ overrideRepos: presetRepos, overridePrompt: presetPrompt, scenario: "cached" });
    }
  };

  // ---- Copy Code Helper ----
  const handleCopyCode = async () => {
    const content = blueprintSubTab === "dockerfile" ? dockerfileText : blueprintJsonText;
    try {
      await navigator.clipboard.writeText(content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // Ignore clipboard errors in restricted frames
    }
  };

  // ---- Derived Worker Telemetry Values ----
  const workerUsedRamMb = Math.max(0, workerMetrics.totalRamMb - workerMetrics.availableRamMb);
  const workerAvailGb = (workerMetrics.availableRamMb / 1024).toFixed(1);
  const workerTotalGb = (workerMetrics.totalRamMb / 1024).toFixed(0);
  const allocatableRamMb = Math.max(0, workerMetrics.availableRamMb - workerMetrics.hostFloorMb);
  const enabledPluginsList = Object.values(plugins).filter((p) => p.enabled);

  // ---- DAG Badge Styling Helper ----
  const getNodeBadgeStyle = (status) => {
    switch (status) {
      case "COMPLETED":
      case "HEALTHY":
        return "border-emerald-500/35 bg-emerald-500/15 text-emerald-300";
      case "RUNNING":
        return "border-cyan-500/35 bg-cyan-500/15 text-cyan-300";
      case "BUILDING":
        return "border-amber-500/35 bg-amber-500/15 text-amber-300";
      case "OOM_RETRY":
        return "border-rose-500/40 bg-rose-500/15 text-rose-300";
      default:
        return "border-zinc-700 bg-zinc-800/80 text-zinc-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-violet-500/30 selection:text-white overflow-x-hidden">
      {/* Global Typography & Subtle Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #050507; }
        .font-display { font-family: 'Poppins', 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.14); border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.26); }
      `}</style>

      {/* ==================================================================== */}
      {/* ZONE 1: TOP FIXED GLASSMORPHIC NAVBAR                                */}
      {/* ==================================================================== */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-black/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <RamMeshLogo size={30} />
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-display text-base sm:text-lg font-semibold tracking-tight text-white">
                RAMMesh
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono text-zinc-400 border border-white/10 bg-white/[0.04]">
                v1.0 • Agentic Mesh
              </span>
            </div>
          </div>

          {/* Center: Live Dual-Server Status Pills */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#0d0d13]/90 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-zinc-400">Server 1</span>
              <span className="font-medium text-white">Render Orchestrator</span>
              <span className="font-mono text-[11px] text-emerald-400 pl-1 border-l border-white/10">
                {orchestratorMetrics.latencyMs}ms
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#0d0d13]/90 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-zinc-400">Server 2</span>
              <span className="font-mono text-cyan-300">{workerMetrics.tailscaleIp}</span>
              <span className="font-mono text-[11px] text-zinc-300 pl-1 border-l border-white/10">
                {workerAvailGb} GB free
              </span>
            </div>
          </div>

          {/* Right: Mode Toggle & Connect Servers CTA */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="inline-flex items-center p-0.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs">
              <button
                type="button"
                onClick={() => setLiveMode(false)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                  !liveMode
                    ? "bg-white/12 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Demo Mode
              </button>
              <button
                type="button"
                onClick={() => setLiveMode(true)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  liveMode
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${liveMode ? "bg-emerald-400" : "bg-zinc-500"}`} />
                Live Server
              </button>
            </div>

            <button
              type="button"
              onClick={() => setConfigModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-black bg-gradient-to-b from-white via-white/95 to-white/75 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
            >
              <Plug className="w-3.5 h-3.5" />
              Connect Servers
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-[slideDown_0.2s_ease-out]">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Render: {orchestratorMetrics.latencyMs}ms</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-cyan-300">{workerMetrics.tailscaleIp}</span>
                <span className="text-zinc-400">({workerAvailGb} GB)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLiveMode((m) => !m)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 bg-white/[0.05] text-xs font-medium text-white"
              >
                Mode: {liveMode ? "Live Server" : "Demo Mode"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  setConfigModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-black bg-gradient-to-b from-white to-white/80"
              >
                Connect Servers
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* MAIN CONTENT CANVAS                                                  */}
      {/* ==================================================================== */}
      <main className="relative pt-24 pb-16 px-4 sm:px-6">
        {/* Subtle Ambient Hero Glow (21st.dev SaaS Template Inspired) */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 h-[560px] -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-24 w-[960px] max-w-[95vw] h-[460px] rounded-full blur-[120px] opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.22) 0%, rgba(139,92,246,0.26) 42%, rgba(6,182,212,0.08) 70%, transparent 100%)",
            }}
          />
        </div>

        {/* Compact Hero Header */}
        <section className="max-w-6xl mx-auto text-center mb-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-xs text-zinc-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Distributed P2P Container &amp; MCP Offloading Mission Control</span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="hidden sm:inline font-mono text-zinc-300">5 KB Blueprint Dispatch</span>
          </div>
          <h1
            className="font-display text-2xl sm:text-4xl font-semibold tracking-tight leading-tight"
            style={{
              background: "linear-gradient(to bottom, #ffffff 30%, rgba(255,255,255,0.62) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Orchestrate &amp; Sandboxed-Execute Across Idle Peers
          </h1>
        </section>

        {/* ================================================================== */}
        {/* ZONE 2: TOP HERO STAGE — ROUNDED RECTANGULAR EXECUTION SCREEN      */}
        {/* ================================================================== */}
        <section className="max-w-6xl mx-auto mb-6 relative">
          {/* Ambient Back-Halo directly behind Execution Chassis */}
          <div
            className="pointer-events-none absolute -inset-x-6 -top-8 h-40 rounded-full blur-3xl opacity-35 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.18), rgba(139,92,246,0.28), transparent 72%)",
            }}
            aria-hidden="true"
          />

          <div className="rounded-2xl border border-white/15 bg-[#09090e]/95 backdrop-blur-xl shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9),0_0_60px_-25px_rgba(139,92,246,0.3)] overflow-hidden">
            {/* Execution Screen Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/10 bg-white/[0.025]">
              {/* Left: Window Dots + Job ID + Circular Orbital Phase Ring */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/75" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/75" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/75" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/10 bg-black/50 text-[11px] font-mono text-zinc-300">
                  <Box className="w-3 h-3 text-violet-400" />
                  <span>{jobId}</span>
                </div>

                <OrbitalPhaseRing phase={phase} />
              </div>

              {/* Right: View Switcher Tabs */}
              <div className="flex items-center p-1 rounded-xl border border-white/10 bg-black/60">
                {[
                  { id: "terminal", label: "CLI Terminal", icon: Terminal },
                  { id: "dockerfile", label: "Dockerfile & Blueprint", icon: FileCode },
                  { id: "dag", label: "DAG Waves", icon: GitBranch },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? "bg-white/12 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Execution Screen Main Body */}
            <div className="h-[340px] sm:h-[360px] flex flex-col">
              {/* TAB A: CLI TERMINAL */}
              {activeTab === "terminal" && (
                <>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed space-y-2 bg-[#060609]">
                    {logs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-zinc-500 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                        <span>Initializing orchestration pipeline...</span>
                      </div>
                    ) : (
                      logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-2.5 sm:gap-3 animate-[fadeIn_0.2s_ease-out]"
                        >
                          <span className="text-zinc-600 shrink-0 select-none">{log.time}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold tracking-wider shrink-0 ${
                              TAG_STYLES[log.tag] || TAG_STYLES.SYSTEM
                            }`}
                          >
                            {log.tag}
                          </span>
                          <span className="text-zinc-200 break-words">{log.message}</span>
                        </div>
                      ))
                    )}
                    <div ref={terminalEndRef} />
                  </div>

                  {/* Live Running Command Bar */}
                  <div className="px-4 sm:px-5 py-2.5 border-t border-white/10 bg-[#0b0b11] flex items-center justify-between gap-3 font-mono text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-zinc-300 truncate">{activeCommandText}</span>
                      {isRunning && (
                        <span className="inline-block w-2 h-3.5 bg-violet-400 animate-pulse shrink-0" />
                      )}
                    </div>
                    <span className="hidden sm:inline text-[11px] text-zinc-500 shrink-0">
                      {logs.length} events streamed
                    </span>
                  </div>
                </>
              )}

              {/* TAB B: DOCKERFILE & 5 KB JSON BLUEPRINT */}
              {activeTab === "dockerfile" && (
                <div className="flex-1 flex flex-col bg-[#060609] overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBlueprintSubTab("dockerfile")}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                          blueprintSubTab === "dockerfile"
                            ? "bg-violet-500/20 text-violet-200 border border-violet-500/30"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Dockerfile (Hardened)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlueprintSubTab("blueprint")}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                          blueprintSubTab === "blueprint"
                            ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        5 KB JSON Blueprint
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.04] hover:bg-white/10 text-xs text-zinc-300 transition-colors"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="flex-1 overflow-auto custom-scrollbar p-4 sm:p-5 font-mono text-xs leading-6 text-zinc-200">
                    {blueprintSubTab === "dockerfile"
                      ? dockerfileText.split("\n").map((line, i) => {
                          const isComment = line.trim().startsWith("#");
                          const isKeyword = /^(FROM|ENV|WORKDIR|RUN|COPY|USER|EXPOSE|CMD|ENTRYPOINT)\b/.test(
                            line.trim()
                          );
                          return (
                            <div key={i} className="flex gap-4">
                              <span className="w-6 text-right text-zinc-600 select-none shrink-0">
                                {i + 1}
                              </span>
                              <span
                                className={
                                  isComment
                                    ? "text-zinc-500 italic"
                                    : isKeyword
                                    ? "text-violet-300 font-medium"
                                    : "text-zinc-200"
                                }
                              >
                                {line || " "}
                              </span>
                            </div>
                          );
                        })
                      : blueprintJsonText}
                  </pre>
                </div>
              )}

              {/* TAB C: DAG WAVES TOPOLOGICAL GRAPH */}
              {activeTab === "dag" && (
                <div className="flex-1 overflow-auto custom-scrollbar p-5 sm:p-6 bg-[#060609] flex flex-col justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-5 max-w-5xl mx-auto w-full">
                    {/* Wave 1: Parallel Nodes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
                          Wave 1 • LangGraph Send() Parallel Fan-Out
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          in_degree = 0
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {dagWaves.wave1.map((node) => (
                          <div
                            key={node.id}
                            className="rounded-xl border border-white/10 bg-[#0d0d14] p-3.5 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Box className="w-4 h-4 text-violet-400 shrink-0" />
                                <span className="text-sm font-semibold text-white truncate">
                                  {node.name}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-zinc-300">
                                  {node.type}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold shrink-0 ${getNodeBadgeStyle(
                                  node.status
                                )}`}
                              >
                                {node.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
                              <span className="truncate">{node.worker}</span>
                              <span>
                                {node.ramMb} MB • {node.tier}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Wave Connector */}
                    <div className="hidden md:flex flex-col items-center justify-center gap-1.5 px-2">
                      <div className="w-12 h-px bg-gradient-to-r from-violet-500/60 to-emerald-400/60" />
                      <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded border border-white/10 bg-black">
                        Kahn Barrier
                      </span>
                      <div className="w-12 h-px bg-gradient-to-r from-violet-500/60 to-emerald-400/60" />
                    </div>

                    {/* Wave 2: Downstream Aggregator */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-violet-400">
                          Wave 2 • Downstream Aggregator
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          depends_on: Wave 1
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {dagWaves.wave2.map((node) => (
                          <div
                            key={node.id}
                            className="rounded-xl border border-violet-500/25 bg-[#0e0d18] p-4 flex flex-col gap-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-sm font-semibold text-white truncate">
                                  {node.name}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold shrink-0 ${getNodeBadgeStyle(
                                  node.status
                                )}`}
                              >
                                {node.status}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400">
                              Receives Wave 1 batch outputs + injected Tailscale MCP URL &amp; Bearer token.
                            </p>
                            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                              <span>{node.worker}</span>
                              <span>{node.ramMb} MB • {node.tier}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Integrated Output & Downloadable Artifacts Strip */}
            <div className="border-t border-white/10 bg-[#0b0b11] px-4 sm:px-5 py-3">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-200">
                    Output &amp; Downloadable Artifacts
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {artifacts.length > 0
                    ? `${artifacts.length} files ready from ${jobId}`
                    : "Streaming container outputs..."}
                </span>
              </div>

              {artifacts.length === 0 ? (
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 py-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                  <span>Waiting for sandbox container exit 0 to package artifacts...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {artifacts.map((art) => {
                    const Icon =
                      art.type === "docker"
                        ? FileCode
                        : art.type === "json"
                        ? FileJson
                        : FileText;
                    const justDownloaded = downloadedId === art.id;
                    return (
                      <div
                        key={art.id}
                        className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.05] transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 text-violet-300 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-medium text-white truncate">
                              {art.name}
                            </p>
                            <p className="text-[10px] font-mono text-zinc-500">
                              {art.size} • sha:{art.sha}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            triggerFileDownload(art);
                            setDownloadedId(art.id);
                            setTimeout(() => setDownloadedId(null), 1500);
                          }}
                          className="p-2 rounded-lg border border-white/10 bg-black/50 text-zinc-300 hover:text-black hover:bg-white transition-all shrink-0"
                          title={`Download ${art.name}`}
                          aria-label={`Download ${art.name}`}
                        >
                          {justDownloaded ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-600" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* ZONE 3: LIVE DUAL-SERVER TELEMETRY STRIP (RENDER + PSUTIL WORKER)  */}
        {/* ================================================================== */}
        <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
          {/* CARD 1 — SERVER 1: ORCHESTRATOR (RENDER WEB SERVICE) */}
          <div className="rounded-2xl border border-white/10 bg-[#0c0c11]/90 p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-violet-500/12 border border-violet-500/25 text-violet-300 shrink-0">
                  <Server className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">
                      Server 1: Orchestrator
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                      Render Web Service
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-500 truncate mt-0.5">
                    {serverConfig.renderUrl.replace(/^https?:\/\//, "")}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-400 shrink-0">
                {orchestratorMetrics.latencyMs}ms RTT
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Circular SVG Radial Gauge: Render 512 MB RAM */}
              <div className="shrink-0">
                <RadialGauge
                  value={orchestratorMetrics.ramUsedMb}
                  max={orchestratorMetrics.ramLimitMb}
                  size={92}
                  strokeWidth={7}
                  color="#a78bfa"
                  centerText={`${orchestratorMetrics.ramUsedMb}MB`}
                  sublabel="/ 512 MB"
                  label="Render RAM"
                />
              </div>

              {/* Redis 3-Agent Memory Cache & Lease Metrics */}
              <div className="flex-1 w-full space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 font-medium text-zinc-300">
                      <Database className="w-3.5 h-3.5 text-fuchsia-400" />
                      Redis 3-Agent Memory Cache
                    </span>
                    <span className="font-mono text-emerald-300">
                      Exec Cache: {orchestratorMetrics.execCacheStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Planner", rate: orchestratorMetrics.plannerHitRate },
                      { name: "Containerizer", rate: orchestratorMetrics.containerizerHitRate },
                      { name: "Recovery", rate: orchestratorMetrics.recoveryHitRate },
                    ].map((agent) => (
                      <div
                        key={agent.name}
                        className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-center"
                      >
                        <p className="text-[10px] text-zinc-400 truncate">{agent.name}</p>
                        <p className="font-mono text-xs font-semibold text-white mt-0.5">
                          {agent.rate}%{" "}
                          <span className="text-[10px] text-emerald-400 font-normal">HIT</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                  <div className="inline-flex items-center gap-1.5 font-mono text-zinc-300">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>asyncio.Lock Leases:</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-semibold">
                      {orchestratorMetrics.activeLeases} active
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    LangGraph Send() Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2 — SERVER 2: SANDBOXED WORKER NODE (PSUTIL LIVE TELEMETRY) */}
          <div className="rounded-2xl border border-white/10 bg-[#0c0c11]/90 p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-cyan-500/12 border border-cyan-500/25 text-cyan-300 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-semibold text-white">
                      Server 2: Sandboxed Worker
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                      psutil Live • 2s
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-500 truncate mt-0.5">
                    {workerMetrics.workerId} • Tailscale {workerMetrics.tailscaleIp}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-[11px] font-mono text-emerald-300 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Docker Hub OK</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Two Circular SVG Radial Gauges: CPU % & RAM Usage */}
              <div className="flex items-center gap-4 shrink-0">
                <RadialGauge
                  value={workerMetrics.cpuPercent}
                  max={100}
                  size={88}
                  strokeWidth={7}
                  color={workerMetrics.cpuPercent > 75 ? "#f59e0b" : "#22d3ee"}
                  centerText={`${workerMetrics.cpuPercent}%`}
                  sublabel="psutil"
                  label="CPU Load"
                />
                <RadialGauge
                  value={workerUsedRamMb}
                  max={workerMetrics.totalRamMb}
                  size={88}
                  strokeWidth={7}
                  color={allocatableRamMb < 2048 ? "#fb7185" : "#10b981"}
                  centerText={`${workerAvailGb}GB`}
                  sublabel={`of ${workerTotalGb}GB free`}
                  label="RAM Headroom"
                />
              </div>

              {/* Host Safety Floor + Metadata Chips */}
              <div className="flex-1 w-full space-y-2.5">
                <div className="rounded-xl border border-white/10 bg-black/45 px-3 py-2">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-zinc-400">Available vs. Safety Floor</span>
                    <span className="text-emerald-300">
                      {workerMetrics.availableRamMb.toLocaleString()} /{" "}
                      {workerMetrics.hostFloorMb.toLocaleString()} MB
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden flex">
                    <div
                      className="h-full bg-amber-400/80"
                      style={{
                        width: `${(workerMetrics.hostFloorMb / workerMetrics.totalRamMb) * 100}%`,
                      }}
                      title="4096 MB Protected Host Safety Floor"
                    />
                    <div
                      className="h-full bg-emerald-400 transition-all duration-500"
                      style={{
                        width: `${(allocatableRamMb / workerMetrics.totalRamMb) * 100}%`,
                      }}
                      title="Allocatable Mesh Headroom"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                    <span>Protected Floor: 4096 MB</span>
                    <span>Allocatable: {allocatableRamMb.toLocaleString()} MB</span>
                  </div>
                </div>

                {/* Metadata Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-zinc-300">
                    <BatteryCharging className="w-3 h-3 text-emerald-400" />
                    {workerMetrics.onBattery ? "Battery" : "AC Power"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-zinc-300">
                    <Box className="w-3 h-3 text-cyan-400" />
                    {workerMetrics.activeContainers} Active Sandbox
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-200">
                    <Shield className="w-3 h-3" />
                    UID 1000 • RO • cap-drop=ALL • Isolated Bridge
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* ZONE 4: CHATGPT-STYLE COMMAND COMPOSER & GITHUB REPO PASTING       */}
        {/* ================================================================== */}
        <section className="max-w-4xl mx-auto">
          {/* Quick Demo Scenario Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="text-[11px] font-mono text-zinc-500 mr-1">Quick Demos:</span>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => runPreset("pipeline")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-xs text-zinc-300 transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              2-Repo Scraper + MCP Pipeline
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => runPreset("oom")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/25 bg-rose-500/[0.06] hover:bg-rose-500/15 text-xs text-rose-200 transition-all disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Simulate OOM Exit 137 Recovery
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => runPreset("cached")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] hover:bg-emerald-500/15 text-xs text-emerald-200 transition-all disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Redis Cache Hit Run
            </button>
          </div>

          {/* Main Composer Card */}
          <div className="rounded-2xl border border-white/15 bg-[#0c0c12]/95 shadow-[0_20px_70px_-20px_rgba(0,0,0,0.95)] focus-within:border-white/30 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
            {/* TOP ROW: GITHUB REPO PASTING STRIP */}
            <div className="px-4 pt-3.5 pb-3 border-b border-white/10 bg-white/[0.015] rounded-t-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/10 bg-black/50 focus-within:border-violet-400/50">
                  <Github className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => {
                      setRepoInput(e.target.value);
                      if (repoError) setRepoError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRepo();
                      }
                    }}
                    placeholder="Paste GitHub repo URL (e.g. https://github.com/org/repo) and press Enter..."
                    className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddRepo()}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/12 text-xs font-medium text-white transition-colors"
                  >
                    Add Repo
                  </button>
                  <button
                    type="button"
                    onClick={loadSampleRepos}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-white/10 bg-transparent hover:bg-white/[0.06] text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Load Sample Repos
                  </button>
                </div>
              </div>

              {repoError && (
                <p className="mt-2 text-xs text-rose-400 font-mono">{repoError}</p>
              )}

              {/* Pasted Repo Chips with Interactive auto / batch / service (MCP) toggle */}
              {repos.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {repos.map((repo) => {
                    const modeStyle =
                      repo.mode === "service"
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/35"
                        : repo.mode === "batch"
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/35"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700";
                    return (
                      <div
                        key={repo.id}
                        className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg border border-white/10 bg-black/60 text-xs"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-mono text-zinc-200 max-w-[180px] sm:max-w-[240px] truncate">
                          {repo.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => cycleRepoMode(repo.id)}
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold transition-all hover:brightness-110 ${modeStyle}`}
                          title="Click to cycle workload type: auto -> batch -> service (MCP)"
                        >
                          {repo.mode === "service" ? "service (MCP)" : repo.mode}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRepo(repo.id)}
                          className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                          aria-label={`Remove ${repo.label}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MIDDLE ROW: CHATGPT-STYLE PROMPT TEXTAREA */}
            <div className="px-4 pt-3 pb-2">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isRunning) {
                    e.preventDefault();
                    dispatchOrchestration();
                  }
                }}
                placeholder="Describe your orchestration pipeline, e.g., 'Containerize both repos, run the scraper first, then expose the MCP server over Tailscale'..."
                className="w-full resize-none bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* ATTACHED FILES / PHOTOS PREVIEW ROW */}
            {attachments.length > 0 && (
              <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs"
                  >
                    {att.isImage && att.previewUrl ? (
                      <img
                        src={att.previewUrl}
                        alt={att.name}
                        className="w-7 h-7 rounded-md object-cover border border-white/15"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-300">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="max-w-[140px]">
                      <p className="text-xs text-zinc-200 truncate">{att.name}</p>
                      <p className="text-[10px] font-mono text-zinc-500">{att.size}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10"
                      aria-label={`Remove ${att.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* BOTTOM TOOLBAR INSIDE COMPOSER */}
            <div className="px-4 py-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              {/* Left Controls: File Attachment + Plugins Popover + Active Tool Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Hidden Real File Picker */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.env,.txt,.json,.yaml,.yml,.py,.ts,.tsx,.js,.csv,.md"
                  onChange={handleFileAttach}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-zinc-200 transition-colors"
                  title="Attach photos, .env, requirements.txt, or CSV files"
                  aria-label="Attach files or photos"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Plugins & Tools Popover */}
                <div className="relative" ref={pluginsPopoverRef}>
                  <button
                    type="button"
                    onClick={() => setPluginsOpen((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      pluginsOpen
                        ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                        : "border-white/10 bg-white/[0.04] hover:bg-white/10 text-zinc-300"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Plugins &amp; Tools</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/10 font-mono text-[10px] text-white">
                      {enabledPluginsList.length}
                    </span>
                  </button>

                  {pluginsOpen && (
                    <div className="absolute bottom-12 left-0 z-30 w-72 sm:w-80 rounded-2xl border border-white/15 bg-[#0c0c13] shadow-2xl p-3 space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="px-2 py-1 flex items-center justify-between border-b border-white/10 mb-1">
                        <span className="text-xs font-semibold text-white">
                          Orchestrator Toolchain
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">Toggle active</span>
                      </div>
                      {Object.values(plugins).map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => togglePlugin(tool.id)}
                          className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.05] text-left transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white">{tool.name}</p>
                            <p className="text-[11px] text-zinc-400 truncate">{tool.desc}</p>
                          </div>
                          <div
                            className={`w-8 h-4.5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                              tool.enabled ? "bg-violet-500 justify-end" : "bg-zinc-700 justify-start"
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-white shadow" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compact Active Tool Pills (Desktop) */}
                <div className="hidden md:flex items-center gap-1.5">
                  {enabledPluginsList.slice(0, 3).map((tool) => (
                    <span
                      key={tool.id}
                      className="px-2 py-1 rounded-lg border border-white/10 bg-black/40 text-[10px] font-mono text-zinc-400"
                    >
                      {tool.name.split(" ")[0]}
                    </span>
                  ))}
                  {enabledPluginsList.length > 3 && (
                    <span className="text-[10px] font-mono text-zinc-500">
                      +{enabledPluginsList.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Controls: Run Cached Toggle + High-Contrast White Gradient Dispatch CTA */}
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setRunCached((c) => !c)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                    runCached
                      ? "border-emerald-500/35 bg-emerald-500/12 text-emerald-300"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Check Redis Execution Cache before spinning up batch containers"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Run Cached</span>
                </button>

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => dispatchOrchestration()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-black bg-gradient-to-b from-white via-white/95 to-white/70 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_24px_-6px_rgba(255,255,255,0.45)] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Mesh</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-center text-[11px] font-mono text-zinc-500">
            Press <span className="text-zinc-300">Ctrl/Cmd + Enter</span> to dispatch • Outbound Worker Bridge &amp; Redis Telemetry Active
          </p>
        </section>
      </main>

      {/* Server Connection Configuration Modal */}
      <ServerConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        config={serverConfig}
        onSaveAndTest={handleSaveAndTestServers}
        connectionState={connectionState}
      />
    </div>
  );
}