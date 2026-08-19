import { useState, useEffect, useRef } from "react";


type Verdict = "idle" | "checking" | "safe" | "malicious";

function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-10 bg-[#0B1120] text-white px-4 md:px-8 py-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="font-[Space_Grotesk] font-bold text-lg tracking-tight">URL Analyzer</span>
                </div>

                <nav className="hidden md:flex gap-8 text-sm text-slate-300">
                    <a href="#how" className="hover:text-white transition">How it works</a>
                    <a href="#sources" className="hover:text-white transition">Sources</a>
                    <a href="#about" className="hover:text-white transition">About</a>
                </nav>

                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden text-white"
                    aria-label="Toggle menu"
                >
                    {open ? "✕" : "☰"}
                </button>
            </div>

            {open && (
                <nav className="md:hidden flex flex-col gap-4 pt-5 text-sm text-slate-300">
                    <a href="#how" onClick={() => setOpen(false)} className="hover:text-white transition">How it works</a>
                    <a href="#sources" onClick={() => setOpen(false)} className="hover:text-white transition">Sources</a>
                    <a href="#about" onClick={() => setOpen(false)} className="hover:text-white transition">About</a>
                </nav>
            )}
        </header>
    );
}

function Hero() {
    const [url, setUrl] = useState("");
    const [verdict, setVerdict] = useState<Verdict>("idle");
    const [turnstileToken, setTurnstileToken] = useState("");
    const widgetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // @ts-ignore - Turnstile loads globally via the script tag in index.html
        if (window.turnstile && widgetRef.current) {
            // @ts-ignore
            window.turnstile.render(widgetRef.current, {
                sitekey: "0x4AAAAAAEVY8Quh3hqcFGlT",
                callback: (token: string) => setTurnstileToken(token),
            });
        }
    }, []);

    async function handleCheck() {
        if (!url || !turnstileToken) return;
        setVerdict("checking");
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/check?url=${encodeURIComponent(url)}&turnstile_token=${turnstileToken}`,
                { method: "POST" }
            );
            const data = await response.json();
            setVerdict(data.verdict === "malicious" ? "malicious" : "safe");
        } catch (err) {
            console.error(err);
            setVerdict("idle");
        }
    }

    const verdictConfig: Record<Verdict, { label: string; color: string; dot: string }> = {
        idle: {label: "Paste a link to begin", color: "text-slate-500", dot: "bg-slate-300"},
        checking: {label: "Scanning across sources…", color: "text-indigo-600", dot: "bg-indigo-500 animate-pulse"},
        safe: {label: "Clean — no threats detected", color: "text-emerald-700", dot: "bg-emerald-500"},
        malicious: {label: "Flagged — this link is unsafe", color: "text-red-700", dot: "bg-red-500"},
    };
    const v = verdictConfig[verdict];

    return (
        <section className="bg-[#E0F2FE] rounded-b-[2.5rem] px-8 py-20">
            <div className="max-w-2xl mx-auto text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-indigo-700 mb-4">
                    Real-time link intelligence
                </p>
                <h1 className="font-[Space_Grotesk] font-bold text-5xl md:text-6xl text-[#0B1120] leading-[1.05] mb-6">
                    Know what's on<br/>the other side of a link.
                </h1>
                <p className="text-slate-600 mb-10 max-w-md mx-auto">
                    Paste any URL and get an instant read against live threat-intelligence
                    sources — no account, no tracking, just a straight answer.
                </p>
                <div className="bg-white rounded-2xl shadow-xl p-2 flex gap-2 items-center max-w-xl mx-auto">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 min-w-0 px-4 py-3 rounded-xl outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                        onClick={handleCheck}
                        className="bg-[#0B1120] text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
                    >
                        Analyze
                    </button>
                </div>
                <div ref={widgetRef} className="mt-4 flex justify-center"></div>
                <div className="flex items-center justify-center gap-2 mt-5">
                    <span className={`w-2 h-2 rounded-full ${v.dot}`}/>
                    <span className={`text-sm font-medium ${v.color}`}>{v.label}</span>
                </div>
            </div>
        </section>
    );
}

function Features() {
    const features = [
        {
            title: "Cross-referenced",
            desc: "Every check queries multiple independent threat-intelligence sources at once, not a single list."
        },
        {
            title: "Cached, not stale",
            desc: "Repeat lookups return instantly from cache, while checks refresh on a regular interval."
        },
        {
            title: "Built for speed",
            desc: "Sources are queried in parallel, so a full analysis typically returns in under two seconds."
        },
        {title: "No account needed", desc: "Paste a link and get an answer. Nothing is stored against an identity."},
    ];

    return (
        <section id="how" className="px-8 py-20 max-w-5xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-widest text-indigo-700 mb-3">How it works</p>
            <h2 className="font-[Space_Grotesk] font-bold text-3xl md:text-4xl text-[#0B1120] mb-14 max-w-lg">
                One input, a full picture.
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
                {features.map((f) => (
                    <div key={f.title} className="flex gap-4">
                        <div className="w-1 bg-indigo-200 rounded-full shrink-0"/>
                        <div>
                            <h3 className="font-[Space_Grotesk] font-bold text-lg text-[#0B1120] mb-1.5">{f.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer id="about" className="bg-[#0B1120] text-slate-400 px-8 py-12 mt-12">
            <div
                className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="font-[Space_Grotesk] font-bold text-white">URL Analyzer</span>
                    <p className="text-sm mt-1">Built as a personal project — sources checked via Google Safe Browsing &
                        VirusTotal.</p>
                </div>
                <div className="flex gap-6 text-sm">
                    <a href="https://github.com/Kimberly-Paredes/URL-Analyzer.git" className="hover:text-white transition">GitHub</a>
                    <a href="#" className="hover:text-white transition">Contact</a>
                </div>
            </div>
            <p className="text-xs text-slate-600 mt-8">© 2026 URL Analyzer. Independent project, not affiliated with any
                listed source.</p>
        </footer>
    );
}

function App() {
    return (
        <div className="font-[Inter]">
            <Header/>
            <Hero/>
            <Features/>
            <Footer/>
        </div>
    );
}

export default App;