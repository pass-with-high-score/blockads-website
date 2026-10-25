import type { Metadata } from "next";
import PreRegisterForm from "./components/PreRegisterForm";

export const metadata: Metadata = {
  title: "Pre-Register for BlockAds Desktop (macOS & Windows)",
  description:
    "Pre-register for BlockAds on macOS and Windows. Be the first to get access when desktop versions are available.",
  openGraph: {
    title: "BlockAds for macOS & Windows — Pre-Register",
    description: "Pre-register for BlockAds on macOS and Windows.",
    url: "https://blockads.pwhs.app/pre-register",
    siteName: "BlockAds",
  },
};

export default function PreRegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-xs font-semibold text-emerald-800 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
            <span>macOS & Windows</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
            Block<span className="text-[#00E676]">Ads</span> Desktop
          </h1>

          <p className="text-sm sm:text-base text-gray-600">
            Pre-register to get early access when the desktop version is ready.
          </p>
        </div>

        <PreRegisterForm />
      </div>
    </div>
  );
}
