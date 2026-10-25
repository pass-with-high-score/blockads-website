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
            Select platform:
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
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.1.65-2.76 1.43-.59.68-1.11 1.76-.97 2.8 1.07.08 2.11-.61 2.72-1.36z" />
                  </svg>
                  macOS
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Apple Silicon & Intel
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
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 0h11v11H0V0zm13 0h11v11H13V0zM0 13h11v11H0V13zm13 0h11v11H13V13z" />
                  </svg>
                  Windows
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Windows 10 / 11
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            Email address:
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
              Submitting...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Pre-Register
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
