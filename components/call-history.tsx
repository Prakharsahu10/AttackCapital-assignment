/**
 * Call History Component
 * Displays paginated table of past calls with filtering
 */

"use client";

import { useState } from "react";
import { CallRecord, AMDStrategy, AMDResult, CallStatus } from "@/types";

interface CallHistoryProps {
  calls: CallRecord[];
  onRefresh?: () => void;
}

export function CallHistory({ calls, onRefresh }: CallHistoryProps) {
  const [filterStrategy, setFilterStrategy] = useState<AMDStrategy | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CallStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter calls
  const filteredCalls = calls.filter((call) => {
    const matchesStrategy = filterStrategy === "all" || call.amdStrategy === filterStrategy;
    const matchesStatus = filterStatus === "all" || call.callStatus === filterStatus;
    return matchesStrategy && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCalls = filteredCalls.slice(startIndex, startIndex + itemsPerPage);

  // Format helpers
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Status badges
  const getStatusBadge = (status: CallStatus) => {
    const styles: Record<CallStatus, string> = {
      COMPLETED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
      IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      BUSY: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
      NO_ANSWER: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200",
      INITIATED: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
      RINGING: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      CANCELED: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const getAMDResultBadge = (result: AMDResult | null) => {
    if (!result) return <span className="text-zinc-400">-</span>;

    const styles: Record<AMDResult, string> = {
      HUMAN: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
      MACHINE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
      VOICEMAIL: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
      FAX: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
      UNKNOWN: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[result]}`}>
        {result}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ["Date", "Phone", "Strategy", "AMD Result", "Status", "Duration", "Confidence"];
    const rows = filteredCalls.map((call) => [
      formatDate(call.createdAt),
      call.phoneNumber,
      call.amdStrategy,
      call.amdResult || "N/A",
      call.callStatus,
      call.duration.toString(),
      call.confidence?.toFixed(2) || "N/A",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Call History</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {filteredCalls.length} call{filteredCalls.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            AMD Strategy
          </label>
          <select
            value={filterStrategy}
            onChange={(e) => {
              setFilterStrategy(e.target.value as AMDStrategy | "all");
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All Strategies</option>
            <option value="TWILIO_NATIVE">Twilio Native</option>
            <option value="JAMBONZ">Jambonz</option>
            <option value="HUGGINGFACE">Hugging Face</option>
            <option value="GEMINI_FLASH">Gemini Flash</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Call Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as CallStatus | "all");
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BUSY">Busy</option>
            <option value="NO_ANSWER">No Answer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                Phone Number
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                Strategy
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                AMD Result
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                Duration
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedCalls.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No calls found
                </td>
              </tr>
            ) : (
              paginatedCalls.map((call) => (
                <tr
                  key={call.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {formatDate(call.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-900 dark:text-zinc-100">
                    {formatPhoneNumber(call.phoneNumber)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {call.amdStrategy.replace("-", " ")}
                  </td>
                  <td className="px-4 py-3">{getAMDResultBadge(call.amdResult)}</td>
                  <td className="px-4 py-3">{getStatusBadge(call.callStatus)}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {formatDuration(call.duration)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {call.confidence ? `${(call.confidence * 100).toFixed(0)}%` : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
