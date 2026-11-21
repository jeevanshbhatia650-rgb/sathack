"use client";

import React from "react";

interface TechIcon {
  name: string;
  svg: React.ReactNode;
}

const ICONS_ROW_1: TechIcon[] = [
  {
    name: "OpenAI",
    svg: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.9816-2.886a4.504 4.504 0 0 1 6.5288 4.9082zM12 14.7078l-3.3543-1.9367 3.3543-1.9367 3.3543 1.9367z" />
      </svg>
    ),
  },
  {
    name: "Anthropic Claude",
    svg: (
      <svg className="w-8 h-8 text-[#D97706]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 4.5h-3.21l5.228 15h3.21l-5.228-15zm-10.944 0H3.318L8.546 19.5h3.21L6.528 4.5zm4.848 5.75l-1.97 5.65h5.188l-1.97-5.65h-1.248z" />
      </svg>
    ),
  },
  {
    name: "Next.js",
    svg: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 17.5l-6-8.25V17.5H8.25V6.5h2.25l6 8.25V6.5h2.25v11H16.5z" />
      </svg>
    ),
  },
  {
    name: "React",
    svg: (
      <svg className="w-8 h-8 text-[#61DAFB]" viewBox="0 0 24 24" fill="currentColor">
        <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Tailwind CSS",
    svg: (
      <svg className="w-8 h-8 text-[#06B6D4]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    svg: (
      <svg className="w-8 h-8 text-[#3178C6]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zm9.585 10.969v2.246c-.73-.398-1.508-.601-2.332-.601-.89 0-1.559.222-2.008.664-.449.441-.672 1.054-.672 1.836 0 .766.223 1.371.672 1.816.449.441 1.118.664 2.008.664.824 0 1.602-.203 2.332-.601v2.246c-.848.375-1.813.562-2.895.562-1.688 0-3.008-.484-3.961-1.453-.949-.973-1.426-2.293-1.426-3.957 0-1.688.477-3.023 1.426-4.004.953-.984 2.273-1.477 3.961-1.477 1.082 0 2.047.195 2.895.562zm10.742 2.051c-.344-.227-.852-.469-1.523-.727-.672-.258-1.258-.551-1.758-.879-.496-.328-.859-.711-1.09-1.148-.227-.441-.34-.977-.34-1.609 0-.672.164-1.273.492-1.805.332-.535.805-.957 1.418-1.266.617-.312 1.363-.469 2.238-.469 1.137 0 2.148.246 3.031.738l-1.055 2.156c-.664-.375-1.344-.562-2.039-.562-.57 0-1.008.125-1.312.375-.301.246-.453.59-.453 1.031 0 .344.094.629.281.855.191.223.477.418.855.586.383.168.855.352 1.418.551.566.195 1.121.43 1.664.703.547.273.988.625 1.324 1.055.34.426.508.973.508 1.641 0 .723-.172 1.367-.516 1.934-.34.562-.832.996-1.477 1.301-.641.301-1.418.453-2.332.453-1.293 0-2.453-.301-3.48-.902l1.172-2.18c.801.488 1.621.734 2.461.734.621 0 1.109-.137 1.465-.41.359-.277.539-.668.539-1.172 0-.391-.102-.711-.305-.961-.2-.25-.512-.473-.938-.668z" />
      </svg>
    ),
  },
  {
    name: "GSAP",
    svg: (
      <span className="font-black text-2xl tracking-tighter text-[#88CE02]">GSAP</span>
    ),
  },
  {
    name: "Python",
    svg: (
      <svg className="w-8 h-8 text-[#38BDF8]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.91 0c-1.92 0-3.7.16-5.1.47-4.07.88-4.8 2.5-4.8 5.6v4.14h9.9v1.4H4.07C1.8 11.61 0 13.4 0 16.63c0 3.25 1.88 5.25 5.25 5.92 1.63.32 3.42.45 5.3.45 1.83 0 3.56-.14 5-.45 3.93-.86 4.9-2.52 4.9-5.63v-4.14H10.5V11.4h9.9c2.3 0 4.1-1.8 4.1-5 0-3.23-1.87-5.23-5.23-5.91-1.63-.33-3.46-.49-5.36-.49zm-2.8 2.27c.65 0 1.18.53 1.18 1.18 0 .65-.53 1.18-1.18 1.18s-1.18-.53-1.18-1.18c0-.65.53-1.18 1.18-1.18zm8.68 15.68c.65 0 1.18.53 1.18 1.18 0 .65-.53 1.18-1.18 1.18s-1.18-.53-1.18-1.18c0-.65.53-1.18 1.18-1.18z" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    svg: (
      <svg className="w-8 h-8 text-[#635BFF]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697.5 12.521.5 6.302.5 2.052 3.738 2.052 8.784c0 6.643 9.143 5.485 9.143 8.305 0 1.05-.935 1.488-2.28 1.488-2.474 0-5.385-1.155-7.145-2.146l-.92 5.515c1.69.878 4.795 1.554 7.97 1.554 6.425 0 10.92-3.14 10.92-8.324 0-6.903-9.143-5.719-9.143-8.305z" />
      </svg>
    ),
  },
  {
    name: "Cloudflare",
    svg: (
      <svg className="w-8 h-8 text-[#F38020]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.2 13.6c-.2-.8-.8-1.5-1.5-1.9-.3-.2-.7-.3-1.1-.3h-.8c-.3-1.9-1.9-3.4-3.9-3.4-1.5 0-2.8.8-3.5 2-.4-.1-.8-.1-1.2-.1-2.2 0-4 1.8-4 4 0 .3 0 .7.1 1h16.2c.4-.4.7-.8.7-1.3z" />
      </svg>
    ),
  },
];

const ICONS_ROW_2: TechIcon[] = [
  {
    name: "Supabase",
    svg: (
      <svg className="w-8 h-8 text-[#3ECF8E]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.996 0C5.37 0 0 5.37 0 11.996c0 6.627 5.37 11.997 11.996 11.997 6.627 0 11.997-5.37 11.997-11.997C23.993 5.37 18.623 0 11.996 0zm-1.07 18.528l-4.148-5.334h5.218V5.464l4.148 5.333h-5.218v7.731z" />
      </svg>
    ),
  },
  {
    name: "PostgreSQL",
    svg: (
      <svg className="w-8 h-8 text-[#60A5FA]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z" />
      </svg>
    ),
  },
  {
    name: "n8n",
    svg: (
      <svg className="w-8 h-8 text-[#F43F5E]" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="12" r="4" fill="currentColor" />
        <circle cx="18" cy="12" r="4" fill="currentColor" />
        <path d="M6 12h12" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
  {
    name: "Vercel",
    svg: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L24 22H0L12 1Z" />
      </svg>
    ),
  },
  {
    name: "Docker",
    svg: (
      <svg className="w-8 h-8 text-[#0284C7]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186H8.1a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m21.728 1.488c-.372-.256-1.428-.42-2.316-.36-1.139.076-2.19.467-3.03 1.077-.42-.14-.87-.22-1.34-.22H1.968c-.628 0-1.144.516-1.144 1.144 0 4.195 2.87 7.784 7.02 8.643 1.02.21 2.07.32 3.14.32 6.55 0 11.96-4.66 12.92-10.97.02-.13-.03-.26-.14-.33" />
      </svg>
    ),
  },
  {
    name: "LangChain",
    svg: (
      <span className="text-3xl filter drop-shadow">🦜</span>
    ),
  },
  {
    name: "WhatsApp Business",
    svg: (
      <svg className="w-8 h-8 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 0C5.394 0 0 5.394 0 12.031c0 2.119.55 4.184 1.594 6.006L0 24l6.141-1.575a11.983 11.983 0 0 0 5.89 1.528h.005c6.632 0 12.026-5.395 12.026-12.031 0-3.213-1.252-6.234-3.525-8.508A11.95 11.95 0 0 0 12.031 0zm0 21.956h-.004a9.948 9.948 0 0 1-5.07-1.385l-.364-.216-3.768.97 1.004-3.673-.237-.378a9.932 9.932 0 0 1-1.525-5.243c0-5.497 4.473-9.97 9.973-9.97 2.664 0 5.168 1.037 7.05 2.92a9.92 9.92 0 0 1 2.917 7.05c0 5.498-4.473 9.975-9.976 9.975zm5.467-7.464c-.3-.15-1.774-.875-2.05-.975-.274-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.266-.467-2.41-1.488a8.966 8.966 0 0 1-1.668-2.073c-.175-.3-.019-.462.131-.611.135-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.583-.492-.504-.675-.513-.175-.008-.375-.01-.575-.01s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.494 1.71.633.72.23 1.375.197 1.892.12.576-.086 1.774-.725 2.025-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
      </svg>
    ),
  },
  {
    name: "Google Cloud",
    svg: (
      <svg className="w-8 h-8 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </svg>
    ),
  },
  {
    name: "Redis",
    svg: (
      <svg className="w-8 h-8 text-[#DC2626]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9L2 16l10 5 10-5-10-5z" />
      </svg>
    ),
  },
  {
    name: "Google Gemini",
    svg: (
      <svg className="w-8 h-8 text-[#60A5FA]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0 10 10 10 10 0 0 0-10 10A10 10 0 0 0 2 12 10 10 0 0 0 12 2z" />
      </svg>
    ),
  },
];

export default function TechMarquee() {
  return (
    <section id="tech-stack" className="w-full py-20 bg-[#08090C] text-white overflow-hidden relative border-y border-white/10">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-12 relative z-10">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-2">
          Enterprise Stack (20+ Technologies · 3D Glossy Jewels)
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          Engineered on Modern Open Infrastructure
        </h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
          Tactile 3D physical icons representing production-grade AI, database, edge, and workflow runtimes.
        </p>
      </div>

      {/* Row 1: Flowing Left (GLOSSY ICONS ONLY) */}
      <div className="relative w-full overflow-hidden mb-6">
        <div className="animate-marquee-left flex gap-6">
          {[...ICONS_ROW_1, ...ICONS_ROW_1, ...ICONS_ROW_1].map((tech, idx) => (
            <div
              key={idx}
              title={tech.name}
              className="group relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.8)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6),inset_0_2px_6px_rgba(255,255,255,0.95)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 shrink-0 cursor-pointer overflow-hidden"
            >
              {/* Acrylic Top Highlight Lens */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-2xl" />
              
              <div className="relative z-10 transform group-hover:scale-110 transition-transform">
                {tech.svg}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Flowing Right (GLOSSY ICONS ONLY) */}
      <div className="relative w-full overflow-hidden">
        <div className="animate-marquee-right flex gap-6">
          {[...ICONS_ROW_2, ...ICONS_ROW_2, ...ICONS_ROW_2].map((tech, idx) => (
            <div
              key={idx}
              title={tech.name}
              className="group relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.8)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6),inset_0_2px_6px_rgba(255,255,255,0.95)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 shrink-0 cursor-pointer overflow-hidden"
            >
              {/* Acrylic Top Highlight Lens */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-2xl" />

              <div className="relative z-10 transform group-hover:scale-110 transition-transform">
                {tech.svg}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
