import { zodResolver } from "@hookform/resolvers/zod";
import { TestSignupForm } from "../components/TestSignupForm";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FormField } from "../../../shared/components/FormField";
import { useAuth } from "../hooks/use-auth";
import { authService } from "../services/auth.service";
import { loginSchema, type LoginValues } from "../schemas/auth.schemas";

export function AuthPage({ register: isRegister = false }: { register?: boolean }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const auth = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const reason = new URLSearchParams(location.search).get("error");
  const [error, setError] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    authService
      .googleStatus(controller.signal)
      .then(setGoogleEnabled)
      .catch(() => {
        if (!controller.signal.aborted) setGoogleEnabled(false);
      });
    return () => controller.abort();
  }, []);
  const requested = location.state?.from;
  const destination =
    typeof requested === "string" &&
    requested.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.includes("\\")
      ? requested
      : "/activity";
  const submit = async (values: LoginValues) => {
    try {
      setError("");
      await auth.login(values.email, values.password);
      nav(destination, { replace: true });
    } catch (failure) {
      setError((failure as Error).message);
    }
  };
  const callbackError =
    reason === "existing-account"
      ? "An account already uses this email. Log in below with your existing password."
      : reason === "google-failed"
        ? "Google sign-in was cancelled or could not be completed. Please try again."
        : "";
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="brand-mark">
            <ShoppingBag size={20} strokeWidth={2} />
          </span>
          <span className="auth-brand-name">LetsBuyTogether</span>
        </div>
        <h1 className="auth-title">{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-subtitle">
          {isRegister
            ? "Sign up with your Google account, then complete your profile."
            : "Continue with Google or use your existing account password."}
        </p>
        {(error || callbackError) && (
          <div className="auth-error" role="alert">
            {error || callbackError}
          </div>
        )}
        <button
          type="button"
          className="google-signin"
          disabled={!googleEnabled || auth.loading}
          onClick={() =>
            window.location.assign(`/api/auth/google?returnTo=${encodeURIComponent(destination)}`)
          }
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M43.6 24.5c0-1.5-.1-2.9-.4-4.3H24v8.1h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c4-3.7 6-9.1 6-15.2Z"
            />
            <path
              fill="#34A853"
              d="M24 44c5.4 0 10-1.8 13.3-4.9l-6.7-5.2c-1.8 1.2-4 1.9-6.6 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9V33A20 20 0 0 0 24 44Z"
            />
            <path
              fill="#FBBC05"
              d="M12.8 27.6a12 12 0 0 1 0-7.2V15H5.9a20 20 0 0 0 0 18l6.9-5.4Z"
            />
            <path
              fill="#EA4335"
              d="M24 12.2c2.9 0 5.4 1 7.4 2.9l5.6-5.6A19.2 19.2 0 0 0 24 4 20 20 0 0 0 5.9 15l6.9 5.4c1.6-4.7 6-8.2 11.2-8.2Z"
            />
          </svg>
          {googleEnabled === null ? "Loading…" : "Continue with Google"}
        </button>
        {googleEnabled === false && (
          <p className="auth-setup-message" role="status">
            Google sign-in is not available yet. Please try again later.
          </p>
        )}
        {!isRegister && (
          <form className="auth-form" onSubmit={handleSubmit(submit)}>
            <p className="auth-subtitle">Already have an account with a password?</p>
            <FormField
              label="Email address"
              autoComplete="email"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <FormField
              label="Password"
              autoComplete="current-password"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button type="submit" disabled={isSubmitting || auth.loading} className="auth-submit">
              {isSubmitting ? "Please wait…" : "Log in"}
            </button>
          </form>
        )}
        {isRegister && <TestSignupForm />}
        <p className="auth-switch">
          {isRegister ? "Already a member?" : "New to LetsBuyTogether?"}{" "}
          <Link to={isRegister ? "/login" : "/register"} className="auth-switch-link">
            {isRegister ? "Log in" : "Create a free account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
