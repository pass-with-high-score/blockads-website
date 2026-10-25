import type { Metadata } from "next";
import PreRegisterForm from "./components/PreRegisterForm";
import DesktopPreview from "./components/DesktopPreview";
import {
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  BatteryCharging,
  Laptop,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pre-Register for BlockAds Desktop (macOS & Windows) | Free System-Wide Ad Blocker",
  description:
    "Join the early access waitlist for BlockAds on macOS and Windows. Experience high-performance, system-wide ad and tracker blocking with zero telemetry and native speed.",
  openGraph: {
    title: "BlockAds for macOS & Windows — Pre-Register for Early Beta Access",
    description:
      "Block ads across Safari, Chrome, Edge, and desktop apps with our lightweight native engine. Zero telemetry. 100% open-source.",
    url: "https://blockads.pwhs.app/pre-register",
    siteName: "BlockAds",
  },
};

export default function PreRegisterPage() {
  return (
    <div id="top" className="min-h-screen">
      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="mesh-bg relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Decorative pulse ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-[450px] md:w-[700px] h-[450px] md:h-[700px] rounded-full border border-[#00E676]/10 pulse-ring" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-xs sm:text-sm font-semibold text-emerald-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span>Coming to macOS & Windows</span>
            <span className="text-gray-400">•</span>
            <span className="text-[#00A854]">Early Access Waitlist</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Block Ads Everywhere.
            <br />
            <span className="text-[#00E676] drop-shadow-sm">On Your Mac & PC.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The blazing-fast, privacy-first ad blocker is expanding to desktop. Block ads across browsers and native apps with near-zero CPU and battery consumption.
          </p>

          {/* Form Card */}
          <div className="max-w-xl mx-auto">
            <PreRegisterForm />
          </div>
        </div>
      </section>

      {/* ── Interactive App Preview ───────────────────────── */}
      <section className="py-12 px-4 sm:px-6 bg-gray-50/50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Engineered for Native Desktop Speed
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xl mx-auto">
            Lightweight menu bar and tray companion powered by a Go core engine. No clunky electron shells.
          </p>
        </div>
        <DesktopPreview />
      </section>

      {/* ── Key Advantages Grid ───────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Why BlockAds on Desktop?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mt-3">
              Browser extensions only block ads inside one browser. BlockAds shields your entire operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00E676] flex items-center justify-center mb-6">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">System-Wide Protection</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Filter ads and telemetry across Safari, Chrome, Edge, Arc, Brave, as well as native desktop apps like Spotify, Slack, and Discord.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Blazing Fast Go Core</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Utilizes memory-mapped Bloom filters and Double-Array Tries. Domain lookups complete in under 0.3 milliseconds with minimal RAM overhead.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dual L4 & L7 Routing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Combines high-speed DNS interception with a lightweight local PAC HTTP proxy to catch tricky tracking scripts without breaking HTTPS.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Zero Telemetry & Private</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                All filtering decisions happen 100% locally on your device. We never inspect your private browsing data or upload your DNS queries.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Laptop Battery Friendly</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Engineered with strict power-efficiency budgets. Idle CPU is practically 0%, so your MacBook or Windows laptop stays cool and lasts longer.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Custom Filter Lists</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Full compatibility with AdGuard, uBlock Origin, and EasyList rules, plus one-click custom whitelist and blacklist management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ───────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Everything you need to know about the BlockAds desktop release.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-gray-200">
              <h4 className="font-bold text-gray-900 text-base mb-2">
                Will BlockAds for macOS and Windows be free and open-source?
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Yes! BlockAds is committed to open-source software and digital privacy. The desktop clients and Go core engine will be publicly available on GitHub under an open-source license.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200">
              <h4 className="font-bold text-gray-900 text-base mb-2">
                When will the early beta be released?
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                We are currently rolling out closed alpha builds for macOS (Apple Silicon & Intel) followed by the Windows preview build. Registered early birds will be invited in batches to try the first test builds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200">
              <h4 className="font-bold text-gray-900 text-base mb-2">
                Do I need to install custom root SSL certificates?
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                No. BlockAds uses DNS (L4) and PAC Proxy filtering that does not tamper with or MITM your HTTPS certificates, keeping your banking and encrypted connections 100% secure.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200">
              <h4 className="font-bold text-gray-900 text-base mb-2">
                Can I use BlockAds alongside my VPN?
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Yes. Because BlockAds runs a lightweight local proxy and upstream DNS forwarder, it can easily co-exist with most WireGuard, OpenVPN, and corporate VPN profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Call To Action ─────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Be the first to experience <span className="text-[#00E676]">BlockAds Desktop</span>.
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8">
              Join hundreds of developers and privacy enthusiasts who are tired of bloated ad blockers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#top"
                className="w-full sm:w-auto px-8 py-4 bg-[#00E676] hover:bg-[#00C853] text-gray-950 font-bold rounded-2xl text-base transition-all shadow-lg shadow-[#00E676]/20 cursor-pointer"
              >
                Claim Your Early Access Spot
              </a>
              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-4 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-medium rounded-2xl text-base transition-all"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
