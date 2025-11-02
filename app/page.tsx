import { DialInterface } from "@/components/dial-interface";
import { CallHistory } from "@/components/call-history";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's call history
  const calls = await prisma.call.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">AMD System</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Answering Machine Detection
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8">
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Intelligent Call Detection
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Test 4 different AMD strategies to detect human vs machine answers with high accuracy
          </p>
        </div>

        {/* Dial Interface */}
        <DialInterface />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Calls",
              value: calls.length,
              color: "blue",
            },
            {
              label: "Human Detected",
              value: calls.filter((c) => c.amdResult === "HUMAN").length,
              color: "green",
            },
            {
              label: "Machine Detected",
              value: calls.filter((c) => c.amdResult === "MACHINE" || c.amdResult === "VOICEMAIL")
                .length,
              color: "red",
            },
            {
              label: "Avg Confidence",
              value: calls.length
                ? `${Math.round(
                    (calls.reduce((sum, c) => sum + (c.confidence || 0), 0) / calls.length) * 100
                  )}%`
                : "N/A",
              color: "purple",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800"
            >
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Call History */}
        <CallHistory calls={calls} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Attack Capital AMD Assignment © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
