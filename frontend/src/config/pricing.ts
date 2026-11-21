export interface PricingTier {
  id: string;
  badge: string;
  name: string;
  tagline: string;
  featured?: boolean;
  india: {
    setupPrice: string;          // 25% lower than Quanta AI Labs baseline
    originalAnchorSetup: string; // Quanta AI Labs baseline shown as strikethrough
    retainerPrice: string;       // 25% lower than Quanta AI Labs retainer
    originalAnchorRetainer: string;
  };
  global: {
    setupPrice: string;          // USD equivalent
    retainerPrice: string;       // USD monthly retainer
  };
  deliveryTime: string;
  channelsIncluded: string;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier-1-pilot',
    badge: '01 / SINGLE WORKFLOW OR AGENT',
    name: 'Starter Agent & Pilot Setup',
    tagline: 'One focused AI agent or automation workflow connected to your live data with a working pilot in week one.',
    india: {
      setupPrice: '₹37,500',
      originalAnchorSetup: '₹50,000',
      retainerPrice: '₹30,000 / mo',
      originalAnchorRetainer: '₹40,000 / mo',
    },
    global: {
      setupPrice: '$600',
      retainerPrice: '$500 / mo',
    },
    deliveryTime: '7-Day Working Pilot',
    channelsIncluded: '1 Channel (WhatsApp, Web Chat, or Internal Tool)',
    features: [
      '30-minute discovery & workflow leverage audit',
      'Working pilot on your real customer enquiries in 7 days',
      'Human-in-the-loop escalation for sensitive actions',
      'Server-side validation, rate limiting & secrets isolation',
      'Run & Improve Retainer: error monitoring, evals & model upgrades',
    ],
  },
  {
    id: 'tier-2-core-sprint',
    badge: '02 / MOST POPULAR · FULL SYSTEM',
    name: '14-Day Core System Sprint',
    tagline: 'High-ticket custom web application + multi-channel Voice & WhatsApp AI agent integrated with your CRM.',
    featured: true,
    india: {
      setupPrice: '₹1,12,500',
      originalAnchorSetup: '₹1,50,000',
      retainerPrice: '₹45,000 / mo',
      originalAnchorRetainer: '₹60,000 / mo',
    },
    global: {
      setupPrice: '$1,800',
      retainerPrice: '$750 / mo',
    },
    deliveryTime: '14-Day Production Sprint',
    channelsIncluded: 'Web App + Voice + WhatsApp + CRM Sync',
    features: [
      'Custom Next.js / 3D interactive web application or portal',
      'Inbound/Outbound AI Voice Agent + WhatsApp Concierge',
      'OpenClaw harness with persistent memory & RBAC permissions',
      'Automated Unit, Integration & End-to-End (E2E) test suite',
      'Run & Improve Retainer: weekly prompt tuning & frontier model swaps',
    ],
  },
  {
    id: 'tier-3-enterprise',
    badge: '03 / MULTI-AGENT ECOSYSTEM',
    name: 'Full Multi-System Architecture',
    tagline: 'End-to-end autonomous operations across Voice, WhatsApp, Slack, Telegram, and custom ERP databases.',
    india: {
      setupPrice: '₹2,25,000',
      originalAnchorSetup: '₹3,00,000',
      retainerPrice: '₹60,000 / mo',
      originalAnchorRetainer: '₹80,000 / mo',
    },
    global: {
      setupPrice: '$3,600',
      retainerPrice: '$950 / mo',
    },
    deliveryTime: '21-Day Multi-System Rollout',
    channelsIncluded: 'Unlimited Channels + Custom ERP / Database Replicas',
    features: [
      'Multi-agent orchestration across sales, support & internal ops',
      'Database indexing, connection pooling, read-replicas & backups',
      'Staging environment, CI/CD pipelines, Docker & load testing',
      'Distributed tracing, structured logging & 24/7 uptime alerting',
      'Run & Improve Retainer: dedicated priority SLA & custom eval harness',
    ],
  },
];

export const SELF_SERVE_TIER = {
  name: 'Self-Serve AI Video & Workflow Pro',
  description: 'Instant access to our browser-based AI video editor, motion graphics templates, and weekly frontier AI release tracker.',
  indiaPrice: '₹375 / month',
  indiaAnchor: '₹499 / month',
  globalPrice: '$9 / month',
  trialNote: 'First video / workflow execution 100% free · No credit card required',
};
