import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const Register: React.FC = () => {
  const { register, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect if not authenticated or not staff
  if (!loading && (!user || !user.is_staff)) {
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

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await register({
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim() || undefined,
        first_name: formData.first_name.trim() || undefined,
        last_name: formData.last_name.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error || "Registration failed");
      } else {
        // Show success message and reset form
        setSuccessMessage(`User ${formData.username} registered successfully!`);
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          email: "",
          first_name: "",
          last_name: "",
        });
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);
      }
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
        {/* Sign-in-panel system - same treatment as Login.tsx */}
        <div className="animate-panel-rise relative rounded-xl border-[1.5px] border-ink bg-panel p-8">
          {/* Panel heading */}
          <div className="mb-1 flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-ink">
              HMS
            </span>
            <h1 className="text-xl font-bold text-ink">
              Register New Staff User
            </h1>
          </div>
          <p className="mb-8 border-b border-paper-line pb-6 text-sm text-ink-soft">
            Create a new account for HMS staff members.
          </p>

          {successMessage && (
            <div className="mb-6 rounded-lg border border-verified-green/30 bg-verified-green/5 px-4 py-3 text-sm font-medium text-verified-green-ink">
              {successMessage}
            </div>
          )}

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
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="first_name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
                  >
                    First Name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    className="block w-full border-0 border-b-2 border-paper-line bg-transparent px-0 py-2 text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-50"
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label
                    htmlFor="last_name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
                  >
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    className="block w-full border-0 border-b-2 border-paper-line bg-transparent px-0 py-2 text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-50"
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft"
                >
                  <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Username <span className="text-stamp-red-ink">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="block w-full border-0 border-b-2 border-paper-line bg-transparent px-0 py-2 text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-50"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft"
                >
                  <EnvelopeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full border-0 border-b-2 border-paper-line bg-transparent px-0 py-2 text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-50"
                  placeholder="your.email@example.com"
                  value={formData.email}
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
                  Password <span className="text-stamp-red-ink">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className="block w-full border-0 border-b-2 border-paper-line bg-transparent px-0 py-2 pr-9 text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-50"
                    placeholder="Create a password"
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
                <p className="mt-1.5 text-xs text-ink-soft">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft"
                >
                  <LockClosedIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Confirm Password <span className="text-stamp-red-ink">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className="block w-full border-0 border-b-2 border-paper-line bg-transparent px-0 py-2 pr-9 text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-50"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center text-ink-soft hover:text-ink"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
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
                    aria-label="Creating account"
                  ></span>
                  Creating account&hellip;
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-ink transition-colors hover:text-ink/70"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
