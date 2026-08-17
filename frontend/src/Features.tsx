const features = [
    { title: "Real-Time Checks", desc: "Every lookup queries live threat-intelligence sources, not a stale local list." },
    { title: "Multiple Sources", desc: "Cross-references Google Safe Browsing and VirusTotal for a fuller picture." },
    { title: "Fast Results", desc: "Cached lookups return instantly; new URLs are checked in seconds." },
    { title: "No Signup Needed", desc: "Paste a link and get an answer — no account required to start." },
];

export default function Features() {
    return (
        <section className="px-8 py-16">
            <p className="text-indigo-700 font-mono text-sm mb-2">Why It Works</p>
            <h2 className="text-4xl font-extrabold mb-12 max-w-lg">
                More than a blocklist lookup.
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
                {features.map((f) => (
                    <div key={f.title}>
                        <div className="w-14 h-14 bg-indigo-50 rounded-full mb-4" />
                        <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                        <p className="text-gray-600">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}