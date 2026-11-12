import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom'
import local from './content.json'

const useContent = () => {
  const [c, setC] = useState(local)
  useEffect(() => { fetch('/api/content').then(r => r.ok ? r.json() : Promise.reject()).then(setC).catch(() => {}) }, [])
  return c
}
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2)

function Layout({ c, children }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    window.scrollTo(0, 0); setOpen(false)
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: .12 })
    document.querySelectorAll('.card,.person,.pr,.step,.row,.sec>h2,.sec>h1').forEach(el => { el.classList.add('rv'); io.observe(el) })
    return () => io.disconnect()
  }, [pathname])
  return <>
    <a className="skip" href="#main-content">Skip to content</a>
    <header className="hdr"><div className="wrap bar">
      <Link to="/" className="mark">A<i>L</i>M</Link>
      <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
      <nav className={open ? 'open' : ''}>{c.nav.map(n => <NavLink key={n.path} to={n.path} onClick={() => setOpen(false)}>{n.label}</NavLink>)}</nav>
    </div></header>
    <main id="main-content">{children}</main>
    <footer><div className="wrap foot">
      <div><div className="mark light">A<i>L</i>M</div><p className="tag">{c.tagline.join(' · ')}</p></div>
      <div><h4>Quick links</h4>{c.nav.map(n => <Link key={n.path} to={n.path}>{n.label}</Link>)}</div>
      <div><h4>Legal</h4><a href="#">Legal documents</a><a href="#">Regulatory information</a><a href="#">Fraud information</a></div>
    </div><div className="copy">© {new Date().getFullYear()} {c.name}. All rights reserved.</div></footer>
  </>
}

const People = ({ list }) => <div className="grid people">{list.map((p, i) =>
  <div className="person" key={i}><div className="av">{p.n === 'Full Name' ? 'ALM' : initials(p.n)}</div><h3>{p.n === 'Full Name' ? 'Profile coming soon' : p.n}</h3><p>{p.r}</p></div>)}</div>

function Who({ c }) {
  const w = c.who
  return <>
    <section className="hero"><img src="/logo.jpg" alt="ALM – Invest, Impact, Innovative, Inspired" /></section>
    <div className="wrap">
      <p className="crumb"><Link to="/">Home</Link> / Who we are</p>
      <h1>Who we are</h1><p className="lead">{w.lead}</p>
    </div>
    <div className="sub"><div className="wrap">{[['strategic-plan','Our strategic plan'],['principles','Our Partnership Principles'],['governance','Our governance'],['locations','Our locations']].map(([id, t]) => <a key={id} href={'#' + id}>{t}</a>)}</div></div>
    <section id="strategic-plan" className="wrap sec"><h2>{w.plan.title}</h2><p className="lead">{w.plan.intro}</p>
      <div className="grid four">{w.plan.pillars.map((p, i) => <div className="card pillar" key={i}><span>0{i + 1}</span><p>{p}</p></div>)}</div></section>
    <section id="principles" className="navy"><div className="wrap sec"><h2>Our Partnership Principles</h2>
      <p className="lead">Our commitment to our clients is reflected in the ALM Partnership Principles.</p>
      <div className="grid three">{w.principles.map((p, i) => <div className="pr" key={i}><h3>{p.t}</h3><p>{p.a}</p><p>{p.b}</p></div>)}</div></div></section>
    <section id="governance" className="wrap sec"><h2>Executive Board</h2><People list={w.exec} /><h2 style={{ marginTop: 56 }}>Board of Directors</h2><People list={w.board} /></section>
    <section id="locations" className="wrap sec"><h2>Our locations</h2>
      <p className="lead">ALM operates from two of the world's leading financial hubs.</p>
      {w.locations.map(r => <div key={r.region}><h3 className="reg">{r.region}</h3><div className="grid three">{r.items.map(l => <div className="card" key={l.c}><h4>{l.c}</h4><p>{l.city}</p><a href="#">ALM website</a></div>)}</div></div>)}</section>
    <section className="wrap sec"><h2>Find out more</h2><div className="grid three">{w.more.map(m => <Link to={m.to} className="card more" key={m.t}><h4>{m.t}</h4><p>{m.d}</p></Link>)}</div></section>
  </>
}

