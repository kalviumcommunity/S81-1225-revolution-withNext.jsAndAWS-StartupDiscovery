"use client";

import { useAuth, useUI } from "@/hooks";
import { Button, Card, Input } from "@/components";
import { useState } from "react";

/**
 * State Management Demo Page
 *
 * Demonstrates:
 * - Authentication context usage
 * - UI state management
 * - Custom hooks for encapsulation
 * - State transitions with logging
 */
export default function StateManagementPage() {
  const {
    isAuthenticated,
    user,
    email,
    isLoading,
    error,
    login,
    logout,
    clearError,
  } = useAuth();
  const {
    theme,
    sidebarOpen,
    showNotifications,
    toggleTheme,
    toggleSidebar,
    toggleNotifications,
  } = useUI();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginUser, setLoginUser] = useState("");

  const handleLogin = () => {
    login(loginUser, loginEmail);
    setLoginUser("");
    setLoginEmail("");
  };

  const bgColor =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black";
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-gray-50";

  return (
    <div className={`min-h-screen p-6 ${bgColor}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            State Management with Context & Hooks
          </h1>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Global state management using React Context API and custom hooks
          </p>
        </div>

        {/* Theme & UI Settings */}
        <Card
          title="🎨 UI Settings"
          description="Manage theme, sidebar, and notifications"
          variant={theme === "dark" ? "elevated" : "default"}
        >
          <div className={`space-y-4 p-4 ${cardBg} rounded-lg`}>
            {/* Theme Section */}
            <div>
              <h3 className="font-semibold mb-2">Theme</h3>
              <div className="flex items-center gap-4">
                <span>
                  Current: {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
                </span>
                <Button
                  label={`Switch to ${theme === "dark" ? "Light" : "Dark"}`}
                  variant="primary"
                  size="sm"
                  onClick={toggleTheme}
                />
              </div>
            </div>

            {/* Sidebar Section */}
            <div>
              <h3 className="font-semibold mb-2">Sidebar</h3>
              <div className="flex items-center gap-4">
                <span>{sidebarOpen ? "📂 Open" : "📂 Closed"}</span>
                <Button
                  label={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                  variant="secondary"
                  size="sm"
                  onClick={toggleSidebar}
                />
              </div>
            </div>

            {/* Notifications Section */}
            <div>
              <h3 className="font-semibold mb-2">Notifications</h3>
              <div className="flex items-center gap-4">
                <span>{showNotifications ? "🔔 Enabled" : "🔕 Disabled"}</span>
                <Button
                  label={showNotifications ? "Disable" : "Enable"}
                  variant="success"
                  size="sm"
                  onClick={toggleNotifications}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Authentication Section */}
        <Card
          title="🔐 Authentication"
          description="Login/logout with global auth context"
          variant={theme === "dark" ? "elevated" : "default"}
        >
          <div className={`space-y-4 p-4 ${cardBg} rounded-lg`}>
            {isAuthenticated ? (
              <div className="space-y-4">
                {/* User Info */}
                <div
                  className={`p-4 rounded border-2 ${
                    theme === "dark"
                      ? "border-green-500 bg-green-900/20"
                      : "border-green-400 bg-green-50"
                  }`}
                >
                  <h3 className="font-semibold mb-2">✅ Logged In</h3>
                  <p>
                    <strong>User:</strong> {user}
                  </p>
                  <p>
                    <strong>Email:</strong> {email}
                  </p>
                </div>

                {/* Logout Button */}
                <Button
                  label="Logout"
                  variant="danger"
                  onClick={logout}
                  fullWidth
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div
                    className={`p-3 rounded border-2 ${
                      theme === "dark"
                        ? "border-red-500 bg-red-900/20"
                        : "border-red-400 bg-red-50"
                    }`}
                  >
                    <p className="text-sm">{error}</p>
                    <Button
                      label="Dismiss"
                      variant="neutral"
                      size="sm"
                      onClick={clearError}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Login Form */}
                <Input
                  label="Username"
                  placeholder="Enter username"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />

                {/* Login Button */}
                <Button
                  label={isLoading ? "Logging in..." : "Login"}
                  variant="primary"
                  isLoading={isLoading}
                  disabled={isLoading || !loginUser || !loginEmail}
                  onClick={handleLogin}
                  fullWidth
                />
              </div>
            )}
          </div>
        </Card>

        {/* State Summary */}
        <Card
          title="📊 State Summary"
          description="Overview of all global state"
          variant="outlined"
        >
          <div className={`p-4 rounded font-mono text-sm ${cardBg} space-y-2`}>
            <div>
              <span className="text-blue-500">auth.isAuthenticated:</span>{" "}
              <span>{isAuthenticated ? "true" : "false"}</span>
            </div>
            <div>
              <span className="text-blue-500">auth.user:</span>{" "}
              <span>{user || "null"}</span>
            </div>
            <div>
              <span className="text-blue-500">auth.isLoading:</span>{" "}
              <span>{isLoading ? "true" : "false"}</span>
            </div>
            <div>
              <span className="text-green-500">ui.theme:</span>{" "}
              <span>&quot;{theme}&quot;</span>
            </div>
            <div>
              <span className="text-green-500">ui.sidebarOpen:</span>{" "}
              <span>{sidebarOpen ? "true" : "false"}</span>
            </div>
            <div>
              <span className="text-green-500">ui.showNotifications:</span>{" "}
              <span>{showNotifications ? "true" : "false"}</span>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card title="📋 Instructions" variant="default">
          <div className={`space-y-2 text-sm p-4 ${cardBg} rounded`}>
            <p>
              <strong>1. Authentication:</strong> Fill in the username and email
              fields, then click Login to test the AuthContext.
            </p>
            <p>
              <strong>2. Theme Toggle:</strong> Click the theme button to switch
              between light and dark modes.
            </p>
            <p>
              <strong>3. UI Controls:</strong> Toggle sidebar and notifications
              to see UI state changes in real-time.
            </p>
            <p>
              <strong>4. Console Logs:</strong> Open browser console to see
              state transition messages.
            </p>
            <p>
              <strong>5. State Summary:</strong> Watch the state summary update
              as you interact with the controls.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
