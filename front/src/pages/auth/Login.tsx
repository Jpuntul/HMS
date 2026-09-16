import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const Login: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await login(formData.username, formData.password);

      if (!result.success) {
        setError(result.error || "Login failed");
      }
      // If successful, user will be redirected by the Navigate component above
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
          role="status"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        {/* Sign-in panel: bordered like a badge card, but the punch-hole
            notch is reserved for actual badge objects - a full-width form
            panel stays a clean bordered rectangle. */}
        <div className="animate-panel-rise relative rounded-xl border-[1.5px] border-ink bg-panel p-8">
          {/* Panel heading */}
          <div className="mb-1 flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-ink">
              HMS
            </span>
            <h1 className="text-xl font-bold text-ink">Sign In</h1>
          </div>
          <p className="mb-8 border-b border-paper-line pb-6 text-sm text-ink-soft">
            Sign in to access the Healthcare Management System.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-stamp-red/30 bg-stamp-red/5 px-4 py-3 text-sm font-medium text-stamp-red-ink"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft"
                >
                  <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Employee ID / Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="block w-full border-0 border-b-2 border-paper-line bg-transparent px-0 py-2 text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-50"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft"
                >
                  <LockClosedIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="block w-full border-0 border-b-2 border-paper-line bg-transparent px-0 py-2 pr-9 text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-50"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center text-ink-soft hover:text-ink"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition-all duration-200 hover:bg-ink/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper"
                    role="status"
                    aria-label="Signing in"
                  ></span>
                  Signing in&hellip;
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-paper-line px-4 py-3 text-xs text-ink-soft">
          <span className="font-semibold uppercase tracking-wide text-ink">
            Demo credentials —{" "}
          </span>
          username <code className="font-semibold text-ink">admin</code>,
          password <code className="font-semibold text-ink">admin123</code>
        </div>
      </div>
    </div>
  );
};

export default Login;
