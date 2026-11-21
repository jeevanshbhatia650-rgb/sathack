export interface LegalClause {
  number: string;
  title: string;
  summary: string;
  fullText: string;
  badge: string;
}

export const LEGAL_CLAUSES: LegalClause[] = [
  {
    number: '01',
    title: '100% Intellectual Property & Source Code Assignment',
    badge: 'Zero Vendor Lock-In',
    summary: 'Client owns 100% of custom source code, models, agent setups, and database schemas with zero proprietary lock-in.',
    fullText: 'Upon receipt of final milestone payment, WebWink Protocol assigns 100% of custom source code, OpenClaw agent configurations, system prompts, and database schemas exclusively to the Client with zero lock-in.',
  },
  {
    number: '02',
    title: 'Confidentiality, NDA & Zero-Model-Training Covenant',
    badge: 'Enterprise Privacy',
    summary: 'Client data is processed strictly via zero-data-retention enterprise endpoints and is never used to train public foundation models.',
    fullText: 'All Client credentials, API keys, and customer records are isolated via encrypted environment variables and processed strictly through zero-data-retention enterprise endpoints. WebWink Protocol never trains public or shared foundation models on Client data.',
  },
  {
    number: '03',
    title: 'Week-1 Pilot & 14-Day Sprint Milestone Escrow',
    badge: 'Performance Milestone',
    summary: '50% setup deposit initiates sprint; 7-day working pilot demonstrated; remaining 50% due only after passing documented staging tests.',
    fullText: 'Engagements initiate with a 50% setup deposit. A working pilot on real data is demonstrated within 7 calendar days. The remaining 50% setup balance is due only after the system passes documented functional, security, and load tests on the staging environment.',
  },
  {
    number: '04',
    title: '"Run & Improve" Maintenance Retainer & Pass-Through Infrastructure',
    badge: '0% Agency Token Markup',
    summary: 'Retainers cover continuous error tracking, evals, and upgrades. Raw cloud, telephony, and LLM API costs are billed directly to Client at 0% markup.',
    fullText: 'Monthly retainers (India: ₹30,000–₹60,000/mo | Global: $500–$950/mo) cover continuous error tracking, prompt evaluation, webhook maintenance, and upgrades to newer frontier models. Raw third-party cloud hosting, telephony, and LLM API token bills are paid directly by the Client at 0% agency markup. Either party may terminate recurring maintenance with 30 days\' written notice.',
  },
  {
    number: '05',
    title: 'Human-in-the-Loop Safety & Limitation of Liability',
    badge: 'Risk Mitigation',
    summary: 'Mandatory human approval gates for financial or destructive actions. Contractual liability capped at total setup fees paid in the past 90 days.',
    fullText: 'Every production agent affecting payments, refunds, legal commitments, or destructive database writes includes mandatory human-in-the-loop approval gates. Aggregate contractual liability under this agreement is strictly capped at the total setup fees paid by the Client during the preceding 90 days.',
  },
  {
    number: '06',
    title: 'Governing Law & Dispute Resolution',
    badge: 'Arbitration & 14-Day Cure',
    summary: 'International commercial arbitration rules apply, with a mandatory 14-day good-faith engineering cure window prior to escalation.',
    fullText: 'Commercial engagements are governed by standard international software service arbitration rules, with a mandatory 14-day good-faith engineering cure period prior to formal dispute escalation.',
  },
];