function Counter({ v, s }) {
  const ref = useRef(), [n, setN] = useState(0)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect()
      const t0 = performance.now(), f = t => { const p = Math.min((t - t0) / 1400, 1); setN(Math.round(v * (1 - Math.pow(1 - p, 3)))); p < 1 && requestAnimationFrame(f) }; requestAnimationFrame(f) })
    io.observe(ref.current); return () => io.disconnect()
  }, [v])
  return <b ref={ref}>{n}{s}</b>
}

const Page = ({ d }) => <div className="wrap sec"><h1>{d.title}</h1><p className="lead">{d.lead}</p>
  <div className="grid three">{d.items.map(i => <div className="card" key={i.t}><div className="ic">{i.i}</div><h4>{i.t}</h4><p>{i.d}</p></div>)}</div>
  {d.list && <div className="rows">{d.list.map(r => <div className="row" key={r.t}><div><h4>{r.t}</h4><p>{r.m}</p></div><span>→</span></div>)}</div>}</div>

function Home({ c }) {
  const h = c.home, p = c.pages.what
  return <>
    <section className="hero heroH"><img src="/logo.jpg" alt="ALM" /></section>
    <div className="wrap ctr herotxt"><h1>Capital with <em>purpose</em>. Growth with <em>vision</em>.</h1><p className="lead">{c.who.lead}</p>
      <div className="btns"><Link className="btn" to="/who-we-are">Discover who we are</Link><Link className="btn ghost" to="/contact">Talk to us</Link></div></div>
    <section className="stats"><div className="wrap">{c.stats.map(s => <div key={s.l}><Counter v={s.v} s={s.s} /><span>{s.l}</span></div>)}</div></section>
    <section className="wrap sec"><h2>What we do</h2><div className="grid three">{p.items.map(i => <div className="card" key={i.t}><div className="ic">{i.i}</div><h4>{i.t}</h4><p>{i.d}</p></div>)}</div></section>
    <section className="navy"><div className="wrap sec"><h2>Two hubs. One global outlook.</h2>
      <div className="grid hubs">{h.hubs.map(x => <div className="hub" key={x.c}><h3>{x.c}</h3><p>{x.d}</p></div>)}</div></div></section>
    <section className="wrap sec"><h2>How we work with you</h2><div className="grid four">{h.steps.map((s, i) => <div className="step" key={s.t}><div className="ic">{s.i}</div><small>0{i + 1}</small><h4>{s.t}</h4><p>{s.d}</p></div>)}</div></section>
    <section className="wrap sec"><h2>Latest insights</h2><div className="grid three">{h.insights.map(i => <Link to="/how-we-think" className="card more" key={i.t}><span className="chip">{i.tag}</span><h4>{i.t}</h4><p>{i.d}</p></Link>)}</div></section>
    <section className="cta"><div className="wrap ctr"><h2>{h.cta.t}</h2><p>{h.cta.d}</p><Link className="btn gold" to="/contact">Get in touch</Link></div></section></>
}

function Contact() {
  const [f, setF] = useState({ name: '', email: '', message: '' }), [st, setSt] = useState('')
  const send = async e => { e.preventDefault(); setSt('Sending…')
    try { const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }); if (!r.ok) throw 0; setSt('Thank you. We will be in touch shortly.'); setF({ name: '', email: '', message: '' }) }
    catch { setSt('Could not send. Make sure the backend is running.') } }
  return <div className="wrap sec"><h1>Contact us</h1><p className="lead">Partnership, investment or careers: tell us how we can help.</p>
    <form className="form" onSubmit={send}>
      <input required placeholder="Full name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      <input required type="email" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
      <textarea required rows="5" placeholder="Message" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} />
      <button className="btn" disabled={st === 'Sending…'}>{st === 'Sending…' ? 'Sending…' : 'Send message'}</button><p>{st}</p></form></div>
}

export default function App() {
  const c = useContent()
  return <Layout c={c}><Routes>
    <Route path="/" element={<Home c={c} />} />
    <Route path="/who-we-are" element={<Who c={c} />} />
    <Route path="/what-we-do" element={<Page d={c.pages.what} />} />
    <Route path="/how-we-think" element={<Page d={c.pages.think} />} />
    <Route path="/why-join-us" element={<Page d={c.pages.join} />} />
    <Route path="/media-centre" element={<Page d={c.pages.media} />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes></Layout>
}
