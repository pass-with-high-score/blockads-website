"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, Link2, Box, Calendar, Server } from "lucide-react";

interface FilterRecord {
  id: number;
  name: string;
  url: string;
  r2DownloadLink: string;
  ruleCount: number;
  fileSize: number;
  lastUpdated: string;
  createdAt: string;
}

export default function RecentFilters() {
  const [filters, setFilters] = useState<FilterRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchFilters = async () => {
      try {
        const rawBaseUrl = process.env.NEXT_PUBLIC_COMPILER_API_URL || "http://localhost:8080";
        const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
        
        const res = await fetch(`${baseUrl}/api/filters`, {
            // Provide a cache setting if necessary, Next.js handles it well, but standard fetch behavior is fine
        });
        
        const data = await res.json();

        if (!res.ok || data.status === "error") {
          throw new Error(data.message || "Failed to load recent filters.");
        }

        if (mounted) {
          setFilters(data.filters || []);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Could not connect to compiler service.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFilters();

    return () => {
      mounted = false;
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#00E676]" />
        <p className="text-sm">Loading recent builds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
        <Server className="w-8 h-8 mx-auto mb-3 text-gray-400" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (filters.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
        <Box className="w-8 h-8 mx-auto mb-3 text-gray-400" />
        <p className="text-sm font-medium text-gray-600">No cached filters available.</p>
        <p className="text-xs mt-1">Submit a URL above to build the first binary filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filters.map((filter) => (
        <div 
          key={filter.id} 
          className="group p-5 bg-white border border-gray-200 hover:border-[#00E676]/30 hover:shadow-md rounded-2xl transition-all flex flex-col justify-between"
        >
          <div className="mb-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-gray-900 truncate" title={filter.name}>
                {filter.name || "Default Filter"}
              </h3>
              <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                {formatBytes(filter.fileSize)}
              </span>
            </div>
            
            <a 
              href={filter.url}
              target="_blank"
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#00E676] transition-colors truncate max-w-full"
              title={filter.url}
            >
              <Link2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{filter.url}</span>
            </a>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div title="Rule Count">
                <span className="font-semibold text-gray-700">{filter.ruleCount.toLocaleString()}</span> rules
              </div>
              <div className="flex items-center gap-1" title="Last Updated">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(filter.lastUpdated)}</span>
              </div>
            </div>

            <a
              href={filter.r2DownloadLink}
              title="Download Zip"
              className="p-2 bg-gray-50 text-gray-600 hover:bg-[#00E676] hover:text-black rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00E676]"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
