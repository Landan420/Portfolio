import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ArrowUpRight,
  Moon,
  Sun,
  Sparkles,
  Code2,
  Layers,
  Zap,
  ExternalLink,
  Wifi,
  Plug,
  Palette,
  Terminal,
  GitBranch,
  Globe,
} from 'lucide-react'
import './App.css'

/* ─── data ─────────────────────────────────────────────────────────────────── */

const PROJECTS = [
  {
    id: 'gogurt',
    name: 'gogurt.pages.dev',
    label: 'Personal Presence Site',
    desc: 'Custom Discord presence card with live activity tracking, PC specs, Spotify integration, and animated accent theming. Built for the Gogurt community.',
    tags: ['React', 'Discord API', 'Cloudflare Workers', 'D1'],
    href: 'https://gogurt.pages.dev',
    accent: '#a78bfa',
  },
  {
    id: 'brice',
    name: 'vanillabrice.pages.dev',
    label: 'Personal Presence Site',
    desc: 'A slick Discord-powered personal page with real-time presence, PC build showcase, and custom bio system. Deployed on Cloudflare Pages with D1 view tracking.',
    tags: ['React', 'Discord API', 'Cloudflare D1', 'Vite'],
    href: 'https://vanillabrice.pages.dev',
    accent: '#60a5fa',
  },
  {
    id: 'float',
    name: 'floatyt.pages.dev',
    label: 'YouTube Creator Site',
    desc: 'Full creator landing page with live YouTube stats, video gallery, channel CTA, and a polished navigation experience tailored for a content creator brand.',
    tags: ['React', 'YouTube API', 'Cloudflare Pages', 'Vite'],
    href: 'https://floatyt.pages.dev',
    accent: '#f87171',
  },
  {
    id: 'michael',
    name: 'ihymich.pages.dev',
    label: 'Personal Site',
    desc: 'Clean personal site with Discord presence integration, custom content management via Cloudflare D1, and a refined aesthetic built to showcase personality.',
    tags: ['React', 'Discord API', 'Cloudflare D1', 'Vite'],
    href: 'https://ihymich.pages.dev',
    accent: '#34d399',
  },
  {
    id: 'quibbish',
    name: 'quibbish.pages.dev',
    label: 'Personal Site',
    desc: 'Soft, pink-themed personal site with a custom content system backed by Cloudflare D1, elegant serif typography, and a cozy aesthetic built around its owner’s personality.',
    tags: ['React', 'Cloudflare D1', 'Vite', 'Cloudflare Pages'],
    href: 'https://quibbish.pages.dev',
    accent: '#f5a8c8',
  },
  {
    id: 'triplet',
    name: 'tripletfloat.pages.dev',
    label: 'Lore / Fan Site',
    desc: 'Bold, editorial-style lore site for Triple T j4ke — The Lore of Tung Tung Sahur — with punchy display typography and a fun, meme-driven narrative layout.',
    tags: ['React', 'Vite', 'Cloudflare Pages'],
    href: 'https://tripletfloat.pages.dev',
    accent: '#fbbf24',
  },
]

const SKILLS = [
  { icon: Code2,     label: 'React & Vite',        sub: 'Component-driven UIs, fast builds' },
  { icon: Layers,    label: 'Cloudflare Stack',     sub: 'Pages, Workers, D1, KV, R2' },
  { icon: Wifi,      label: 'WebSockets',           sub: 'Real-time connections & live data' },
  { icon: Plug,      label: 'REST APIs',            sub: 'Discord, YouTube, Spotify & more' },
  { icon: Zap,       label: 'Animations & Motion',  sub: 'CSS keyframes, transitions, effects' },
  { icon: Globe,     label: 'Lanyard & Presence',   sub: 'Live Discord status integrations' },
  { icon: Palette,   label: 'UI & Design',          sub: 'Figma, clean layouts, dark/light themes' },
  { icon: GitBranch, label: 'Git & Deployment',     sub: 'GitHub, CI/CD, Wrangler deploys' },
  { icon: Terminal,  label: 'Scripting & Tooling',  sub: 'Node.js, Bash, Lua, CLI tools' },
  { icon: Sparkles,  label: 'Real-time UX',         sub: 'Live clocks, presence cards, feeds' },
]

