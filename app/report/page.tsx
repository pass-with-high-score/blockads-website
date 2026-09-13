import type { Metadata } from "next";
import ReportForm from "./ReportForm";
import ReportList from "./ReportList";
import { ShieldAlert, Sparkles, CheckCircle2, MessageSquare, ExternalLink, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Report a Website & Status Tracker - BlockAds",
  description:
    "Report unblocked ads or broken websites when using BlockAds, and track the live resolution status of community reports.",
  openGraph: {
    title: "Report an Issue & Track Status - BlockAds",
    description:
      "Help make the web cleaner. Report sites with missed ads or broken pages and track fix status in real-time.",
    url: "https://blockads.pwhs.app/report",
  },
};

export default function ReportPage() {
  return (
    <div className="mesh-bg min-h-screen pt-12 pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 relative">
          {/* Subtle Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#00E676]/20 blur-[90px] rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold uppercase tracking-wider relative z-10">
            <Sparkles className="w-3.5 h-3.5 text-[#00C853]" />
            Community Filter Improvement
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 relative z-10">
            Report a <span className="text-[#00E676]">Website</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Noticed ads slipping through, or a website broken by aggressive filtering? Submit a report below and track its status as our team updates filter rules.
          </p>
        </div>

        {/* Section 1: Submit Form */}
        <div className="relative z-10">
          <ReportForm />
        </div>

        {/* Section 2: Live Status Tracker */}
        <div className="relative z-10 space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-[#00C853]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Community Reports Tracker
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Real-time status of reported websites and filter list fixes.
                </p>
              </div>
            </div>
          </div>

          <ReportList />
        </div>

        {/* Helpful Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 relative z-10">
          <div className="bg-white/70 backdrop-blur-md border border-gray-200/70 p-5 rounded-2xl shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Fast Response</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Reports are instantly forwarded to our Telegram triage bot and database for immediate rule inspection.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-gray-200/70 p-5 rounded-2xl shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Balanced & Safe</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We tune filters carefully to eliminate intrusive ads without breaking legitimate page functionality.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-gray-200/70 p-5 rounded-2xl shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Direct Community</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Have questions or feedback? Join our{" "}
              <a
                href="https://t.me/blockads_android"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00C853] font-medium hover:underline inline-flex items-center gap-0.5"
              >
                Telegram
                <ExternalLink className="w-3 h-3 inline" />
              </a>{" "}
              or Reddit community anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
