import { jsPDF } from 'jspdf';
import { PRICING_TIERS, SELF_SERVE_TIER } from '../config/pricing';
import { LEGAL_CLAUSES } from '../config/legalClauses';
import { Region } from '../hooks/useGeoPricing';

export function generateBrochurePdf(region: Region): jsPDF {
  const isIndia = region === 'IN';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Background tint for page 1
  doc.setFillColor(250, 249, 245);
  doc.rect(0, 0, pageWidth, 297, 'F');

  // Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(17, 17, 17);
  doc.text('WEBWINK PROTOCOL', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.text(
    '2026 Commercial Architecture & Rate Card · Confidential Client Brief',
    margin,
    y + 6
  );

  // Region Badge
  doc.setFillColor(isIndia ? 226 : 180, isIndia ? 200 : 176, isIndia ? 112 : 245);
  doc.roundedRect(pageWidth - margin - 58, y - 5, 58, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(17, 17, 17);
  doc.text(
    isIndia ? 'REGION: INDIA (INR ₹ · 25% OFF)' : 'REGION: GLOBAL (USD $)',
    pageWidth - margin - 54,
    y + 2
  );

  y += 18;
  doc.setDrawColor(17, 17, 17);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Section 1: Rate Card Overview
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(17, 17, 17);
  doc.text('1. COMMERCIAL RATE CARD & SPRINT PACKAGES', margin, y);
  y += 6;

  PRICING_TIERS.forEach((tier, index) => {
    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 210);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'FD');

    // Accent line on left
    doc.setFillColor(
      index === 1 ? 226 : 180,
      index === 1 ? 200 : 176,
      index === 1 ? 112 : 245
    );
    doc.rect(margin, y, 3, 36, 'F');

    // Tier badge & Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 130);
    doc.text(tier.badge, margin + 8, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 17);
    doc.text(tier.name, margin + 8, y + 12);

    // Pricing
    const setupStr = isIndia
      ? `Setup: ${tier.india.setupPrice} (Baseline: ${tier.india.originalAnchorSetup})`
      : `Setup: ${tier.global.setupPrice}`;
    const retStr = isIndia
      ? `Retainer: ${tier.india.retainerPrice}`
      : `Retainer: ${tier.global.retainerPrice}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(index === 1 ? 160 : 30, index === 1 ? 120 : 30, index === 1 ? 10 : 30);
    doc.text(`${setupStr}  |  ${retStr}`, margin + 8, y + 18);

    // Delivery & Scope
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 90);
    doc.text(`Timeline: ${tier.deliveryTime}  •  Channels: ${tier.channelsIncluded}`, margin + 8, y + 24);

    const bullets = tier.features.slice(0, 2).join('; ');
    doc.text(`Included: ${bullets}...`, margin + 8, y + 30);

    y += 40;
  });

  // Self-Serve note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 110);
  doc.text(
    `Self-Serve Video & Workflow Pro: ${isIndia ? SELF_SERVE_TIER.indiaPrice : SELF_SERVE_TIER.globalPrice} (${SELF_SERVE_TIER.trialNote})`,
    margin,
    y
  );

  y += 12;

  // Engineering Architecture Matrix Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(17, 17, 17);
  doc.text('2. 58-POINT PRODUCTION HARDENED ARCHITECTURE MATRIX', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 70);
  const archIntro =
    'WebWink never delivers "vibe-coded" prototypes. Every deployment enforces 58 production guarantees across:';
  doc.text(archIntro, margin, y);
  y += 5;

  const cats = [
    '• Security & RBAC: Principle of Least Privilege, RS256 Auth, 2FA, Vault Secrets, Server Validation, TLS 1.3.',
    '• Resilience & Traffic: Redis Rate Limiting (Sliding Window), Circuit Breakers, Idempotency-Keys, Timeouts.',
    '• Database & Scale: Normalized Schemas, Connection Pooling, Read Replicas, Soft Deletes, Redis Caching, Cron.',
    '• DevOps & Observability: Vitest/Playwright E2E, Structured JSON Logging, Sentry Error Tracking, CI/CD, Docker.',
  ];
  cats.forEach((cat) => {
    doc.text(cat, margin + 4, y);
    y += 4.5;
  });

  // PAGE 2: The 6 Binding Commercial & Legal Clauses
  doc.addPage();
  doc.setFillColor(250, 249, 245);
  doc.rect(0, 0, pageWidth, 297, 'F');

  y = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 17, 17);
  doc.text('3. BINDING LEGAL & COMMERCIAL TERMS', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 110);
  doc.text(
    'The following 6 clauses govern all discovery, sprint pilots, and retainers under WebWink Protocol:',
    margin,
    y
  );
  y += 10;

  LEGAL_CLAUSES.forEach((clause) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(210, 210, 220);
    doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 17, 17);
    doc.text(`Clause ${clause.number}: ${clause.title}`, margin + 6, y + 6);

    doc.setFillColor(240, 240, 245);
    doc.roundedRect(pageWidth - margin - 48, y + 2, 44, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(80, 80, 90);
    doc.text(clause.badge, pageWidth - margin - 46, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 60);

    const splitText = doc.splitTextToSize(clause.fullText, contentWidth - 12);
    doc.text(splitText, margin + 6, y + 13);

    y += 36;
  });

  // Footer on page 2
  y = 270;
  doc.setDrawColor(180, 180, 190);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 130);
  doc.text(
    'WebWink Protocol · Autonomous Voice, Web & Multi-Agent Architecture · contact@webwink.io',
    margin,
    y
  );
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 35, y);

  return doc;
}
