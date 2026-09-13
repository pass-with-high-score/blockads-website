"use client";

import { useState, useRef, useEffect } from "react";
import {
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Bug,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Shield,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";

interface CategoryOption {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: "ads_not_blocked",
    label: "Ads Still Showing",
    subLabel: "Banners, video ads, or sponsored sections not blocked",
    icon: ShieldAlert,
  },
  {
    id: "site_broken",
    label: "Broken Page / Anti-Adblock",
    subLabel: "Anti-adblock wall or broken layout/video player",
    icon: Bug,
  },
  {
    id: "popup_redirect",
    label: "Pop-ups / Redirects",
    subLabel: "Unwanted pop-up tabs or automatic page redirects",
    icon: ExternalLink,
  },
  {
    id: "other",
    label: "Other Issue",
    subLabel: "General rule questions or other filtering issues",
    icon: HelpCircle,
  },
];

const ROUTING_MODES = [
  { id: "Local VPN", label: "Local VPN (No Root)" },
  { id: "Root Proxy", label: "Root Proxy (iptables)" },
  { id: "Private DNS / DoH", label: "Private DNS / DoH" },
  { id: "Web Browser / Other", label: "Web Browser / Other" },
];

export default function ReportForm() {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("ads_not_blocked");
  const [routingMode, setRoutingMode] = useState("Local VPN");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle image file selection
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Image size must be under 8MB.");
      return;
    }

    setErrorMsg(null);
    setScreenshotFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveScreenshot = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setScreenshotFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Support paste from clipboard (Ctrl+V / Cmd+V anywhere in form)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();
            if (file) {
              handleFileChange(file);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setErrorMsg("Please enter the website URL to report.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("url", cleanUrl);
      formData.append("category", category);
      formData.append("routingMode", routingMode);
      formData.append("description", description);
      formData.append("contact", contact);
      formData.append("honeypot", honeypot);

      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const res = await fetch("/api/report", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit report. Please try again!");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setCategory("ads_not_blocked");
    setRoutingMode("Local VPN");
    setDescription("");
    setContact("");
    handleRemoveScreenshot();
    setErrorMsg(null);
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="bg-white/90 backdrop-blur-xl border border-emerald-200/80 rounded-3xl p-8 sm:p-12 text-center shadow-lg transition-all animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 text-[#00C853] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Report Submitted Successfully!
        </h3>
        <p className="text-gray-600 max-w-lg mx-auto text-base sm:text-lg mb-8 leading-relaxed">
          Thank you for your feedback. Your report and screenshot have been dispatched to our team via Telegram and saved to Cloudflare R2 & Supabase.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleReset}
            type="button"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Report Another Website
          </button>
          <a
            href="https://t.me/blockads_android"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 hover:border-gray-400 bg-white text-gray-800 font-medium transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            Join Telegram Community
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8"
    >
      {/* Honeypot field for bot prevention */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Website URL Input */}
      <div>
        <label
          htmlFor="website-url"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Website URL <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-2xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Globe className="w-5 h-5" />
          </div>
          <input
            id="website-url"
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. example.com or https://news.example.com/article"
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-gray-900 rounded-2xl border border-gray-200 focus:border-[#00E676] focus:ring-4 focus:ring-[#00E676]/15 outline-none transition-all text-base placeholder:text-gray-400"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Enter the exact domain or webpage where ads or broken elements were spotted.
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          What issue are you experiencing? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((item) => {
            const Icon = item.icon;
            const isSelected = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#00E676]/10 border-[#00C853] ring-2 ring-[#00E676]/20 shadow-xs"
                    : "bg-white hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#00E676] text-gray-950 font-bold"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div
                    className={`text-sm font-semibold ${
                      isSelected ? "text-gray-900" : "text-gray-800"
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {item.subLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Routing Mode */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          BlockAds Routing Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ROUTING_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setRoutingMode(mode.id)}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all cursor-pointer ${
                routingMode === mode.id
                  ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screenshot Upload Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Screenshot Proof <span className="text-gray-400 font-normal">(Optional, max 8MB)</span>
        </label>

        {previewUrl ? (
          <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-2 sm:p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                <Image
                  src={previewUrl}
                  alt="Screenshot preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {screenshotFile?.name || "screenshot.png"}
                </div>
                <div className="text-xs text-gray-500">
                  {screenshotFile ? `${(screenshotFile.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveScreenshot}
              className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors shrink-0 cursor-pointer"
              title="Remove screenshot"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-[#00E676] bg-[#00E676]/10"
                : "border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-800">
                Click to browse, drag & drop, or paste (<kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Ctrl+V</kbd>) screenshot
              </div>
              <p className="text-xs text-gray-400">
                Supports PNG, JPG, or WebP up to 8MB. Uploaded securely to Cloudflare R2.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Detailed Description <span className="text-gray-400 font-normal">(Recommended)</span>
        </label>
        <div className="relative">
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Floating banner ad remains on the bottom-right corner, or video fails to load unless BlockAds is paused..."
            className="w-full p-4 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-gray-900 rounded-2xl border border-gray-200 focus:border-[#00E676] focus:ring-4 focus:ring-[#00E676]/15 outline-none transition-all text-sm placeholder:text-gray-400 resize-y"
          />
        </div>
      </div>

      {/* Contact info */}
      <div>
        <label
          htmlFor="contact"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Contact Information <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <div className="relative rounded-2xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <input
            id="contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or Telegram (@username) to receive updates when fixed"
            className="w-full pl-11 pr-4 py-3 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-gray-900 rounded-2xl border border-gray-200 focus:border-[#00E676] focus:ring-4 focus:ring-[#00E676]/15 outline-none transition-all text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-2xl bg-[#00E676] hover:bg-[#00C853] text-gray-950 font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Uploading & submitting report...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Submit Report</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
        <Shield className="w-4 h-4 text-emerald-600" />
        <span>Reports are forwarded instantly to our Telegram admin bot for review.</span>
      </div>
    </form>
  );
}
