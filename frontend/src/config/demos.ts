export interface DemoProject {
  id: string;
  slotNumber: string;
  category: string;
  title: string;
  description: string;
  metrics: string;
  accentColor: '#B4B0F5' | '#E2C870';
  tiltDeg: number;
  translateY: number;
  /** PASTE YOUR LIVE DEMO WEBSITE LINK BELOW */
  demoUrl: string;
  techStack: string[];
}

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: 'voice-agent',
    slotNumber: '01',
    category: 'AI Voice Agents',
    title: 'Inbound Voice Receptionist & Booking Agent',
    description: 'Answers phone calls in <400ms, qualifies leads in Hindi/English, checks calendar availability, and books appointments directly into CRM.',
    metrics: '99.4% Uptime · <400ms Latency',
    accentColor: '#B4B0F5',
    tiltDeg: -7.5,
    translateY: 24,
    demoUrl: '', // <-- Leave open slot for live demo link
    techStack: ['ElevenLabs', 'Twilio', 'Claude 3.7', 'WebSockets'],
  },
  {
    id: 'whatsapp-concierge',
    slotNumber: '02',
    category: 'WhatsApp & Web Agents',
    title: 'Omnichannel WhatsApp Sales & Catalog Concierge',
    description: 'Handles product discovery, sends interactive quotes, processes order status lookups, and escalates high-value deals to human reps.',
    metrics: '3.2x Conversion Lift',
    accentColor: '#E2C870',
    tiltDeg: -4.5,
    translateY: 10,
    demoUrl: '', // <-- Leave open slot for live demo link
    techStack: ['WhatsApp Cloud API', 'OpenClaw', 'PostgreSQL', 'Redis'],
  },
  {
    id: 'conversion-web',
    slotNumber: '03',
    category: 'High-Ticket Web Apps',
    title: 'Interactive 3D WebGL Conversion Engine',
    description: '60fps Three.js / R3F product configurators and brutalist editorial web apps engineered to close high-ticket B2B contracts.',
    metrics: '14-Day Sprint Delivery',
    accentColor: '#B4B0F5',
    tiltDeg: -1.5,
    translateY: 0,
    demoUrl: '', // <-- Leave open slot for live demo link
    techStack: ['Next.js', 'React Three Fiber', 'View Transitions', 'Tailwind'],
  },
  {
    id: 'ai-video-workflow',
    slotNumber: '04',
    category: 'Workflow Automation',
    title: 'AI Video & Motion Graphics Pipeline',
    description: 'Upload raw product clips and generate polished vertical ads with automated captions, b-roll, and motion graphics in 60 seconds.',
    metrics: '80% Faster Content Ops',
    accentColor: '#E2C870',
    tiltDeg: 1.5,
    translateY: 0,
    demoUrl: '', // <-- Leave open slot for live demo link
    techStack: ['Remotion', 'FFmpeg', 'Gemini Pro', 'Worker Queues'],
  },
  {
    id: 'openclaw-harness',
    slotNumber: '05',
    category: 'Multi-Agent Systems',
    title: 'OpenClaw Executive & Slack Operations Agent',
    description: 'Persistent agent across Slack, Telegram, and Email that drafts proposals, queries internal SQL databases, and runs scheduled cron reports.',
    metrics: 'Human-in-the-Loop Guardrails',
    accentColor: '#B4B0F5',
    tiltDeg: 4.5,
    translateY: 10,
    demoUrl: '', // <-- Leave open slot for live demo link
    techStack: ['OpenClaw', 'Docker', 'RBAC', 'Audit Logs'],
  },
  {
    id: 'custom-erp-saas',
    slotNumber: '06',
    category: 'AI-Native SaaS & ERP',
    title: 'Custom Internal Portal & Automated Quoting Engine',
    description: 'Replaces fragile spreadsheets with a production-hardened web portal featuring role-based access, automated invoicing, and RAG search.',
    metrics: 'Zero-Downtime Architecture',
    accentColor: '#E2C870',
    tiltDeg: 7.5,
    translateY: 24,
    demoUrl: '', // <-- Leave open slot for live demo link
    techStack: ['Next.js', 'Prisma', 'Read Replicas', 'E2E Tested'],
  },
];