const DISCORD_ID = '419739869229875211'
const TIMEZONE   = 'America/Chicago'

const STATUS_META = {
  online:  { label: 'Online',         color: '#23a55a' },
  idle:    { label: 'Idle',           color: '#f0b232' },
  dnd:     { label: 'Do Not Disturb', color: '#f23f43' },
  offline: { label: 'Offline',        color: '#80848e' },
}

const TECH = [
  { name: 'JavaScript', icon: 'https://skillicons.dev/icons?i=js' },
  { name: 'React',      icon: 'https://skillicons.dev/icons?i=react' },
  { name: 'HTML5',      icon: 'https://skillicons.dev/icons?i=html' },
  { name: 'CSS3',       icon: 'https://skillicons.dev/icons?i=css' },
  { name: 'Vite',       icon: 'https://skillicons.dev/icons?i=vite' },
  { name: 'Node.js',    icon: 'https://skillicons.dev/icons?i=nodejs' },
  { name: 'Cloudflare', icon: 'https://skillicons.dev/icons?i=cloudflare' },
  { name: 'Git',        icon: 'https://skillicons.dev/icons?i=git' },
  { name: 'GitHub',     icon: 'https://skillicons.dev/icons?i=github' },
  { name: 'Figma',      icon: 'https://skillicons.dev/icons?i=figma' },
  { name: 'Lua',        icon: 'https://skillicons.dev/icons?i=lua' },
  { name: 'Bash',       icon: 'https://skillicons.dev/icons?i=bash' },
]

/* ─── hooks ─────────────────────────────────────────────────────────────────── */

function useLanyard() {
  const [data, setData] = useState(null)
  const ws = useRef(null)
  const hb = useRef(null)

  useEffect(() => {
    function connect() {
      const socket = new WebSocket('wss://api.lanyard.rest/socket')
      ws.current = socket

      socket.addEventListener('message', e => {
        const msg = JSON.parse(e.data)
        if (msg.op === 1) {
          // hello — start heartbeat & subscribe
          hb.current = setInterval(() => {
            if (socket.readyState === 1) socket.send(JSON.stringify({ op: 3 }))
          }, msg.d.heartbeat_interval)
          socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }))
        }
        if ((msg.op === 0 && msg.t === 'INIT_STATE') || msg.t === 'PRESENCE_UPDATE') {
          setData(msg.d[DISCORD_ID] ?? msg.d)
        }
      })

      socket.addEventListener('close', () => {
        clearInterval(hb.current)
        setTimeout(connect, 3000)
      })
    }

    connect()
    return () => {
      clearInterval(hb.current)
      ws.current?.close()
    }
  }, [])

  return data
}

function useClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-US', {
        timeZone: TIMEZONE,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return [theme, () => setTheme(t => t === 'dark' ? 'light' : 'dark')]
}

function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ─── components ────────────────────────────────────────────────────────────── */

