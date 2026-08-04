import { useState, useEffect, useCallback } from "react";
import {
  Radio, DollarSign, Music2, Play, SkipForward, Check, Settings,
  Loader2, Disc3, Lock, ArrowLeft, LogOut, KeyRound, Users,
} from "lucide-react";

const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
const MY_SESSION_KEY = "soundcheck:my-session"; // personal, per host device

function randomString(len, chars) {
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
function genSessionId() {
  return randomString(6, ID_CHARS);
}
function genPasscode() {
  return randomString(6, "0123456789");
}
function counter(n) {
  return String(n).padStart(3, "0");
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

const THEME_VARS = {
  "--tape-black": "#1B1B1F",
  "--reel-cream": "#EDE6D6",
  "--rec-red": "#E23744",
  "--gold-tape": "#D4A73A",
  "--deck-teal": "#2FA89A",
};

function Shell({ children }) {
  return (
    <div
      style={{
        ...THEME_VARS,
        fontFamily: "'Inter', sans-serif",
        background: "var(--tape-black)",
        minHeight: "100%",
        color: "var(--reel-cream)",
        padding: "28px 16px 60px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .display { font-family: 'Archivo Black', sans-serif; }
        * { box-sizing: border-box; }
        input, textarea {
          font-family: 'Inter', sans-serif;
          background: #100F12;
          border: 1px solid #3a3840;
          color: var(--reel-cream);
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          width: 100%;
          outline: none;
        }
        input:focus, textarea:focus { border-color: var(--gold-tape); }
        button { font-family: 'Inter', sans-serif; cursor: pointer; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, .tab:focus-visible {
          outline: 2px solid var(--deck-teal); outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) { .spin { animation: none !important; } }
        .spin { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .pulse { animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

function PrimaryBtn({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "var(--gold-tape)",
        color: "var(--tape-black)",
        border: "none",
        borderRadius: 8,
        padding: "12px 14px",
        fontWeight: 700,
        fontSize: 14,
        width: "100%",
        opacity: props.disabled ? 0.6 : 1,
        ...(props.style || {}),
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "transparent",
        border: "1px solid #3a3840",
        color: "var(--reel-cream)",
        borderRadius: 8,
        padding: "12px 14px",
        fontWeight: 600,
        fontSize: 14,
        width: "100%",
        ...(props.style || {}),
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mono" style={{ fontSize: 11, opacity: 0.6, display: "block", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function SoundCheck() {
  // mode: 'loading' | 'landing' | 'host-create' | 'host-login' | 'host' | 'fan-join' | 'fan'
  const [mode, setMode] = useState("loading");
  const [error, setError] = useState("");
  const [fanSessionId, setFanSessionId] = useState(null);
  const [hostSessionId, setHostSessionId] = useState(null);

  // On mount, check if this device already hosts a session.
  useEffect(() => {
    (async () => {
      try {
        const rec = await window.storage.get(MY_SESSION_KEY, false);
        if (rec) {
          const { id, passcode } = JSON.parse(rec.value);
          const s = await window.storage.get(`soundcheck:session:${id}`, true);
          if (s) {
            const parsed = JSON.parse(s.value);
            if (parsed.passcode === passcode) {
              setHostSessionId(id);
              setMode("host");
              return;
            }
          }
        }
      } catch {}
      setMode("landing");
    })();
  }, []);

  const goHostAfterAuth = async (id, passcode) => {
    try {
      await window.storage.set(MY_SESSION_KEY, JSON.stringify({ id, passcode }), false);
    } catch {}
    setHostSessionId(id);
    setMode("host");
  };

  const signOutHost = async () => {
    try {
      await window.storage.delete(MY_SESSION_KEY, false);
    } catch {}
    setHostSessionId(null);
    setMode("landing");
  };

  if (mode === "loading") {
    return (
      <Shell>
        <div className="mono" style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>
          loading…
        </div>
      </Shell>
    );
  }

  if (mode === "landing") {
    return (
      <Shell>
        <div style={{ textAlign: "center", marginBottom: 28, marginTop: 30 }}>
          <div className="display" style={{ fontSize: 26, marginBottom: 6 }}>SOUNDCHECK</div>
          <div className="mono" style={{ fontSize: 12, opacity: 0.55 }}>
            live submission queues for music sessions
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryBtn onClick={() => setMode("host-create")}>
            <Radio size={16} /> Host a live session
          </PrimaryBtn>
          <GhostBtn onClick={() => { setError(""); setMode("host-login"); }}>
            <KeyRound size={16} /> I already have a session
          </GhostBtn>
          <GhostBtn onClick={() => { setError(""); setMode("fan-join"); }}>
            <Music2 size={16} /> Join a session to submit a track
          </GhostBtn>
        </div>
      </Shell>
    );
  }

  if (mode === "host-create") {
    return <HostCreateView onCreated={goHostAfterAuth} onBack={() => setMode("landing")} />;
  }

  if (mode === "host-login") {
    return (
      <HostLoginView
        error={error}
        setError={setError}
        onAuthed={goHostAfterAuth}
        onBack={() => setMode("landing")}
      />
    );
  }

  if (mode === "fan-join") {
    return (
      <FanJoinView
        error={error}
        setError={setError}
        onJoined={(id) => { setFanSessionId(id); setMode("fan"); }}
        onBack={() => setMode("landing")}
      />
    );
  }

  if (mode === "fan") {
    return <FanSessionView sessionId={fanSessionId} onBack={() => setMode("landing")} />;
  }

  if (mode === "host") {
    return <HostSessionView sessionId={hostSessionId} onSignOut={signOutHost} />;
  }

  return null;
}

/* ---------- Host: create ---------- */

function HostCreateView({ onCreated, onBack }) {
  const [title, setTitle] = useState("");
  const [hostName, setHostName] = useState("");
  const [fee, setFee] = useState(5);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const create = async (e) => {
    e.preventDefault();
    if (!title.trim() || !hostName.trim()) return;
    setCreating(true);
    const id = genSessionId();
    const passcode = genPasscode();
    const session = {
      id,
      passcode,
      title: title.trim(),
      host: hostName.trim(),
      fee: Number(fee) || 0,
      live: true,
    };
    try {
      await window.storage.set(`soundcheck:session:${id}`, JSON.stringify(session), true);
      await window.storage.set(`soundcheck:queue:${id}`, JSON.stringify([]), true);
    } catch {}
    setCreating(false);
    setCreated({ id, passcode });
  };

  if (created) {
    return (
      <Shell>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Check size={28} style={{ color: "var(--deck-teal)", marginBottom: 10 }} />
          <div className="display" style={{ fontSize: 18, marginBottom: 14 }}>SESSION CREATED</div>
          <div className="mono" style={{ fontSize: 12, opacity: 0.6, marginBottom: 18 }}>
            save these — you'll need them to manage this session from any device.
            <br />anyone with just the session ID can only submit tracks, not control the queue.
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            <div style={{ flex: 1, background: "#100F12", border: "1px solid #3a3840", borderRadius: 8, padding: "14px 10px" }}>
              <div className="mono" style={{ fontSize: 10, opacity: 0.55, marginBottom: 6 }}>SESSION ID</div>
              <div className="display" style={{ fontSize: 20, letterSpacing: 2 }}>{created.id}</div>
            </div>
            <div style={{ flex: 1, background: "#100F12", border: "1px solid #3a3840", borderRadius: 8, padding: "14px 10px" }}>
              <div className="mono" style={{ fontSize: 10, opacity: 0.55, marginBottom: 6 }}>HOST PASSCODE</div>
              <div className="display" style={{ fontSize: 20, letterSpacing: 2 }}>{created.passcode}</div>
            </div>
          </div>
          <PrimaryBtn onClick={() => onCreated(created.id, created.passcode)}>
            Go to my dashboard
          </PrimaryBtn>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <button onClick={onBack} className="mono" style={{ background: "none", border: "none", color: "var(--reel-cream)", opacity: 0.6, fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginBottom: 18 }}>
        <ArrowLeft size={13} /> back
      </button>
      <div className="display" style={{ fontSize: 20, marginBottom: 16 }}>SET UP YOUR SESSION</div>
      <form onSubmit={create} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="SESSION TITLE">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Late Night Listening Session" required />
        </Field>
        <Field label="YOUR NAME / HOST NAME">
          <input value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="e.g. DJ Nova" required />
        </Field>
        <Field label="SUBMISSION FEE ($)">
          <input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} />
        </Field>
        <PrimaryBtn type="submit" disabled={creating} style={{ marginTop: 6 }}>
          {creating ? <><Loader2 size={16} className="spin" /> Creating…</> : "Create session"}
        </PrimaryBtn>
      </form>
    </Shell>
  );
}

/* ---------- Host: login from another device ---------- */

function HostLoginView({ onAuthed, onBack, error, setError }) {
  const [id, setId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      const s = await window.storage.get(`soundcheck:session:${id.trim().toUpperCase()}`, true);
      if (!s) {
        setError("No session found with that ID.");
      } else {
        const parsed = JSON.parse(s.value);
        if (parsed.passcode !== passcode.trim()) {
          setError("Wrong passcode for that session.");
        } else {
          await onAuthed(parsed.id, parsed.passcode);
        }
      }
    } catch {
      setError("Something went wrong — try again.");
    }
    setChecking(false);
  };

  return (
    <Shell>
      <button onClick={onBack} className="mono" style={{ background: "none", border: "none", color: "var(--reel-cream)", opacity: 0.6, fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginBottom: 18 }}>
        <ArrowLeft size={13} /> back
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Lock size={18} style={{ color: "var(--gold-tape)" }} />
        <div className="display" style={{ fontSize: 20 }}>HOST ACCESS</div>
      </div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="SESSION ID">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. QK7F2M" required />
        </Field>
        <Field label="PASSCODE">
          <input value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="6-digit passcode" required />
        </Field>
        {error && <div className="mono" style={{ fontSize: 12, color: "var(--rec-red)" }}>{error}</div>}
        <PrimaryBtn type="submit" disabled={checking} style={{ marginTop: 4 }}>
          {checking ? <><Loader2 size={16} className="spin" /> Checking…</> : "Unlock dashboard"}
        </PrimaryBtn>
      </form>
    </Shell>
  );
}

/* ---------- Fan: join ---------- */

function FanJoinView({ onJoined, onBack, error, setError }) {
  const [id, setId] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      const clean = id.trim().toUpperCase();
      const s = await window.storage.get(`soundcheck:session:${clean}`, true);
      if (!s) {
        setError("No session found with that ID — double check it with the host.");
      } else {
        onJoined(clean);
      }
    } catch {
      setError("Something went wrong — try again.");
    }
    setChecking(false);
  };

  return (
    <Shell>
      <button onClick={onBack} className="mono" style={{ background: "none", border: "none", color: "var(--reel-cream)", opacity: 0.6, fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginBottom: 18 }}>
        <ArrowLeft size={13} /> back
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Users size={18} style={{ color: "var(--deck-teal)" }} />
        <div className="display" style={{ fontSize: 20 }}>JOIN A SESSION</div>
      </div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="SESSION ID">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="ask the host for their code" required />
        </Field>
        {error && <div className="mono" style={{ fontSize: 12, color: "var(--rec-red)" }}>{error}</div>}
        <PrimaryBtn type="submit" disabled={checking} style={{ marginTop: 4 }}>
          {checking ? <><Loader2 size={16} className="spin" /> Looking it up…</> : "Continue"}
        </PrimaryBtn>
      </form>
    </Shell>
  );
}

/* ---------- Shared header ---------- */

function SessionHeader({ session }) {
  return (
    <div
      style={{
        background: "var(--reel-cream)",
        color: "var(--tape-black)",
        borderRadius: 10,
        padding: "18px 20px",
        transform: "rotate(-0.6deg)",
        boxShadow: "0 6px 0 rgba(0,0,0,0.35)",
        marginBottom: 22,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.6, marginBottom: 4 }}>
            LIVE SESSION · {session.id}
          </div>
          <div className="display" style={{ fontSize: 22, lineHeight: 1.1, wordBreak: "break-word", marginBottom: 6 }}>
            {session.title}
          </div>
          <div className="mono" style={{ fontSize: 12, opacity: 0.75 }}>hosted by {session.host}</div>
        </div>
        <div
          className="mono"
          style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
            padding: "6px 10px", borderRadius: 999,
            background: session.live ? "var(--rec-red)" : "#8a8880",
            color: "#fff", flexShrink: 0, whiteSpace: "nowrap",
          }}
        >
          <span className={session.live ? "pulse" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
          {session.live ? "LIVE" : "OFFLINE"}
        </div>
      </div>
    </div>
  );
}

/* ---------- Fan: submission view ---------- */

function FanSessionView({ sessionId, onBack }) {
  const [session, setSession] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await window.storage.get(`soundcheck:session:${sessionId}`, true);
      setSession(s ? JSON.parse(s.value) : null);
    } catch { setSession(null); }
    try {
      const q = await window.storage.get(`soundcheck:queue:${sessionId}`, true);
      setQueue(q ? JSON.parse(q.value) : []);
    } catch { setQueue([]); }
    setLoaded(true);
  }, [sessionId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  const saveQueue = async (next) => {
    setQueue(next);
    try { await window.storage.set(`soundcheck:queue:${sessionId}`, JSON.stringify(next), true); } catch {}
  };

  if (!loaded) {
    return <Shell><div className="mono" style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>loading session…</div></Shell>;
  }
  if (!session) {
    return (
      <Shell>
        <div className="mono" style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>
          this session no longer exists.
          <div style={{ marginTop: 14 }}>
            <GhostBtn onClick={onBack}><ArrowLeft size={14} /> back</GhostBtn>
          </div>
        </div>
      </Shell>
    );
  }

  const nowPlaying = queue.find((e) => e.status === "now-playing");
  const upNext = queue.filter((e) => e.status === "queued").slice(0, 3);

  return (
    <Shell>
      <button onClick={onBack} className="mono" style={{ background: "none", border: "none", color: "var(--reel-cream)", opacity: 0.6, fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
        <ArrowLeft size={13} /> back
      </button>
      <SessionHeader session={session} />
      <SubmitForm session={session} queue={queue} saveQueue={saveQueue} nowPlaying={nowPlaying} upNext={upNext} />
    </Shell>
  );
}

function SubmitForm({ session, queue, saveQueue, nowPlaying, upNext }) {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !link.trim()) return;
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1000));
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(), link: link.trim(), message: message.trim(),
      paid: true, status: "queued", submittedAt: Date.now(),
    };
    const next = [...queue, entry];
    await saveQueue(next);
    setPaying(false);
    setConfirmed({ position: next.filter((e) => e.status === "queued").length });
    setName(""); setLink(""); setMessage("");
  };

  return (
    <div>
      {!session.live && (
        <div className="mono" style={{ background: "#100F12", border: "1px solid #3a3840", borderRadius: 8, padding: "10px 14px", fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
          this session is offline right now — submissions will queue for the next live session.
        </div>
      )}
      <div style={{ marginBottom: 20 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.55, marginBottom: 8 }}>NOW PLAYING</div>
        {nowPlaying ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(47,168,154,0.1)", border: "1px solid var(--deck-teal)", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
            <Disc3 size={18} className="spin" style={{ color: "var(--deck-teal)", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{nowPlaying.name}</div>
              <div className="mono" style={{ fontSize: 11, opacity: 0.6, wordBreak: "break-all" }}>{nowPlaying.link}</div>
            </div>
          </div>
        ) : (
          <div className="mono" style={{ fontSize: 13, opacity: 0.5, marginBottom: 12 }}>nothing spinning right now</div>
        )}
        {upNext.length > 0 && (
          <>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.55, marginBottom: 8 }}>UP NEXT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {upNext.map((e, i) => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "8px 10px", background: "#100F12", borderRadius: 6 }}>
                  <span className="mono" style={{ color: "var(--gold-tape)", fontSize: 12 }}>{counter(i + 1)}</span>
                  <span style={{ fontWeight: 500 }}>{e.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ background: "#100F12", border: "1px solid #3a3840", borderRadius: 10, padding: 18 }}>
        {confirmed ? (
          <div style={{ textAlign: "center", padding: "12px 4px" }}>
            <Check size={28} style={{ color: "var(--deck-teal)", marginBottom: 8 }} />
            <div className="display" style={{ fontSize: 16, marginBottom: 6 }}>YOU'RE IN THE QUEUE</div>
            <div className="mono" style={{ fontSize: 12, opacity: 0.65, marginBottom: 14 }}>position #{counter(confirmed.position)}</div>
            <GhostBtn onClick={() => setConfirmed(null)}>Submit another track</GhostBtn>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="YOUR NAME / ARTIST NAME">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lil Dre" required />
            </Field>
            <Field label="TRACK LINK">
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="SoundCloud / YouTube / audio link" required />
            </Field>
            <Field label="MESSAGE TO HOST (optional)">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Anything the host should know before playing it" />
            </Field>
            <PrimaryBtn type="submit" disabled={paying} style={{ marginTop: 4 }}>
              {paying ? <><Loader2 size={16} className="spin" /> Processing payment…</> : <><DollarSign size={16} /> Submit & Pay ${session.fee}</>}
            </PrimaryBtn>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- Host: dashboard ---------- */

function HostSessionView({ sessionId, onSignOut }) {
  const [session, setSession] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  const load = useCallback(async () => {
    try {
      const s = await window.storage.get(`soundcheck:session:${sessionId}`, true);
      const parsed = s ? JSON.parse(s.value) : null;
      setSession(parsed);
      setDraft((d) => d || parsed);
    } catch { setSession(null); }
    try {
      const q = await window.storage.get(`soundcheck:queue:${sessionId}`, true);
      setQueue(q ? JSON.parse(q.value) : []);
    } catch { setQueue([]); }
    setLoaded(true);
  }, [sessionId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  const saveSession = async (next) => {
    setSession(next);
    try { await window.storage.set(`soundcheck:session:${sessionId}`, JSON.stringify(next), true); } catch {}
  };
  const saveQueue = async (next) => {
    setQueue(next);
    try { await window.storage.set(`soundcheck:queue:${sessionId}`, JSON.stringify(next), true); } catch {}
  };

  if (!loaded || !session) {
    return <Shell><div className="mono" style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>loading dashboard…</div></Shell>;
  }

  const earned = queue.filter((e) => e.paid).length * (Number(session.fee) || 0);
  const sorted = [...queue].sort((a, b) => {
    const order = { "now-playing": 0, queued: 1, played: 2, skipped: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return a.submittedAt - b.submittedAt;
  });

  const setStatus = async (id, status) => {
    let next = queue.map((e) => (e.id === id ? { ...e, status } : e));
    if (status === "now-playing") {
      next = next.map((e) => (e.id !== id && e.status === "now-playing" ? { ...e, status: "queued" } : e));
    }
    await saveQueue(next);
  };
  const clearFinished = async () => {
    await saveQueue(queue.filter((e) => e.status !== "played" && e.status !== "skipped"));
  };

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span className="mono" style={{ fontSize: 11, opacity: 0.5 }}>HOST DASHBOARD</span>
        <button onClick={onSignOut} className="mono" style={{ background: "none", border: "none", color: "var(--reel-cream)", opacity: 0.55, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
          <LogOut size={12} /> sign out
        </button>
      </div>
      <SessionHeader session={session} />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: "#100F12", borderRadius: 8, padding: "12px 14px" }}>
          <div className="mono" style={{ fontSize: 10, opacity: 0.55, marginBottom: 4 }}>EARNED THIS SESSION</div>
          <div className="display" style={{ fontSize: 20, color: "var(--gold-tape)" }}>${earned}</div>
        </div>
        <div style={{ flex: 1, background: "#100F12", borderRadius: 8, padding: "12px 14px" }}>
          <div className="mono" style={{ fontSize: 10, opacity: 0.55, marginBottom: 4 }}>IN QUEUE</div>
          <div className="display" style={{ fontSize: 20 }}>{counter(queue.filter((e) => e.status === "queued").length)}</div>
        </div>
        <button onClick={() => setSettingsOpen((s) => !s)} style={{ background: "#100F12", border: "1px solid #3a3840", borderRadius: 8, padding: "0 14px", color: "var(--reel-cream)" }} aria-label="Session settings">
          <Settings size={18} />
        </button>
      </div>

      {settingsOpen && (
        <div style={{ background: "#100F12", border: "1px solid #3a3840", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="SESSION TITLE">
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field label="HOST NAME">
              <input value={draft.host} onChange={(e) => setDraft({ ...draft, host: e.target.value })} />
            </Field>
            <Field label="SUBMISSION FEE ($)">
              <input type="number" min="0" value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} />
            </Field>
            <div className="mono" style={{ fontSize: 11, opacity: 0.5 }}>
              share this ID so fans can submit: <span style={{ color: "var(--gold-tape)" }}>{session.id}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <PrimaryBtn onClick={() => saveSession({ ...draft, fee: Number(draft.fee) || 0 })}>Save</PrimaryBtn>
              <GhostBtn
                onClick={() => saveSession({ ...session, live: !session.live })}
                style={{ borderColor: session.live ? "var(--rec-red)" : "var(--deck-teal)", color: session.live ? "var(--rec-red)" : "var(--deck-teal)" }}
              >
                {session.live ? "Go Offline" : "Go Live"}
              </GhostBtn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.55 }}>QUEUE</div>
        <button onClick={clearFinished} className="mono" style={{ background: "none", border: "none", color: "var(--reel-cream)", opacity: 0.5, fontSize: 11 }}>
          clear played/skipped
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="mono" style={{ textAlign: "center", padding: 30, opacity: 0.5, fontSize: 13, border: "1px dashed #3a3840", borderRadius: 8 }}>
          no submissions yet — share session ID <span style={{ color: "var(--gold-tape)" }}>{session.id}</span> to start collecting tracks
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((e, i) => (
            <div key={e.id} style={{
              background: e.status === "now-playing" ? "rgba(47,168,154,0.1)" : "#100F12",
              border: "1px solid " + (e.status === "now-playing" ? "var(--deck-teal)" : "#3a3840"),
              borderRadius: 8, padding: "10px 12px",
              opacity: e.status === "played" || e.status === "skipped" ? 0.45 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--gold-tape)" }}>{counter(i + 1)}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</span>
                    {e.paid && <span className="mono" style={{ fontSize: 10, color: "var(--gold-tape)", opacity: 0.8 }}>PAID</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 11, opacity: 0.55, wordBreak: "break-all", marginTop: 2 }}>{e.link}</div>
                  {e.message && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4, fontStyle: "italic" }}>"{e.message}"</div>}
                  <div className="mono" style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}>{timeAgo(e.submittedAt)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                  {e.status !== "now-playing" && e.status !== "played" && (
                    <IconBtn onClick={() => setStatus(e.id, "now-playing")} title="Play now"><Play size={13} /></IconBtn>
                  )}
                  {e.status === "now-playing" && (
                    <IconBtn onClick={() => setStatus(e.id, "played")} title="Mark played" accent><Check size={13} /></IconBtn>
                  )}
                  {e.status === "queued" && (
                    <IconBtn onClick={() => setStatus(e.id, "skipped")} title="Skip"><SkipForward size={13} /></IconBtn>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

function IconBtn({ children, onClick, title, accent }) {
  return (
    <button onClick={onClick} title={title} aria-label={title} style={{
      width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: 5, border: "1px solid " + (accent ? "var(--deck-teal)" : "#3a3840"),
      background: accent ? "rgba(47,168,154,0.15)" : "transparent",
      color: accent ? "var(--deck-teal)" : "var(--reel-cream)",
    }}>
      {children}
    </button>
  );
}
