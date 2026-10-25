"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";

export default function PreRegisterForm() {
  const [email, setEmail] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["macos", "windows"]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ isNew: boolean; message: string }>({
    isNew: true,
    message: "",
  });

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((p) => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (platforms.length === 0) {
      setErrorMessage("Please select at least one platform.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pre-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          platforms,
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccessInfo({
        isNew: data.isNew ?? true,
        message: data.message,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit. Please check your internet connection.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#00E676]/30 shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-[#00E676]/10 text-[#00E676] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {successInfo.isNew ? "You're on the early access list!" : "Your preferences are updated!"}
        </h3>
        <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto mb-6 leading-relaxed">
          {successInfo.message || "Thank you for supporting BlockAds. You'll receive priority invitation to early beta builds before public launch."}
        </p>

        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm text-gray-700 font-medium mb-6">
          <span>Registered email:</span>
          <span className="font-semibold text-gray-900">{email}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://t.me/blockads_android"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-[#00E676] text-gray-950 font-semibold rounded-xl text-sm hover:bg-[#00C853] transition-all flex items-center justify-center gap-2"
          >
            Join Telegram Community
          </a>
          <button
            onClick={() => {
              setSubmitted(false);
              setEmail("");
            }}
            className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Register another email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200 shadow-xl relative">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            1. Select your target platform(s):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* macOS Option */}
            <button
              type="button"
              onClick={() => togglePlatform("macos")}
              className={`p-4 rounded-2xl border text-left transition-all relative flex items-start gap-3 cursor-pointer ${
                platforms.includes("macos")
                  ? "border-[#00E676] bg-[#00E676]/5 shadow-sm ring-1 ring-[#00E676]"
                  : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  platforms.includes("macos")
                    ? "bg-[#00E676] text-gray-950"
                    : "border border-gray-300 bg-white"
                }`}
              >
                {platforms.includes("macos") && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 170 170" fill="currentColor">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.74-11.22-21.2-14.75-34.37-3.53-13.17-5.3-25.12-5.3-35.84 0-14.38 3.59-26.27 10.77-35.67 7.18-9.4 16.2-14.2 27.06-14.42 4.9.11 10.37 1.34 16.42 3.69 6.04 2.35 10.1 3.59 12.18 3.69 1.74 0 5.86-1.28 12.38-3.83 6.52-2.55 12.22-3.75 17.1-3.59 13.06.65 23.36 5.38 30.9 14.19-11.53 6.96-17.18 16.64-16.96 29.04.22 9.79 3.97 18.06 11.26 24.81 7.29 6.75 16.05 10.66 26.27 11.75-2.18 6.53-4.95 13.38-8.32 20.55zM119.22 32.55c0-7.29 2.61-14.03 7.83-20.22 5.22-6.19 11.69-10.39 19.41-12.6-1.09 7.07-3.75 13.6-7.98 19.6-4.23 6-10.49 10.34-18.78 13.02-.16-.6-.48-1.55-.48-2.8z" />
                  </svg>
                  macOS
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Apple Silicon (M1–M4) & Intel
                </div>
              </div>
            </button>

            {/* Windows Option */}
            <button
              type="button"
              onClick={() => togglePlatform("windows")}
              className={`p-4 rounded-2xl border text-left transition-all relative flex items-start gap-3 cursor-pointer ${
                platforms.includes("windows")
                  ? "border-[#00E676] bg-[#00E676]/5 shadow-sm ring-1 ring-[#00E676]"
                  : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  platforms.includes("windows")
                    ? "bg-[#00E676] text-gray-950"
                    : "border border-gray-300 bg-white"
                }`}
              >
                {platforms.includes("windows") && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 88 88" fill="currentColor">
                    <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.016 45.728zm4.326-39.027L87.914 0v41.527l-47.918.375zm47.918 47.034L40.024 88l-.028-34.587 47.918.29z" />
                  </svg>
                  Windows
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Windows 10 / 11 (x64 & ARM64)
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            2. Enter your email for early invitation:
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E676] focus:border-transparent text-gray-900 placeholder-gray-400 text-base transition-all bg-gray-50/30"
            />
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-[#00E676] hover:bg-[#00C853] text-gray-950 font-bold text-base transition-all shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Securing your spot...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Pre-Register for Desktop Beta
            </>
          )}
        </button>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-[#00E676]" />
          <span>Zero spam. 100% open-source. Unsubscribe at any time.</span>
        </div>
      </form>
    </div>
  );
}
