"use client";

import { useState } from "react";
import { ShieldCheck, Zap, Cpu, Layers } from "lucide-react";

export default function DesktopPreview() {
  const [activeTab, setActiveTab] = useState<"macos" | "windows">("macos");

  return (
    <div className="w-full max-w-4xl mx-auto my-12">
      {/* Switcher pills */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          <button
            onClick={() => setActiveTab("macos")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "macos"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 170 170" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.74-11.22-21.2-14.75-34.37-3.53-13.17-5.3-25.12-5.3-35.84 0-14.38 3.59-26.27 10.77-35.67 7.18-9.4 16.2-14.2 27.06-14.42 4.9.11 10.37 1.34 16.42 3.69 6.04 2.35 10.1 3.59 12.18 3.69 1.74 0 5.86-1.28 12.38-3.83 6.52-2.55 12.22-3.75 17.1-3.59 13.06.65 23.36 5.38 30.9 14.19-11.53 6.96-17.18 16.64-16.96 29.04.22 9.79 3.97 18.06 11.26 24.81 7.29 6.75 16.05 10.66 26.27 11.75-2.18 6.53-4.95 13.38-8.32 20.55zM119.22 32.55c0-7.29 2.61-14.03 7.83-20.22 5.22-6.19 11.69-10.39 19.41-12.6-1.09 7.07-3.75 13.6-7.98 19.6-4.23 6-10.49 10.34-18.78 13.02-.16-.6-.48-1.55-.48-2.8z" />
            </svg>
            macOS Menu Bar App
          </button>
          <button
            onClick={() => setActiveTab("windows")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "windows"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 88 88" fill="currentColor">
              <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.016 45.728zm4.326-39.027L87.914 0v41.527l-47.918.375zm47.918 47.034L40.024 88l-.028-34.587 47.918.29z" />
            </svg>
            Windows System Tray
          </button>
        </div>
      </div>

      {/* Simulated Desktop Window */}
      <div className="rounded-3xl border border-gray-200/80 bg-white/95 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300">
        {/* Window Titlebar */}
        <div className="h-11 bg-gray-100/80 border-b border-gray-200/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab === "macos" ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <svg className="w-3 h-3" viewBox="0 0 88 88" fill="currentColor">
                  <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.016 45.728zm4.326-39.027L87.914 0v41.527l-47.918.375zm47.918 47.034L40.024 88l-.028-34.587 47.918.29z" />
                </svg>
                BlockAds for Windows
              </div>
            )}
          </div>
          <div className="text-xs font-semibold text-gray-500">
            {activeTab === "macos" ? "BlockAds — Menu Bar Companion" : "BlockAds — System Tray Panel"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span>Go Core v1.0</span>
          </div>
        </div>

        {/* Window Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Main Shield Status Header */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-[#00E676]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00E676] text-gray-950 flex items-center justify-center font-bold shadow-md shadow-[#00E676]/20">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-gray-900">System Protection Active</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00E676]/20 text-[#00A854]">
                    L4 + L7 Interception
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Filtering Safari, Chrome, Edge, Slack, Discord & background system traffic.
                </p>
              </div>
            </div>

            {/* Toggle switch mockup */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-medium text-gray-600">Enabled</span>
              <div className="w-12 h-6 bg-[#00E676] rounded-full p-0.5 flex items-center justify-end shadow-inner cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-gray-900">142,850</div>
              <div className="text-[11px] font-medium text-gray-500 mt-0.5">Rules in Memory</div>
            </div>
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-[#00C853]">3,412</div>
              <div className="text-[11px] font-medium text-gray-500 mt-0.5">Ads Blocked Today</div>
            </div>
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-gray-900">&lt; 0.3 ms</div>
              <div className="text-[11px] font-medium text-gray-500 mt-0.5">Average Lookup</div>
            </div>
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-gray-900">18 MB</div>
              <div className="text-[11px] font-medium text-gray-500 mt-0.5">Engine RAM Usage</div>
            </div>
          </div>

          {/* Technical Architecture Badge Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/60 border border-gray-200/60">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Zero Lag:</strong> mmap bloom filter + DAT Trie lookup
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/60 border border-gray-200/60">
              <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                <strong>Dual Mode:</strong> Local PAC proxy + DNS-over-HTTPS
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/60 border border-gray-200/60">
              <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Native:</strong> {activeTab === "macos" ? "SwiftUI + AppKit Native" : "WinUI 3 & Tray Runner"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