function NavAvatar({ presence }) {
  const [hovered, setHovered] = useState(false)

  const status  = presence?.discord_status ?? 'offline'
  const meta    = STATUS_META[status] ?? STATUS_META.offline
  const user    = presence?.discord_user
  const avatar  = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}.webp?size=64`
    : null
  const customStatus = presence?.activities?.find(a => a.type === 4)
  const customText   = customStatus?.state ?? customStatus?.details ?? null

  return (
    <div
      className="nav-avatar-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a href="#hero" className="nav-logo" aria-label="Home">
        <div className="nav-avatar-ring" style={{ '--status-color': meta.color }}>
          {avatar
            ? <img src={avatar} alt="Landan" className="nav-avatar-img" />
            : <span className="nav-avatar-fallback">L</span>
          }
          <span className="nav-status-dot" />
        </div>
        <span className="nav-logo-name">landan</span>
      </a>

      <div className={`nav-hover-card${hovered ? ' visible' : ''}`}>
        <div className="nhc-top">
          <div className="nhc-avatar-ring" style={{ '--status-color': meta.color }}>
            {avatar
              ? <img src={avatar} alt="Landan" className="nhc-avatar-img" />
              : <span className="nhc-avatar-fallback">L</span>
            }
            <span className="nhc-status-dot" />
          </div>
          <div className="nhc-info">
            <span className="nhc-name">Landan</span>
            <span className="nhc-handle">@landan</span>
          </div>
        </div>
        <div className="nhc-status-row">
          <span className="nhc-status-pip" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
          <span className="nhc-status-label" style={{ color: meta.color }}>{meta.label}</span>
        </div>
        {customText && (
          <p className="nhc-custom">{customText}</p>
        )}
      </div>
    </div>
  )
}

function Nav({ theme, toggleTheme, presence }) {
  const clock = useClock()

  return (
    <nav className="nav">
      <NavAvatar presence={presence} />

      <div className="nav-links">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>

      <div className="nav-right">
        <div className="nav-clock">
          <span className="nav-clock-time">{clock}</span>
          <span className="nav-clock-tz">CT</span>
        </div>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className={`theme-icon ${theme === 'dark' ? 'active' : ''}`}>
            <Moon size={16} strokeWidth={2} />
          </span>
          <span className={`theme-icon ${theme === 'light' ? 'active' : ''}`}>
            <Sun size={16} strokeWidth={2} />
          </span>
          <span className="theme-toggle-pill" />
        </button>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-orb orb-1" />
      <div className="hero-orb orb-2" />
      <div className="hero-orb orb-3" />

      <div className="hero-inner">
        <div className="hero-badge">
          <span className="badge-dot" />
          Available for projects
        </div>

        <h1 className="hero-title">
          <span className="hero-title-line">Premium</span>
          <span className="hero-title-line accent-line">Websites</span>
          <span className="hero-title-line">by Landan.</span>
        </h1>

        <p className="hero-sub">
          I build fast, polished websites that make people stop scrolling.
          <br />Discord presence cards, creator pages, personal brands — done right.
        </p>

        <div className="hero-ctas">
          <a href="#work" className="btn btn-primary">
            View My Work
            <ArrowUpRight size={16} />
          </a>
          <a
            href="https://discord.com/users/419739869229875211"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
          >
            <DiscordIcon size={16} />
            @Landan
          </a>
        </div>

        <div className="hero-scroll-hint">
          <span />
        </div>
      </div>
    </section>
  )
}

function TechMarquee() {
  const items = [...TECH, ...TECH, ...TECH]
  return (
    <div className="marquee-section">
      <div className="marquee-fade marquee-fade-left" />
      <div className="marquee-fade marquee-fade-right" />
      <div className="marquee-track">
        <div className="marquee-inner">
          {items.map((t, i) => (
            <div key={`${t.name}-${i}`} className="marquee-item">
              <img src={t.icon} alt={t.name} className="marquee-icon" />
              <span className="marquee-label">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project, index }) {
  const ref = useFadeIn()
  return (
    <article
      ref={ref}
      className="project-card fade-item"
      style={{ '--delay': `${index * 80}ms`, '--accent': project.accent }}
    >
      <div className="card-glow" />
      <div className="card-inner">
        <div className="card-header">
          <div>
            <span className="card-label">{project.label}</span>
            <h3 className="card-name">{project.name}</h3>
          </div>
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="card-link"
            aria-label={`Visit ${project.name}`}
          >
            <ExternalLink size={15} />
          </a>
        </div>

        <p className="card-desc">{project.desc}</p>

        <div className="card-footer">
          <div className="card-tags">
            {project.tags.map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="card-visit"
          >
            Visit site <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </article>
  )
}

function Work() {
  const ref = useFadeIn()
  return (
    <section id="work" className="section">
      <div className="section-header fade-item" ref={ref}>
        <span className="section-label">Work</span>
        <h2 className="section-title">Sites I've Built</h2>
        <p className="section-sub">
          Each project is handcrafted — no templates, no shortcuts.
        </p>
      </div>

      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  )
}

function About() {
  const ref = useFadeIn()
  return (
    <section id="about" className="section">
      <div className="about-wrap">
        <div className="fade-item" ref={ref}>
          <span className="section-label">About</span>
          <h2 className="section-title">Who's behind the screen</h2>
          <p className="about-text">
            Hey — I'm <strong>Landan</strong>, a self-taught developer from the US.
            I got into coding because there's something about building something from
            nothing and watching it actually come to life that I genuinely enjoy.
            That feeling never really goes away.
          </p>
          <p className="about-text">
            I specialize in React + Cloudflare — fast deploys, real-time integrations,
            and designs that feel premium. Personal brand pages, creator sites,
            Discord presence cards — whatever it is, I'll make it look like it cost more than it did.
          </p>
          <div className="socials-row">
            <a href="https://github.com/Landan420" target="_blank" rel="noreferrer" className="social-pill">
              <GithubIcon size={15} />
              GitHub
            </a>
            <a href="https://discord.gg/gogurt" target="_blank" rel="noreferrer" className="social-pill">
              <DiscordIcon size={15} />
              Discord
            </a>
          </div>
        </div>

        <div className="skills-grid">
          {SKILLS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="skill-card">
              <div className="skill-icon">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <div>
                <div className="skill-label">{label}</div>
                <div className="skill-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DiscordContactBtn() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function copyUsername() {
    navigator.clipboard.writeText('landan').then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false); setOpen(false) }, 1800)
    })
  }

  return (
    <div className="discord-btn-wrap" ref={ref}>
      <button className="btn btn-primary" onClick={() => setOpen(o => !o)}>
        <DiscordIcon size={16} />
        Message me on Discord
      </button>
      {open && (
        <div className="discord-popover">
          <button className="discord-option" onClick={copyUsername}>
            <span className="discord-option-icon">
              {copied ? <span className="copied-check">✓</span> : <CopyIcon />}
            </span>
            <div>
              <span className="discord-option-label">{copied ? 'Copied!' : 'Copy username'}</span>
              <span className="discord-option-sub">landan</span>
            </div>
          </button>
          <a
            href="https://discord.com/users/419739869229875211"
            target="_blank"
            rel="noreferrer"
            className="discord-option"
            onClick={() => setOpen(false)}
          >
            <span className="discord-option-icon"><ExternalLink size={15} /></span>
            <div>
              <span className="discord-option-label">Open profile</span>
              <span className="discord-option-sub">Mutual server required</span>
            </div>
          </a>
          <a
            href="https://discord.gg/gogurt"
            target="_blank"
            rel="noreferrer"
            className="discord-option"
            onClick={() => setOpen(false)}
          >
            <span className="discord-option-icon"><DiscordIcon size={15} /></span>
            <div>
              <span className="discord-option-label">Join my Discord</span>
              <span className="discord-option-sub">discord.gg/gogurt</span>
            </div>
          </a>
        </div>
      )}
    </div>
  )
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function Contact() {
  const ref = useFadeIn()
  return (
    <section id="contact" className="section section-contact">
      <div className="contact-glow" />
      <div className="contact-inner fade-item" ref={ref}>
        <span className="section-label">Contact</span>
        <h2 className="section-title">Let's build something.</h2>
        <p className="section-sub">
          Got a project in mind? Hit me up on Discord — that's where I move fastest.
        </p>
        <div className="contact-ctas">
          <DiscordContactBtn />
          <a
            href="https://github.com/Landan420"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
          >
            <GithubIcon size={16} />
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <span className="footer-copy">{new Date().getFullYear()} — Landan & Cloudflare</span>
      <div className="footer-links">
        <a href="https://github.com/Landan420" target="_blank" rel="noreferrer" aria-label="GitHub">
          <GithubIcon size={15} />
        </a>
        <a href="https://discord.gg/gogurt" target="_blank" rel="noreferrer" aria-label="Discord">
          <DiscordIcon size={15} />
        </a>
      </div>
    </footer>
  )
}

/* ─── custom icons ───────────────────────────────────────────────────────────── */

function GithubIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function DiscordIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 127.14 96.36" fill="currentColor">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  )
}

function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ─── root ───────────────────────────────────────────────────────────────────── */

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const presence = useLanyard()

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} presence={presence} />
      <div className="dev-tag" aria-hidden="true">made by @landan</div>
      <Hero />
      <TechMarquee />
      <Work />
      <About />
      <Contact />
      <Footer />
    </>
  )
}
