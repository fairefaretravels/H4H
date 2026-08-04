import { useState, useEffect, useCallback } from "react";
import { Radio, DollarSign, Music2, Play, SkipForward, Check, Settings, Plus, X, Loader2, Disc3 } from "lucide-react";

const SESSION_KEY = "soundcheck:session";
const QUEUE_KEY = "soundcheck:queue";

const DEFAULT_SESSION = {
  title: "Late Night Listening Session",
  host: "DJ Nova",
  fee: 5,
  live: true,
};

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

export default function SoundCheck() {
  const [session, setSession] = useState(DEFAULT_SESSION);
  const [queue, setQueue] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("submit"); // 'submit' | 'host'
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await window.storage.get(SESSION_KEY, true);
      setSession(s ? JSON.parse(s.value) : DEFAULT_SESSION);
    } catch {
      setSession(DEFAULT_SESSION);
    }
    try {
      const q = await window.storage.get(QUEUE_KEY, true);
      setQueue(q ? JSON.parse(q.value) : []);
    } catch {
      setQueue([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  const saveSession = async (next) => {
    setSession(next);
    try {
      await window.storage.set(SESSION_KEY, JSON.stringify(next), true);
    } catch {}
  };

  const saveQueue = async (next) => {
    setQueue(next);
    try {
      await window.storage.set(QUEUE_KEY, JSON.stringify(next), true);
    } catch {}
  };

  const nowPlaying = queue.find((e) => e.status === "now-playing");
  const upNext = queue.filter((e) => e.status === "queued").slice(0, 3);
  const earned = queue.filter((e) => e.paid).length * (Number(session.fee) || 0);

  return (
    <div
      style={{
        "--tape-black": "#1B1B1F",
        "--reel-cream": "#EDE6D6",
        "--rec-red": "#E23744",
        "--gold-tape": "#D4A73A",
        "--deck-teal": "#2FA89A",
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
        @media (prefers-reduced-motion: reduce) {
          .spin { animation: none !important; }
        }
        .spin { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .pulse { animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Cassette label header */}
        <div
          style={{
            background: "var(--reel-cream)",
            color: "var(--tape-black)",
            borderRadius: 10,
            padding: "18px 20px",
            transform: "rotate(-0.6deg)",
            boxShadow: "0 6px 0 rgba(0,0,0,0.35)",
            position: "relative",
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.6, marginBottom: 4 }}>
                LIVE SESSION
              </div>
              <div
                className="display"
                style={{
                  fontSize: 22,
                  lineHeight: 1.1,
                  wordBreak: "break-word",
                  marginBottom: 6,
                }}
              >
                {session.title}
              </div>
              <div className="mono" style={{ fontSize: 12, opacity: 0.75 }}>
                hosted by {session.host}
              </div>
            </div>
            <div
              className="mono"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 10px",
                borderRadius: 999,
                background: session.live ? "var(--rec-red)" : "#8a8880",
                color: "#fff",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <span
                className={session.live ? "pulse" : ""}
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }}
              />
              {session.live ? "LIVE" : "OFFLINE"}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { id: "submit", label: "Submit a Track", icon: Music2 },
            { id: "host", label: "Host Dashboard", icon: Radio },
          ].map((t) => (
            <button
              key={t.id}
              className="tab"
              onClick={() => setView(t.id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid " + (view === t.id ? "var(--gold-tape)" : "#3a3840"),
                background: view === t.id ? "rgba(212,167,58,0.12)" : "transparent",
                color: view === t.id ? "var(--gold-tape)" : "var(--reel-cream)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {!loaded ? (
          <div style={{ textAlign: "center", padding: 40, opacity: 0.6 }} className="mono">
            loading session…
          </div>
        ) : view === "submit" ? (
          <SubmitView
            session={session}
            nowPlaying={nowPlaying}
            upNext={upNext}
            queue={queue}
            saveQueue={saveQueue}
          />
        ) : (
          <HostView
            session={session}
            saveSession={saveSession}
            queue={queue}
            saveQueue={saveQueue}
            earned={earned}
            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
          />
        )}
      </div>
    </div>
  );
}

function SubmitView({ session, nowPlaying, upNext, queue, saveQueue }) {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !link.trim()) return;
    setPaying(true);
    // simulate payment processing
    await new Promise((r) => setTimeout(r, 1000));
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      link: link.trim(),
      message: message.trim(),
      paid: true,
      status: "queued",
      submittedAt: Date.now(),
    };
    const next = [...queue, entry];
    await saveQueue(next);
    const position = next.filter((e) => e.status === "queued").length;
    setPaying(false);
    setConfirmed({ position });
    setName("");
    setLink("");
    setMessage("");
  };

  return (
    <div>
      {!session.live && (
        <div
          className="mono"
          style={{
            background: "#100F12",
            border: "1px solid #3a3840",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            opacity: 0.7,
            marginBottom: 16,
          }}
        >
          this session is offline right now — submissions will queue for the next live session.
        </div>
      )}

      {/* Now playing / up next */}
      <div style={{ marginBottom: 20 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.55, marginBottom: 8 }}>
          NOW PLAYING
        </div>
        {nowPlaying ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(47,168,154,0.1)",
              border: "1px solid var(--deck-teal)",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 12,
            }}
          >
            <Disc3 size={18} className="spin" style={{ color: "var(--deck-teal)", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{nowPlaying.name}</div>
              <div className="mono" style={{ fontSize: 11, opacity: 0.6, wordBreak: "break-all" }}>
                {nowPlaying.link}
              </div>
            </div>
          </div>
        ) : (
          <div className="mono" style={{ fontSize: 13, opacity: 0.5, marginBottom: 12 }}>
            nothing spinning right now
          </div>
        )}

        {upNext.length > 0 && (
          <>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.55, marginBottom: 8 }}>
              UP NEXT
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {upNext.map((e, i) => (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13,
                    padding: "8px 10px",
                    background: "#100F12",
                    borderRadius: 6,
                  }}
                >
                  <span className="mono" style={{ color: "var(--gold-tape)", fontSize: 12 }}>
                    {counter(i + 1)}
                  </span>
                  <span style={{ fontWeight: 500 }}>{e.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Submission form */}
      <div
        style={{
          background: "#100F12",
          border: "1px solid #3a3840",
          borderRadius: 10,
          padding: 18,
        }}
      >
        {confirmed ? (
          <div style={{ textAlign: "center", padding: "12px 4px" }}>
            <Check size={28} style={{ color: "var(--deck-teal)", marginBottom: 8 }} />
            <div className="display" style={{ fontSize: 16, marginBottom: 6 }}>
              YOU'RE IN THE QUEUE
            </div>
            <div className="mono" style={{ fontSize: 12, opacity: 0.65, marginBottom: 14 }}>
              position #{counter(confirmed.position)}
            </div>
            <button
              onClick={() => setConfirmed(null)}
              style={{
                background: "transparent",
                border: "1px solid var(--gold-tape)",
                color: "var(--gold-tape)",
                borderRadius: 6,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Submit another track
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label className="mono" style={{ fontSize: 11, opacity: 0.6, display: "block", marginBottom: 4 }}>
                YOUR NAME / ARTIST NAME
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lil Dre" required />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 11, opacity: 0.6, display: "block", marginBottom: 4 }}>
                TRACK LINK
              </label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="SoundCloud / YouTube / audio link"
                required
              />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 11, opacity: 0.6, display: "block", marginBottom: 4 }}>
                MESSAGE TO HOST (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Anything the host should know before playing it"
              />
            </div>
            <button
              type="submit"
              disabled={paying}
              style={{
                marginTop: 4,
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
                opacity: paying ? 0.7 : 1,
              }}
            >
              {paying ? (
                <>
                  <Loader2 size={16} className="spin" /> Processing payment…
                </>
              ) : (
                <>
                  <DollarSign size={16} /> Submit & Pay ${session.fee}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function HostView({ session, saveSession, queue, saveQueue, earned, settingsOpen, setSettingsOpen }) {
  const [draft, setDraft] = useState(session);

  useEffect(() => setDraft(session), [session]);

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
    <div>
      {/* Stats + settings toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: "#100F12", borderRadius: 8, padding: "12px 14px" }}>
          <div className="mono" style={{ fontSize: 10, opacity: 0.55, marginBottom: 4 }}>
            EARNED THIS SESSION
          </div>
          <div className="display" style={{ fontSize: 20, color: "var(--gold-tape)" }}>
            ${earned}
          </div>
        </div>
        <div style={{ flex: 1, background: "#100F12", borderRadius: 8, padding: "12px 14px" }}>
          <div className="mono" style={{ fontSize: 10, opacity: 0.55, marginBottom: 4 }}>
            IN QUEUE
          </div>
          <div className="display" style={{ fontSize: 20 }}>
            {counter(queue.filter((e) => e.status === "queued").length)}
          </div>
        </div>
        <button
          onClick={() => setSettingsOpen((s) => !s)}
          style={{
            background: "#100F12",
            border: "1px solid #3a3840",
            borderRadius: 8,
            padding: "0 14px",
            color: "var(--reel-cream)",
          }}
          aria-label="Session settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {settingsOpen && (
        <div style={{ background: "#100F12", border: "1px solid #3a3840", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label className="mono" style={{ fontSize: 11, opacity: 0.6, display: "block", marginBottom: 4 }}>
                SESSION TITLE
              </label>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 11, opacity: 0.6, display: "block", marginBottom: 4 }}>
                HOST NAME
              </label>
              <input value={draft.host} onChange={(e) => setDraft({ ...draft, host: e.target.value })} />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 11, opacity: 0.6, display: "block", marginBottom: 4 }}>
                SUBMISSION FEE ($)
              </label>
              <input
                type="number"
                min="0"
                value={draft.fee}
                onChange={(e) => setDraft({ ...draft, fee: e.target.value })}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={() => saveSession({ ...draft, fee: Number(draft.fee) || 0 })}
                style={{
                  flex: 1,
                  background: "var(--gold-tape)",
                  color: "var(--tape-black)",
                  border: "none",
                  borderRadius: 6,
                  padding: "9px 12px",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Save
              </button>
              <button
                onClick={() => saveSession({ ...session, live: !session.live })}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid " + (session.live ? "var(--rec-red)" : "var(--deck-teal)"),
                  color: session.live ? "var(--rec-red)" : "var(--deck-teal)",
                  borderRadius: 6,
                  padding: "9px 12px",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {session.live ? "Go Offline" : "Go Live"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.55 }}>
          QUEUE
        </div>
        <button
          onClick={clearFinished}
          className="mono"
          style={{ background: "none", border: "none", color: "var(--reel-cream)", opacity: 0.5, fontSize: 11 }}
        >
          clear played/skipped
        </button>
      </div>

      {sorted.length === 0 ? (
        <div
          className="mono"
          style={{ textAlign: "center", padding: 30, opacity: 0.5, fontSize: 13, border: "1px dashed #3a3840", borderRadius: 8 }}
        >
          no submissions yet — share your session link to start collecting tracks
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((e, i) => (
            <div
              key={e.id}
              style={{
                background: e.status === "now-playing" ? "rgba(47,168,154,0.1)" : "#100F12",
                border: "1px solid " + (e.status === "now-playing" ? "var(--deck-teal)" : "#3a3840"),
                borderRadius: 8,
                padding: "10px 12px",
                opacity: e.status === "played" || e.status === "skipped" ? 0.45 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--gold-tape)" }}>
                      {counter(i + 1)}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</span>
                    {e.paid && (
                      <span className="mono" style={{ fontSize: 10, color: "var(--gold-tape)", opacity: 0.8 }}>
                        PAID
                      </span>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: 11, opacity: 0.55, wordBreak: "break-all", marginTop: 2 }}>
                    {e.link}
                  </div>
                  {e.message && (
                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4, fontStyle: "italic" }}>"{e.message}"</div>
                  )}
                  <div className="mono" style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}>
                    {timeAgo(e.submittedAt)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                  {e.status !== "now-playing" && e.status !== "played" && (
                    <IconBtn onClick={() => setStatus(e.id, "now-playing")} title="Play now">
                      <Play size={13} />
                    </IconBtn>
                  )}
                  {e.status === "now-playing" && (
                    <IconBtn onClick={() => setStatus(e.id, "played")} title="Mark played" accent>
                      <Check size={13} />
                    </IconBtn>
                  )}
                  {e.status === "queued" && (
                    <IconBtn onClick={() => setStatus(e.id, "skipped")} title="Skip">
                      <SkipForward size={13} />
                    </IconBtn>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title, accent }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        border: "1px solid " + (accent ? "var(--deck-teal)" : "#3a3840"),
        background: accent ? "rgba(47,168,154,0.15)" : "transparent",
        color: accent ? "var(--deck-teal)" : "var(--reel-cream)",
      }}
    >
      {children}
    </button>
  );
}
