import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../../shared/components/FormField";
import { useAuth } from "../hooks/use-auth";

import { loginSchema, registerSchema, type AuthValues } from "../schemas/auth.schemas";

export function AuthPage({ register: isRegister = false }: { register?: boolean }) {
  const schema = isRegister ? registerSchema : loginSchema;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthValues>({ resolver: zodResolver(schema) });

  const auth = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");

  const submit = async (v: AuthValues) => {
    try {
      setError("");
      if (isRegister) {
        await auth.register(registerSchema.parse(v));
      } else {
        await auth.login(v.email, v.password);
      }
      nav("/search");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="brand-mark">
            <ShoppingBag size={20} strokeWidth={2} />
          </span>
          <span className="auth-brand-name">LetsBuyTogether</span>
        </div>

        <h1 className="auth-title">{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-subtitle">
          {isRegister
            ? "Join thousands of Moroccan shoppers saving together."
            : "Continue coordinating your group buys."}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit(submit)}>
          {isRegister && (
            <div className="auth-row-2">
              <FormField
                label="First name"
                placeholder="Youssef"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <FormField
                label="Last name"
                placeholder="El Khalidi"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>
          )}

          {isRegister && (
            <FormField
              label="Username"
              placeholder="youssef_k"
              error={errors.username?.message}
              {...register("username")}
            />
          )}

          <FormField
            label="Email address"
            type="email"
            placeholder="you@example.ma"
            error={errors.email?.message}
            {...register("email")}
          />

          <FormField
            label="Password"
            type="password"
            placeholder={isRegister ? "Minimum 8 characters" : "Your password"}
            error={errors.password?.message}
            {...register("password")}
          />

          {isRegister && (
            <FormField
              label="City"
              placeholder="Casablanca"
              error={errors.city?.message}
              {...register("city")}
            />
          )}

          <button type="submit" disabled={isSubmitting} className="auth-submit">
            {isSubmitting ? "Please wait…" : isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already a member?" : "New to LetsBuyTogether?"}{" "}
          <Link to={isRegister ? "/login" : "/register"} className="auth-switch-link">
            {isRegister ? "Log in" : "Create a free account"}
          </Link>
        </p>

        {!isRegister && <p className="auth-demo-hint">Demo: use any email + password (6+ chars)</p>}
      </div>
    </div>
  );
}
