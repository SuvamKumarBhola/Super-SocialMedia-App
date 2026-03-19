import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Send, Inbox, BarChart2, Sparkles, Users,
  Instagram, Youtube, Linkedin, Twitter, Facebook,
  CheckCircle, ArrowRight, Menu, X, Zap, Clock, TrendingUp,
  MessageSquare, AlertCircle, Star, Github, Mail, ChevronRight,
  Globe, ChevronDown, Layers, Shield, BookOpen, Play, ChevronLeft
} from "lucide-react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #faf7f2;
    font-family: 'Poppins', system-ui, sans-serif;
    color: #2a1f0f;
  }

  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #ede6d9 25%, #f3ede3 50%, #ede6d9 75%);
    background-size: 700px 100%;
    animation: shimmer 1.7s infinite linear;
    border-radius: 8px;
  }

  .reveal {
    opacity: 0;
    transform: translateY(26px);
    transition: opacity 0.58s cubic-bezier(.22,1,.36,1), transform 0.58s cubic-bezier(.22,1,.36,1);
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  @keyframes heroFadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .h1 { animation: heroFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.05s both; }
  .h2 { animation: heroFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.15s both; }
  .h3 { animation: heroFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.28s both; }
  .h4 { animation: heroFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.42s both; }

  @keyframes floatMock {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
  }
  .mock-float { animation: floatMock 6s ease-in-out infinite; }

  @keyframes dropIn {
    from { opacity:0; transform:translateY(-8px) scaleY(0.94); }
    to   { opacity:1; transform:translateY(0) scaleY(1); }
  }
  .drop-in { animation: dropIn 0.18s cubic-bezier(.22,1,.36,1) both; transform-origin: top; }

  @keyframes drawerIn {
    from { opacity:0; transform:translateX(100%); }
    to   { opacity:1; transform:translateX(0); }
  }
  .drawer-in { animation: drawerIn 0.28s cubic-bezier(.22,1,.36,1) both; }

  @keyframes pulseDot {
    0%,100% { opacity:1; }
    50%      { opacity:0.35; }
  }
  .pdot { animation: pulseDot 1.8s ease-in-out infinite; }

  @keyframes orbDrift {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(28px,-18px) scale(1.04); }
    66%      { transform:translate(-18px,14px) scale(0.97); }
  }
  .orb { animation: orbDrift 14s ease-in-out infinite; }

  @keyframes countUp {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .cu { animation: countUp 0.5s cubic-bezier(.22,1,.36,1) both; }

  .nav-link { position:relative; text-decoration:none; }
  .nav-link::after {
    content:''; position:absolute; bottom:-2px; left:50%; right:50%;
    height:2px; border-radius:1px;
    background: linear-gradient(90deg,#6d3cb4,#5a58d6);
    transition: left 0.2s ease, right 0.2s ease;
  }
  .nav-link:hover::after { left:0; right:0; }

  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:#f3ede3; }
  ::-webkit-scrollbar-thumb { background:#c4b49a; border-radius:3px; }
`;

const C = {
  bg: "#faf7f2",
  surface: "#f3ede3",
  surfaceHigh: "#ede6d9",
  border: "rgba(120,90,50,0.12)",
  borderHover: "rgba(109,60,180,0.35)",
  text: "#2a1f0f",
  muted: "#7a6a55",
  subtle: "#c4b49a",
  purple: "#6d3cb4",
  purpleLight: "#8b5cf6",
  indigo: "#5a58d6",
  glow: "rgba(109,60,180,0.1)",
  green: "#4a8c3a",
};

function useScrolled(t = 20) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const fn = () => setS(window.scrollY > t);
    window.addEventListener("scroll", fn, { passive: true }); fn();
    return () => window.removeEventListener("scroll", fn);
  }, [t]);
  return s;
}

function useInView(opts = {}) {
  const ref = useRef(null);
  const [iv, setIv] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIv(true); obs.disconnect(); } }, { threshold: 0.1, ...opts });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, iv];
}

const Sk = ({ w = "100%", h = 14, r = 7, style = {} }) => (
  <div className="skeleton" style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />
);

const CardSk = () => (
  <div style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
    <Sk w={42} h={42} r={11} /><Sk w="55%" h={17} /><Sk w="100%" h={12} /><Sk w="85%" h={12} /><Sk w="65%" h={12} />
  </div>
);

const TestSk = () => (
  <div style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", gap: 4 }}>{[...Array(5)].map((_, i) => <Sk key={i} w={13} h={13} r={3} />)}</div>
    <Sk w="100%" h={12} /><Sk w="92%" h={12} /><Sk w="75%" h={12} />
    <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
      <Sk w={40} h={40} r={999} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}><Sk w="48%" h={13} /><Sk w="68%" h={11} /></div>
    </div>
  </div>
);

function LazySection({ children, skeleton, minH = 200, delay = 0 }) {
  const [ref, iv] = useInView();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (iv && !loaded) { const t = setTimeout(() => setLoaded(true), delay); return () => clearTimeout(t); }
  }, [iv, delay]);
  return <div ref={ref} style={{ minHeight: loaded ? "auto" : minH }}>{loaded ? children : skeleton}</div>;
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, iv] = useInView();
  return (
    <div ref={ref} className={`reveal${iv ? " visible" : ""}`} style={{ transitionDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}

const Badge = ({ children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(109,60,180,0.1)", border: "1px solid rgba(109,60,180,0.25)", color: C.purple, fontSize: 11, fontWeight: 700, padding: "4px 13px", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase" }}>
    {children}
  </span>
);

const GT = ({ children, style = {} }) => (
  <span style={{ background: "linear-gradient(135deg,#8b5cf6 0%,#6366f1 50%,#6d3cb4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", ...style }}>
    {children}
  </span>
);

const Btn = ({ children, variant = "primary", onClick, style = {}, href }) => {
  const V = {
    primary: { background: "linear-gradient(135deg,#6d3cb4,#5a58d6)", color: "#fff", boxShadow: "0 2px 18px rgba(109,60,180,0.25)", border: "none" },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    outline: { background: "transparent", color: C.purple, border: "1px solid rgba(109,60,180,0.35)" },
  };
  const base = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 22px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s ease", fontFamily: "inherit", textDecoration: "none", ...style };
  const El = href ? "a" : "button";
  return (
    <El href={href} onClick={onClick} style={{ ...base, ...V[variant] }}
      onMouseEnter={e => {
        if (variant === "primary") { e.currentTarget.style.boxShadow = "0 4px 28px rgba(109,60,180,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }
        if (variant === "ghost") { e.currentTarget.style.borderColor = "rgba(120,90,50,0.25)"; e.currentTarget.style.background = "rgba(120,90,50,0.06)"; }
        if (variant === "outline") { e.currentTarget.style.background = "rgba(109,60,180,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }
      }}
      onMouseLeave={e => {
        if (variant === "primary") { e.currentTarget.style.boxShadow = "0 2px 18px rgba(109,60,180,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }
        if (variant === "ghost") { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "transparent"; }
        if (variant === "outline") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }
      }}
    >{children}</El>
  );
};

const Card = ({ children, style = {}, hover = true }) => {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: C.surface, border: `1px solid ${h && hover ? C.borderHover : C.border}`, borderRadius: 16, padding: 28, transition: "border-color 0.22s,box-shadow 0.22s,transform 0.22s", boxShadow: h && hover ? `0 4px 24px ${C.glow}` : "none", transform: h && hover ? "translateY(-3px)" : "translateY(0)", ...style }}>
      {children}
    </div>
  );
};

const PROD_MENU = [
  { icon: Send, label: "Multi-Platform Posting", desc: "Schedule to all platforms in one go" },
  { icon: Inbox, label: "Unified Inbox", desc: "DMs, comments, mentions — one feed" },
  { icon: BarChart2, label: "Analytics Dashboard", desc: "Cross-platform metrics & exports" },
  { icon: Sparkles, label: "AI Caption Generator", desc: "Platform-native captions instantly" },
  { icon: Users, label: "Team Collaboration", desc: "Roles, approvals, shared inboxes" },
  { icon: TrendingUp, label: "Performance Prediction", desc: "AI scores before you publish" },
];
const RES_MENU = [
  { icon: BookOpen, label: "Documentation", desc: "Full API & feature docs" },
  { icon: Layers, label: "Changelog", desc: "What's new in Creator OS" },
  { icon: Shield, label: "Security", desc: "How we protect your data" },
  { icon: Github, label: "GitHub", desc: "Open source contributions" },
];

function DropMenu({ items, cols = 2 }) {
  return (
    <div className="drop-in" style={{ position: "absolute", top: "calc(100% + 14px)", left: "50%", transform: "translateX(-50%)", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 8, boxShadow: "0 24px 64px rgba(60,40,10,0.14),0 0 0 1px rgba(109,60,180,0.07)", display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 2, minWidth: cols > 1 ? 510 : 270, zIndex: 300 }}>
      {items.map(({ icon: Icon, label, desc }) => (
        <a key={label} href="#" style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: 10, textDecoration: "none", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(109,60,180,0.07)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(109,60,180,0.1)", border: "1px solid rgba(109,60,180,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            <Icon size={15} color={C.purpleLight} />
          </div>
          <div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{label}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{desc}</div>
          </div>
        </a>
      ))}
    </div>
  );
}

function NavItem({ label, href = "#", dropdown }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const show = () => { clearTimeout(timer.current); setOpen(true); };
  const hide = () => { timer.current = setTimeout(() => setOpen(false), 130); };
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div style={{ position: "relative" }} onMouseEnter={show} onMouseLeave={hide}>
      <a href={dropdown ? undefined : href} className="nav-link"
        style={{ display: "flex", alignItems: "center", gap: 4, color: open ? C.text : C.muted, fontSize: 14, fontWeight: 500, padding: "7px 12px", borderRadius: 8, transition: "color 0.15s", cursor: "pointer" }}>
        {label}
        {dropdown && <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />}
      </a>
      {dropdown && open && <DropMenu items={dropdown.items} cols={dropdown.cols} />}
    </div>
  );
}

function MobileDrawer({ open, onClose }) {
  if (!open) return null;
  const secs = [
    { h: "Product", ls: ["Multi-Platform Posting", "Unified Inbox", "Analytics", "AI Captions", "Team Collaboration"] },
    { h: "Resources", ls: ["Documentation", "Changelog", "GitHub", "Security"] },
    { h: "Company", ls: ["Features", "Pricing", "About"] },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(60,40,10,0.45)", backdropFilter: "blur(5px)" }} onClick={onClose} />
      <div className="drawer-in" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(320px,90vw)", background: C.surface, borderLeft: `1px solid ${C.border}`, padding: 24, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6d3cb4,#5a58d6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LayoutDashboard size={13} color="#fff" />
            </div>
            <span style={{ color: C.text, fontWeight: 800, fontSize: 15 }}>Creator OS</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><X size={20} /></button>
        </div>
        {secs.map(s => (
          <div key={s.h} style={{ marginBottom: 28 }}>
            <div style={{ color: C.muted, fontSize: 10, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 10 }}>{s.h}</div>
            {s.ls.map(l => (
              <a key={l} href="#" onClick={onClose}
                style={{ display: "block", color: C.text, fontSize: 14, fontWeight: 500, padding: "9px 0", textDecoration: "none", borderBottom: `1px solid ${C.border}`, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = C.purple}
                onMouseLeave={e => e.currentTarget.style.color = C.text}>{l}</a>
            ))}
          </div>
        ))}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10, paddingTop: 24 }}>
          <Btn href="/login" variant="ghost" style={{ width: "100%" }}>Login</Btn>
          <Btn href="/register" variant="primary" style={{ width: "100%" }}>Get Started <ChevronRight size={14} /></Btn>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const scrolled = useScrolled(30);
  const [mob, setMob] = useState(false);
  return (
    <>
      <style>{`
        @media(max-width:900px){.dsk{display:none!important;}.mhb{display:flex!important;}}
        @media(min-width:901px){.mhb{display:none!important;}}
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: scrolled ? "rgba(250,247,242,0.94)" : "rgba(250,247,242,0.75)", backdropFilter: "blur(20px)", borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent", boxShadow: scrolled ? "0 4px 30px rgba(60,40,10,0.08)" : "none", transition: "background 0.3s,border-color 0.3s,box-shadow 0.3s" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>

          {/* Logo */}
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 35, height: 35, borderRadius: 9, background: "linear-gradient(135deg,#6d3cb4,#5a58d6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(109,60,180,0.3)" }}>
              <LayoutDashboard size={16} color="#fff" />
            </div>
            <span style={{ color: C.text, fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>Creator OS</span>
            <span style={{ background: "rgba(109,60,180,0.1)", border: "1px solid rgba(109,60,180,0.25)", color: C.purple, fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5, letterSpacing: "0.06em" }}>BETA</span>
          </a>

          {/* Desktop nav links */}
          <div className="dsk" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <NavItem label="Features" href="#features" />
            <NavItem label="Product" dropdown={{ items: PROD_MENU, cols: 2 }} />
            <NavItem label="Resources" dropdown={{ items: RES_MENU, cols: 2 }} />
            <NavItem label="Pricing" href="#pricing" />
          </div>

          {/* Desktop CTA */}
          <div className="dsk" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href="/login" style={{ color: C.muted, fontSize: 14, fontWeight: 500, padding: "7px 14px", borderRadius: 8, textDecoration: "none", transition: "color 0.15s,background 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = "rgba(120,90,50,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "transparent"; }}>Login</a>
            <div style={{ width: 1, height: 20, background: C.border }} />
            <Btn href="/register" variant="primary" style={{ padding: "8px 18px", fontSize: 13 }}>Get Started <ChevronRight size={13} /></Btn>
          </div>

          {/* Mobile burger */}
          <button className="mhb" onClick={() => setMob(true)}
            style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 9px", cursor: "pointer", color: C.text, alignItems: "center", gap: 6, display: "flex" }}>
            <Menu size={17} />
          </button>
        </div>
      </nav>
      <MobileDrawer open={mob} onClose={() => setMob(false)} />
    </>
  );
}

function HeroMockup() {
  const plats = [{ I: Instagram, c: "#e1306c", l: "IG" }, { I: Twitter, c: "#1da1f2", l: "X" }, { I: Linkedin, c: "#0a66c2", l: "LI" }, { I: Youtube, c: "#ff0000", l: "YT" }, { I: Facebook, c: "#1877f2", l: "FB" }];
  const posts = [
    { t: "New product launch 🚀 Drop coming soon...", lk: "2.4k", tm: "2h ago", c: "#e1306c" },
    { t: "Excited to share our team's Q3 growth...", lk: "891", tm: "4h ago", c: "#0a66c2" },
    { t: "Hot take: consistency > perfection 🔥", lk: "1.1k", tm: "6h ago", c: "#1da1f2" },
  ];
  return (
    <div className="mock-float" style={{ background: C.surfaceHigh, border: `1px solid rgba(120,90,50,0.14)`, borderRadius: 20, overflow: "hidden", boxShadow: "0 40px 100px rgba(60,40,10,0.16),0 0 0 1px rgba(120,90,50,0.08)", width: "100%", maxWidth: 540 }}>
      {/* Chrome */}
      <div style={{ padding: "11px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 7, background: C.surface }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 16px", fontSize: 11, color: C.muted }}>dashboard.creatoros.io</div>
        </div>
      </div>
      <div style={{ display: "flex", height: 340 }}>
        {/* Sidebar */}
        <div style={{ width: 50, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 14, gap: 10 }}>
          {[LayoutDashboard, Send, Inbox, BarChart2, Users].map((Icon, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? "rgba(109,60,180,0.14)" : "transparent" }}>
              <Icon size={15} color={i === 0 ? C.purpleLight : C.subtle} />
            </div>
          ))}
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 12 }}>
            {[{ l: "Reach", v: "284K", d: "+12%" }, { l: "Engage", v: "5.8%", d: "+0.4%" }, { l: "Followers", v: "48.2K", d: "+890" }].map((s, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 9, padding: "9px 10px", border: `1px solid ${C.border}` }}>
                <div style={{ color: C.muted, fontSize: 9 }}>{s.l}</div>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 700, margin: "3px 0 2px" }}>{s.v}</div>
                <div style={{ color: C.green, fontSize: 9 }}>{s.d}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {plats.map(({ I, c, l }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "3px 8px" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: c, display: "flex", alignItems: "center", justifyContent: "center" }}><I size={7} color="#fff" /></div>
                <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ color: C.muted, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Recent Posts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {posts.map((p, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 9, padding: "9px 11px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: p.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Globe size={9} color="#fff" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.text, fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.t}</div>
                  <div style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>❤ {p.lk} · {p.tm}</div>
                </div>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} className="pdot" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const DEMO_SLIDES = [
  {
    step: "01",
    title: "Connect your accounts",
    desc: "Link all your social profiles in one click. Creator OS supports Instagram, X, LinkedIn, YouTube and Facebook via secure OAuth — no passwords stored.",
    icon: Globe,
    preview: [
      { label: "Instagram", bg: "#e1306c", connected: true },
      { label: "X (Twitter)", bg: "#1da1f2", connected: true },
      { label: "LinkedIn", bg: "#0a66c2", connected: true },
      { label: "YouTube", bg: "#ff0000", connected: false },
      { label: "Facebook", bg: "#1877f2", connected: false },
    ],
  },
  {
    step: "02",
    title: "Compose & schedule posts",
    desc: "Write once, customise per platform. Pick your date and time, preview how each post looks, then hit Schedule — Creator OS handles the rest.",
    icon: Send,
    preview: null,
    isComposer: true,
  },
  {
    step: "03",
    title: "Monitor your analytics",
    desc: "All your key metrics in one dashboard. Track reach, engagement rate and follower growth across every platform without jumping between apps.",
    icon: BarChart2,
    preview: null,
    isAnalytics: true,
  },
  {
    step: "04",
    title: "Manage your unified inbox",
    desc: "Every DM, comment and mention lands in one threaded feed. Reply fast, assign conversations to teammates, and never miss an engagement opportunity.",
    icon: Inbox,
    preview: null,
    isInbox: true,
  },
];

function DemoSlidePreview({ slide }) {
  const [text, setText] = useState("Just shipped our new feature 🚀 Check it out and let us know what you think!");
  const platforms = [
    { l: "IG", c: "#e1306c", sel: true },
    { l: "X", c: "#1da1f2", sel: true },
    { l: "LI", c: "#0a66c2", sel: false },
  ];

  if (slide.isComposer) {
    return (
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>New Post</div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, color: C.text, fontFamily: "inherit", resize: "none", outline: "none" }}
        />
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Post to:</div>
          <div style={{ display: "flex", gap: 8 }}>
            {platforms.map(p => (
              <div key={p.l} style={{ display: "flex", alignItems: "center", gap: 5, background: p.sel ? "rgba(109,60,180,0.1)" : C.surface, border: `1px solid ${p.sel ? "rgba(109,60,180,0.3)" : C.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: p.sel ? C.purple : C.muted }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.c }} />
                {p.l}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, color: C.muted }}>📅 Schedule for later</div>
          <Btn variant="primary" style={{ padding: "7px 16px", fontSize: 12 }}>Schedule Post</Btn>
        </div>
      </div>
    );
  }

  if (slide.isAnalytics) {
    const bars = [42, 67, 55, 80, 61, 90, 74];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[{ l: "Reach", v: "284K", d: "+12%" }, { l: "Engagement", v: "5.8%", d: "+0.4%" }, { l: "Followers", v: "48.2K", d: "+890" }].map(s => (
            <div key={s.l} style={{ background: C.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.border}` }}>
              <div style={{ color: C.muted, fontSize: 10 }}>{s.l}</div>
              <div style={{ color: C.text, fontSize: 15, fontWeight: 700, margin: "3px 0 2px" }}>{s.v}</div>
              <div style={{ color: C.green, fontSize: 10, fontWeight: 600 }}>{s.d}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Weekly reach</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: `${h}%`, background: `linear-gradient(to top, #6d3cb4, #8b5cf6)`, borderRadius: "4px 4px 0 0", opacity: 0.85 }} />
              <div style={{ fontSize: 9, color: C.muted }}>{days[i]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.isInbox) {
    const msgs = [
      { av: "AR", name: "Ayesha R.", msg: "Love the new dashboard update! 🔥", time: "2m", c: "#6d3cb4", unread: true },
      { av: "RM", name: "Rohan M.", msg: "When does the team plan feature launch?", time: "14m", c: "#0891b2", unread: true },
      { av: "PS", name: "Priya S.", msg: "The AI captions are super useful, thanks!", time: "1h", c: "#be185d", unread: false },
      { av: "KJ", name: "Karan J.", msg: "Can I get access to analytics export?", time: "3h", c: "#5a58d6", unread: false },
    ];
    return (
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Inbox</span>
          <span style={{ background: "rgba(109,60,180,0.1)", color: C.purple, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>2 unread</span>
        </div>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < msgs.length - 1 ? `1px solid ${C.border}` : "none", background: m.unread ? "rgba(109,60,180,0.03)" : "transparent" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${m.c},#5a58d6)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{m.av}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: m.unread ? 700 : 500, color: C.text }}>{m.name}</span>
                <span style={{ fontSize: 10, color: C.muted }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.msg}</div>
            </div>
            {m.unread && <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.purple, flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    );
  }

  // Default: platform connection slide
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Platform connections</div>
      {slide.preview.map(p => (
        <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: p.bg, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.text }}>{p.label}</span>
          {p.connected ? (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: C.green }}>
              <div className="pdot" style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} /> Connected
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 600, color: C.purple, background: "rgba(109,60,180,0.1)", padding: "3px 10px", borderRadius: 6, cursor: "pointer" }}>Connect</span>
          )}
        </div>
      ))}
    </div>
  );
}

