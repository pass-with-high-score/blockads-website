"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Bug,
  HelpCircle,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface ReportItem {
  id: string;
  url: string;
  category: string;
  routing_mode: string | null;
  description: string | null;
  contact: string | null;
  screenshot_url?: string | null;
  status: string;
  created_at: string;
}

interface StatsData {
  total: number;
  pending: number;
  resolved: number;
  ignored: number;
}

const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ads_not_blocked: {
    label: "Ads Still Showing",
    icon: ShieldAlert,
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  site_broken: {
    label: "Anti-Adblock / Broken",
    icon: Bug,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  popup_redirect: {
    label: "Pop-ups / Redirects",
    icon: ExternalLink,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  other: {
    label: "Other Issue",
    icon: HelpCircle,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export default function ReportList() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<StatsData>({ total: 0, pending: 0, resolved: 0, ignored: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        status: statusFilter,
      });
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/report?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setReports(data.reports || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, searchQuery]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatDomain = (rawUrl: string) => {
    try {
      const u = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
      return u.hostname;
    } catch {
      return rawUrl;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#00C853] border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Fixed / Resolved
          </span>
        );
      case "ignored":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <XCircle className="w-3.5 h-3.5" />
            Closed / No Issue
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Reports</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-md border border-amber-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-md border border-emerald-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-[#00C853] uppercase tracking-wider">Fixed / Resolved</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{stats.resolved}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Closed / Ignored</div>
          <div className="text-2xl font-bold text-gray-700 mt-1">{stats.ignored}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="inline-flex p-1 bg-gray-100/90 rounded-2xl border border-gray-200/60 self-start sm:self-auto">
          {[
            { id: "all", label: `All (${stats.total})` },
            { id: "pending", label: `Pending (${stats.pending})` },
            { id: "resolved", label: `Resolved (${stats.resolved})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Refresh */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search domain or keyword..."
              className="w-full pl-9 pr-3 py-2 bg-white/90 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 focus:border-[#00E676] transition-all"
            />
          </div>
          <button
            onClick={fetchReports}
            title="Refresh list"
            disabled={isLoading}
            className="p-2 bg-white/90 hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00C853]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#00C853] animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Loading community reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center px-4 space-y-2">
            <SlidersHorizontal className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-base font-semibold text-gray-800">No reports found</h4>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              {searchQuery
                ? `No reports match your search query "${searchQuery}".`
                : "No reports found in this status category."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((report) => {
              const categoryConfig = CATEGORY_MAP[report.category] || CATEGORY_MAP.other;
              const CategoryIcon = categoryConfig.icon;
              const domain = formatDomain(report.url);
              const isExpanded = expandedId === report.id;

              return (
                <div
                  key={report.id}
                  className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Domain & URL */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-700">
                        <Globe className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {domain}
                          </span>
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                            title="Open reported URL in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md">
                          {report.url}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 self-start sm:self-center">
                      {renderStatusBadge(report.status)}
                    </div>
                  </div>

                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {/* Category */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border font-medium ${categoryConfig.color}`}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      {categoryConfig.label}
                    </span>

                    {/* Routing Mode */}
                    {report.routing_mode && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200/60 font-medium">
                        {report.routing_mode}
                      </span>
                    )}

                    {/* Screenshot Proof Button */}
                    {report.screenshot_url && (
                      <button
                        type="button"
                        onClick={() => setSelectedImage(report.screenshot_url || null)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#00C853] border border-emerald-200/80 font-medium transition-colors cursor-pointer"
                        title="View screenshot proof"
                      >
                        <ImageIcon className="w-3 h-3" />
                        Screenshot
                      </button>
                    )}

                    {/* Contact (if user provided) */}
                    {report.contact && (
                      <span className="text-gray-500">
                        By <span className="font-medium text-gray-700">{report.contact}</span>
                      </span>
                    )}

                    {/* Timestamp */}
                    <span className="text-gray-400 ml-auto">
                      {formatDate(report.created_at)}
                    </span>
                  </div>

                  {/* Description Preview / Expand */}
                  {report.description && (
                    <div className="bg-gray-50/80 rounded-xl p-3 text-xs sm:text-sm text-gray-700 leading-relaxed border border-gray-200/50">
                      <div className={isExpanded ? "" : "line-clamp-2"}>
                        {report.description}
                      </div>
                      {report.description.length > 120 && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                          className="mt-1.5 text-xs font-semibold text-[#00C853] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              Show less <ChevronUp className="w-3 h-3 inline" />
                            </>
                          ) : (
                            <>
                              Read full description <ChevronDown className="w-3 h-3 inline" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-4 text-gray-500">
              <div>
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
                </span>
                {" - "}
                <span className="font-semibold text-gray-800">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                of <span className="font-semibold text-gray-800">{totalItems}</span> reports
              </div>

              {/* Rows per page selector */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 outline-none focus:border-[#00E676] cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer text-xs font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#00E676] text-gray-950 font-bold shadow-xs"
                      : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer text-xs font-medium"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screenshot Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl overflow-hidden flex flex-col w-full"
          >
            <div className="flex items-center justify-between pb-3 px-2 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#00C853]" />
                Screenshot Proof
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Open original in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative mt-2 max-h-[75vh] overflow-auto rounded-2xl flex items-center justify-center bg-gray-50 p-2">
              <img
                src={selectedImage}
                alt="Screenshot proof"
                className="w-auto h-auto max-h-[70vh] rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
