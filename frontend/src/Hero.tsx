export default function Hero() {
    return (
        <section className="bg-sky-100 rounded-b-3xl px-8 py-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
                <p className="text-indigo-700 font-mono text-sm mb-3">A Simple Security Check</p>
                <h1 className="text-5xl font-extrabold leading-tight mb-6">
                    Know before<br />you click.
                </h1>
                <p className="text-gray-700 mb-8 max-w-md">
                    Paste any link and instantly see whether it's flagged by leading
                    threat-intelligence sources — no signup required.
                </p>
                <div className="flex gap-3">
                    <button className="bg-indigo-900 text-white px-6 py-3 rounded-full font-medium">
                        Check a URL
                    </button>
                    <button className="border border-indigo-900 px-6 py-3 rounded-full font-medium">
                        How it works
                    </button>
                </div>
            </div>
            <div className="flex-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-400 mb-2">example.com</p>
                    <div className="h-2 bg-green-200 rounded-full w-2/3 mb-1" />
                    <p className="text-green-700 text-sm font-medium">Clean — no threats detected</p>
                </div>
            </div>
        </section>
    );
}