function DemoModal({ onClose }) {
  const [slide, setSlide] = useState(0);
  const current = DEMO_SLIDES[slide];
  const Icon = current.icon;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(42,31,15,0.55)", backdropFilter: "blur(6px)" }}
      />
      {/* Modal */}
      <div style={{ position: "relative", width: "100%", maxWidth: 860, background: C.bg, borderRadius: 24, border: `1px solid ${C.border}`, boxShadow: "0 40px 100px rgba(60,40,10,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6d3cb4,#5a58d6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LayoutDashboard size={15} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>Creator OS — Product Demo</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} color={C.muted} />
          </button>
        </div>

        {/* Step progress */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}` }}>
          {DEMO_SLIDES.map((s, i) => (
            <button key={i} onClick={() => setSlide(i)}
              style={{ flex: 1, padding: "12px 8px", background: i === slide ? C.surface : "transparent", border: "none", borderBottom: i === slide ? `2px solid ${C.purple}` : "2px solid transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: i <= slide ? "linear-gradient(135deg,#6d3cb4,#5a58d6)" : C.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: i <= slide ? "#fff" : C.muted, transition: "all 0.2s" }}>
                {i < slide ? <CheckCircle size={12} color="#fff" /> : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: i === slide ? C.purple : C.muted, display: "none" }}>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, minHeight: 380 }}>
          {/* Left: description */}
          <div style={{ padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: `1px solid ${C.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: "rgba(109,60,180,0.1)", border: "1px solid rgba(109,60,180,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Icon size={22} color={C.purpleLight} />
            </div>
            <div style={{ color: C.purple, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 10 }}>STEP {current.step}</div>
            <h3 style={{ color: C.text, fontWeight: 700, fontSize: 22, marginBottom: 14, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{current.title}</h3>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 32 }}>{current.desc}</p>
            <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
              <button
                onClick={() => setSlide(s => Math.max(0, s - 1))}
                disabled={slide === 0}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", cursor: slide === 0 ? "not-allowed" : "pointer", color: slide === 0 ? C.subtle : C.text, fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s", opacity: slide === 0 ? 0.5 : 1 }}>
                <ChevronLeft size={14} /> Prev
              </button>
              {slide < DEMO_SLIDES.length - 1 ? (
                <button
                  onClick={() => setSlide(s => s + 1)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#6d3cb4,#5a58d6)", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 2px 14px rgba(109,60,180,0.3)", transition: "all 0.15s" }}>
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <Btn href="/register" variant="primary" style={{ padding: "9px 20px", fontSize: 13 }}>
                  Get Started <ArrowRight size={14} />
                </Btn>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <div style={{ padding: 28, background: C.surface, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Live preview</div>
            <DemoSlidePreview slide={current} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 28px", borderTop: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {DEMO_SLIDES.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 20 : 7, height: 7, borderRadius: 4, background: i === slide ? C.purple : C.subtle, cursor: "pointer", transition: "all 0.25s" }} />
            ))}
          </div>
          <span style={{ fontSize: 12, color: C.muted }}>{slide + 1} of {DEMO_SLIDES.length}</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <section style={{ padding: "140px 24px 100px", maxWidth: 1180, margin: "0 auto", position: "relative" }}>
      <div style={{ position: "absolute", top: 80, left: "8%", width: 500, height: 500, background: "radial-gradient(ellipse,rgba(109,60,180,0.07) 0%,transparent 70%)", pointerEvents: "none" }} className="orb" />
      <div style={{ position: "absolute", top: 200, right: "4%", width: 380, height: 380, background: "radial-gradient(ellipse,rgba(90,88,214,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 72 }}>
        <div className="h1"><Badge><Zap size={10} /> Now in public beta</Badge></div>
        <h1 className="h2" style={{ color: C.text, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", fontSize: "clamp(38px,5.5vw,68px)", marginTop: 28, marginBottom: 22, maxWidth: 820 }}>
          Manage All Your Social Media<br /><GT>From One Dashboard</GT>
        </h1>
        <p className="h3" style={{ color: C.muted, fontSize: 18, maxWidth: 520, lineHeight: 1.72, marginBottom: 40 }}>
          Creator OS helps creators, brands, and marketers manage Instagram, Facebook, X, LinkedIn and YouTube — without the tab chaos.
        </p>
        <div className="h4" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
          <Btn href="/register" variant="primary" style={{ padding: "13px 30px", fontSize: 15 }}>Start Free <ArrowRight size={16} /></Btn>
          <Btn variant="ghost" onClick={() => setShowDemo(true)} style={{ padding: "13px 28px", fontSize: 15 }}>
            <Play size={15} /> View Demo
          </Btn>
        </div>
        <div className="h4" style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {["No credit card required", "Free plan forever", "Setup in 2 min"].map(t => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, fontSize: 13 }}>
              <CheckCircle size={13} color={C.purple} /> {t}
            </span>
          ))}
        </div>
      </div>

      <div className="h4" style={{ display: "flex", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: -60, background: "radial-gradient(ellipse at center,rgba(109,60,180,0.06) 0%,transparent 65%)", pointerEvents: "none" }} />
        <HeroMockup />
      </div>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </section>
  );
}

function StatsBar() {
  const [ref, iv] = useInView();
  const stats = [{ v: "50K+", l: "Active creators" }, { v: "5M+", l: "Posts scheduled" }, { v: "5", l: "Platforms connected" }, { v: "99.9%", l: "Uptime SLA" }];
  return (
    <div ref={ref} style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 0 }}>
        {stats.map(({ v, l }, i) => (
          <div key={l} className={iv ? "cu" : ""} style={{ textAlign: "center", padding: "0 24px", borderRight: i < stats.length - 1 ? `1px solid ${C.border}` : "none", animationDelay: `${i * 0.08}s` }}>
            <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: "-0.04em", marginBottom: 4 }}><GT>{v}</GT></div>
            <div style={{ color: C.muted, fontSize: 13 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Problem() {
  const probs = [
    { icon: Globe, title: "Switching between apps", desc: "Jumping between Instagram, X, LinkedIn, and YouTube breaks your focus and wastes hours every week." },
    { icon: MessageSquare, title: "Missing DMs and comments", desc: "Notifications scattered across 5 apps means slower replies and missed opportunities with your audience." },
    { icon: Clock, title: "Posting inconsistently", desc: "Without a central calendar, maintaining a consistent posting cadence is frustrating and error-prone." },
    { icon: AlertCircle, title: "Hard to track performance", desc: "Each platform has its own analytics. Getting a unified picture of growth requires painful manual work." },
  ];
  const sk = <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>{[...Array(4)].map((_, i) => <CardSk key={i} />)}</div>;
  return (
    <section id="features" style={{ padding: "80px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
        <Badge><AlertCircle size={10} /> The problem</Badge>
        <h2 style={{ color: C.text, fontWeight: 700, fontSize: "clamp(28px,3.5vw,44px)", marginTop: 20, letterSpacing: "-0.02em" }}>
          Managing Multiple Social Platforms<br /><span style={{ color: C.muted }}>Is Messy</span>
        </h2>
      </Reveal>
      <LazySection skeleton={sk} minH={280}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
          {probs.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.09}>
              <Card>
                <div style={{ width: 42, height: 42, borderRadius: 11, marginBottom: 18, background: "rgba(200,80,60,0.08)", border: "1px solid rgba(200,80,60,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="#c85040" />
                </div>
                <h3 style={{ color: C.text, fontWeight: 600, fontSize: 16, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.68 }}>{desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </LazySection>
    </section>
  );
}

function Solution() {
  const sols = [{ icon: Send, l: "Unified Posting" }, { icon: Inbox, l: "Unified Inbox" }, { icon: BarChart2, l: "Analytics" }, { icon: Sparkles, l: "AI Captions" }];
  const plats = [{ I: Instagram, n: "Instagram", c: "#e1306c" }, { I: Twitter, n: "X (Twitter)", c: "#1da1f2" }, { I: Linkedin, n: "LinkedIn", c: "#0a66c2" }, { I: Youtube, n: "YouTube", c: "#ff0000" }, { I: Facebook, n: "Facebook", c: "#1877f2" }, { I: Sparkles, n: "AI Captions", c: C.purple }];
  return (
    <section style={{ padding: "80px 24px", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
        <Reveal>
          <Badge><Zap size={10} /> The solution</Badge>
          <h2 style={{ color: C.text, fontWeight: 700, fontSize: "clamp(26px,3vw,40px)", marginTop: 20, marginBottom: 20, letterSpacing: "-0.02em" }}>
            One Platform To Run Your<br /><GT>Entire Social Media</GT>
          </h2>
          <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.75, marginBottom: 32 }}>
            Creator OS brings your entire social media workflow under one roof. Post, reply, analyze, and plan — without context switching.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sols.map(({ icon: Icon, l }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(109,60,180,0.1)", border: "1px solid rgba(109,60,180,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color={C.purpleLight} />
                </div>
                <span style={{ color: C.text, fontSize: 15, fontWeight: 500 }}>{l}</span>
                <CheckCircle size={14} color={C.purple} />
              </div>
            ))}
          </div>
        </Reveal>
        <LazySection skeleton={<div style={{ height: 320 }} className="skeleton" />} minH={320} delay={200}>
          <Reveal delay={0.1}>
            <div style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
              <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Platform coverage</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {plats.map(({ I, n, c }) => (
                  <div key={n} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 13px", display: "flex", gap: 10, alignItems: "center", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(109,60,180,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><I size={13} color="#fff" /></div>
                    <div>
                      <div style={{ color: C.text, fontSize: 11, fontWeight: 600 }}>{n}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} className="pdot" />
                        <span style={{ color: C.green, fontSize: 9, fontWeight: 600 }}>Connected</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </LazySection>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: Send, title: "Multi-Platform Posting", desc: "Compose once, publish everywhere. Schedule for IG, FB, X, LinkedIn, and YouTube from one composer.", tag: "Scheduling" },
    { icon: Inbox, title: "Unified Inbox", desc: "All your DMs, comments, and mentions in one threaded view. Never miss a reply again.", tag: "Engagement" },
    { icon: BarChart2, title: "Analytics Dashboard", desc: "Cross-platform metrics — followers, reach, engagement. Export to CSV/PDF in one click.", tag: "Analytics" },
    { icon: Sparkles, title: "AI Caption Generator", desc: "Platform-native captions with AI. Short & punchy for X, professional for LinkedIn — instantly.", tag: "AI" },
    { icon: Users, title: "Team Collaboration", desc: "Assign posts to teammates, manage approval workflows, and collaborate on content with built-in roles.", tag: "Teams" },
    { icon: TrendingUp, title: "Performance Prediction", desc: "AI-powered expected engagement scores before you post. Optimize content before it goes live.", tag: "AI" },
  ];
  const sk = <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>{[...Array(6)].map((_, i) => <CardSk key={i} />)}</div>;
  return (
    <section id="features" style={{ padding: "80px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
        <Badge><LayoutDashboard size={10} /> Features</Badge>
        <h2 style={{ color: C.text, fontWeight: 700, fontSize: "clamp(28px,3.5vw,44px)", marginTop: 20, letterSpacing: "-0.02em" }}>
          Everything You Need,<br /><span style={{ color: C.muted }}>Nothing You Don't</span>
        </h2>
      </Reveal>
      <LazySection skeleton={sk} minH={400}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {feats.map(({ icon: Icon, title, desc, tag }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(109,60,180,0.1)", border: "1px solid rgba(109,60,180,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={19} color={C.purpleLight} />
                  </div>
                  <span style={{ background: "rgba(109,60,180,0.08)", color: C.purple, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, border: "1px solid rgba(109,60,180,0.18)" }}>{tag}</span>
                </div>
                <h3 style={{ color: C.text, fontWeight: 600, fontSize: 17, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.68 }}>{desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </LazySection>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", icon: Globe, title: "Connect your social accounts", desc: "Link Instagram, Facebook, X, LinkedIn, and YouTube with one-click OAuth. Secure and reversible." },
    { n: "02", icon: Send, title: "Create or schedule posts", desc: "Compose once, configure per-platform variants, pick a time or post immediately." },
    { n: "03", icon: BarChart2, title: "Track analytics & engagement", desc: "Monitor cross-platform performance in one unified dashboard. Compare, export, optimize." },
  ];
  return (
    <section id="how-it-works" style={{ padding: "80px 24px", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 64 }}>
          <Badge><Zap size={10} /> How it works</Badge>
          <h2 style={{ color: C.text, fontWeight: 700, fontSize: "clamp(28px,3.5vw,44px)", marginTop: 20, letterSpacing: "-0.02em" }}>Up and running in minutes</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 0, position: "relative" }}>
          {steps.map(({ n, icon: Icon, title, desc }, i) => (
            <Reveal key={n} delay={i * 0.12}>
              <div style={{ padding: "0 40px", position: "relative" }}>
                {i < steps.length - 1 && <div style={{ position: "absolute", right: 0, top: 26, width: 1, height: 52, background: "linear-gradient(to bottom,rgba(109,60,180,0.3),transparent)" }} />}
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,rgba(109,60,180,0.12),rgba(90,88,214,0.06))", border: "1px solid rgba(109,60,180,0.22)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={22} color={C.purpleLight} />
                </div>
                <div style={{ color: C.purple, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 10 }}>STEP {n}</div>
                <h3 style={{ color: C.text, fontWeight: 600, fontSize: 18, marginBottom: 12, letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.72 }}>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [annual, setAnnual] = useState(false);
  const plans = [
    { name: "Free", price: { m: "₹0", a: "₹0" }, desc: "For individuals just getting started.", features: ["Connect 2 social accounts", "Basic posting (post now)", "Limited analytics", "Community support"], cta: "Get Started", popular: false },
    { name: "Pro", price: { m: "₹749", a: "₹599" }, desc: "For active creators who post regularly.", features: ["Unlimited social accounts", "Scheduling & content calendar", "AI caption generator", "Full analytics dashboard", "Email support"], cta: "Start Pro", popular: true },
    { name: "Team", price: { m: "₹2,449", a: "₹1,949" }, desc: "For agencies and marketing teams.", features: ["Everything in Pro", "Team collaboration & roles", "Approval workflows", "Advanced analytics & exports", "Priority support", "Audit logs"], cta: "Start Team", popular: false },
  ];
  return (
    <section id="pricing" style={{ padding: "80px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
        <Badge><Star size={10} /> Pricing</Badge>
        <h2 style={{ color: C.text, fontWeight: 700, fontSize: "clamp(28px,3.5vw,44px)", marginTop: 20, letterSpacing: "-0.02em" }}>
          Simple pricing for creators and teams
        </h2>
        <p style={{ color: C.muted, fontSize: 16, marginTop: 14, marginBottom: 28 }}>No hidden fees. Cancel anytime.</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 10, padding: "6px 10px" }}>
          <span style={{ color: !annual ? C.text : C.muted, fontSize: 13, fontWeight: 600 }}>Monthly</span>
          <button onClick={() => setAnnual(!annual)} style={{ width: 40, height: 22, borderRadius: 11, cursor: "pointer", border: "none", background: annual ? "linear-gradient(135deg,#6d3cb4,#5a58d6)" : C.subtle, position: "relative", transition: "background 0.25s" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: annual ? 21 : 3, transition: "left 0.25s" }} />
          </button>
          <span style={{ color: annual ? C.text : C.muted, fontSize: 13, fontWeight: 600 }}>Annual</span>
          {annual && <span style={{ background: "rgba(74,158,74,0.12)", color: C.green, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>Save 20%</span>}
        </div>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, alignItems: "start" }}>
        {plans.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 0.1}>
            <div style={{ background: plan.popular ? "linear-gradient(160deg,rgba(109,60,180,0.07),rgba(90,88,214,0.03))" : C.surfaceHigh, border: `1px solid ${plan.popular ? "rgba(109,60,180,0.4)" : C.border}`, borderRadius: 20, padding: 32, position: "relative", boxShadow: plan.popular ? "0 0 40px rgba(109,60,180,0.08)" : "none", transition: "transform 0.22s,box-shadow 0.22s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = plan.popular ? "0 8px 50px rgba(109,60,180,0.16)" : "0 8px 32px rgba(60,40,10,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = plan.popular ? "0 0 40px rgba(109,60,180,0.08)" : "none"; }}>
              {plan.popular && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6d3cb4,#5a58d6)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 18px", borderRadius: 999, letterSpacing: "0.07em", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(109,60,180,0.35)" }}>MOST POPULAR</div>}
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>{plan.desc}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ color: C.text, fontWeight: 800, fontSize: 42, letterSpacing: "-0.05em" }}>{annual ? plan.price.a : plan.price.m}</span>
                  <span style={{ color: C.muted, fontSize: 13 }}>/month</span>
                </div>
                {annual && plan.price.m !== "₹0" && <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>was {plan.price.m}/mo</div>}
              </div>
              <Btn variant={plan.popular ? "primary" : "outline"} style={{ width: "100%", marginBottom: 28, padding: "11px 0" }}>{plan.cta}</Btn>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckCircle size={15} color={C.purple} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: C.muted, fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const ts = [
    { name: "Ayesha Raza", role: "Content Creator · 120K followers", text: "Creator OS replaced 4 apps for me. I manage everything from one place — DMs, scheduling, analytics. It's the tool I didn't know I needed.", av: "AR", g: "135deg,#6d3cb4,#5a58d6" },
    { name: "Rohan Mehta", role: "Freelance Social Media Manager", text: "The unified inbox is a game changer. I used to miss client DMs all the time. Now I have everything in one feed and can actually respond fast.", av: "RM", g: "135deg,#0891b2,#5a58d6" },
    { name: "Priya Singh", role: "Marketing Lead · SaaS Startup", text: "The AI captions are surprisingly good. It adapts tone per platform. LinkedIn-style vs X-style — it just gets it. Saves us hours every week.", av: "PS", g: "135deg,#be185d,#6d3cb4" },
  ];
  const sk = <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>{[...Array(3)].map((_, i) => <TestSk key={i} />)}</div>;
  return (
    <section style={{ padding: "80px 24px", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <Badge><Star size={10} /> Testimonials</Badge>
          <h2 style={{ color: C.text, fontWeight: 700, fontSize: "clamp(28px,3.5vw,44px)", marginTop: 20, letterSpacing: "-0.02em" }}>Creators love it</h2>
        </Reveal>
        <LazySection skeleton={sk} minH={280} delay={100}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {ts.map(({ name, role, text, av, g }, i) => (
              <Reveal key={name} delay={i * 0.1}>
                <Card style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", gap: 3 }}>{[...Array(5)].map((_, j) => <Star key={j} size={13} color="#c8920a" fill="#c8920a" />)}</div>
                  <p style={{ color: C.text, fontSize: 15, lineHeight: 1.72, flex: 1 }}>"{text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(${g})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{av}</div>
                    <div>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{name}</div>
                      <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{role}</div>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </LazySection>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ padding: "100px 24px" }}>
      <Reveal>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "linear-gradient(160deg,rgba(109,60,180,0.06),rgba(90,88,214,0.03))", border: "1px solid rgba(109,60,180,0.18)", borderRadius: 24, padding: "80px 48px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, background: "radial-gradient(ellipse,rgba(109,60,180,0.06) 0%,transparent 70%)", pointerEvents: "none" }} className="orb" />
            <div style={{ position: "relative", zIndex: 1 }}>
              <Badge><Sparkles size={10} /> Get started free</Badge>
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: "clamp(28px,4vw,50px)", marginTop: 28, marginBottom: 20, letterSpacing: "-0.02em" }}>
                Start Managing Your<br />Social Media Smarter
              </h2>
              <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.72, marginBottom: 40 }}>
                Join creators and teams who've simplified their entire social workflow with Creator OS.
              </p>
              <Btn href="/register" variant="primary" style={{ padding: "14px 40px", fontSize: 16 }}>Start Free <ArrowRight size={16} /></Btn>
              <div style={{ marginTop: 20, color: C.muted, fontSize: 13 }}>Free plan · No credit card required · Up in 2 minutes</div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Product", ls: ["Features", "Pricing", "Documentation", "Changelog"] },
    { h: "Company", ls: ["About", "Blog", "Contact", "Status"] },
    { h: "Legal", ls: ["Privacy", "Terms", "Security", "Cookies"] },
  ];
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "60px 24px 40px", background: C.surface }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 56 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6d3cb4,#5a58d6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(109,60,180,0.2)" }}>
                <LayoutDashboard size={15} color="#fff" />
              </div>
              <span style={{ color: C.text, fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>Creator OS</span>
            </div>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.72, maxWidth: 240, marginBottom: 24 }}>The social media operating system for creators, brands, and agencies.</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ I: Github, l: "GitHub" }, { I: Mail, l: "Email" }, { I: Twitter, l: "X" }].map(({ I, l }) => (
                <a key={l} href="#" style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, textDecoration: "none", transition: "border-color 0.15s,color 0.15s,background 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(109,60,180,0.35)"; e.currentTarget.style.color = C.purpleLight; e.currentTarget.style.background = "rgba(109,60,180,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "transparent"; }}>
                  <I size={14} />
                </a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.h}>
              <div style={{ color: C.text, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 18 }}>{col.h}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {col.ls.map(l => (
                  <a key={l} href="#" style={{ color: C.muted, fontSize: 14, textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>© 2025 Creator OS. All rights reserved.</span>
          <span style={{ color: C.muted, fontSize: 13 }}>Built by students for creators 🎓</span>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Poppins',system-ui,sans-serif", color: C.text }}>
      <style>{GLOBAL_CSS}</style>
      <Navbar />
      <main style={{ paddingTop: 66 }}>
        <Hero />
        <StatsBar />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}