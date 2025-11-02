/**
 * Login Page
 * Simple authentication form using Better-Auth
 */

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">AMD System</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to access the dashboard
            </p>
          </div>

          {/* Login Form */}
          <form action="/api/auth/signin" method="POST" className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                defaultValue="test@example.com"
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                defaultValue="password123"
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Sign In
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">
              Test Credentials:
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200">Email: test@example.com</p>
            <p className="text-xs text-blue-800 dark:text-blue-200">Password: password123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">
          Attack Capital AMD Assignment © 2025
        </p>
      </div>
    </div>
  );
}
