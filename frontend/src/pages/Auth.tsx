import { forwardRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../contexts/AuthContext";
import { ShoppingBag } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  city: z.string().min(2, "Please enter your city."),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthPage({ register: isRegister = false }: { register?: boolean }) {
  const schema = isRegister ? registerSchema : loginSchema;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(schema as z.ZodType<RegisterValues>) });

  const auth = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");

  const submit = async (v: RegisterValues) => {
    try {
      setError("");
      if (isRegister) {
        await auth.register(v);
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

        <h1 className="auth-title">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="auth-subtitle">
          {isRegister
            ? "Join thousands of Moroccan shoppers saving together."
            : "Continue coordinating your group buys."}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit(submit)}>
          {isRegister && (
            <div className="auth-row-2">
              <Field
                label="First name"
                placeholder="Youssef"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Field
                label="Last name"
                placeholder="El Khalidi"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>
          )}

          {isRegister && (
            <Field
              label="Username"
              placeholder="youssef_k"
              error={errors.username?.message}
              {...register("username")}
            />
          )}

          <Field
            label="Email address"
            type="email"
            placeholder="you@example.ma"
            error={errors.email?.message}
            {...register("email")}
          />

          <Field
            label="Password"
            type="password"
            placeholder={isRegister ? "Minimum 8 characters" : "Your password"}
            error={errors.password?.message}
            {...register("password")}
          />

          {isRegister && (
            <Field
              label="City"
              placeholder="Casablanca"
              error={errors.city?.message}
              {...register("city")}
            />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-submit"
          >
            {isSubmitting
              ? "Please wait…"
              : isRegister
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already a member?" : "New to LetsBuyTogether?"}{" "}
          <Link to={isRegister ? "/login" : "/register"} className="auth-switch-link">
            {isRegister ? "Log in" : "Create a free account"}
          </Link>
        </p>

        {!isRegister && (
          <p className="auth-demo-hint">
            Demo: use any email + password (6+ chars)
          </p>
        )}
      </div>
    </div>
  );
}

const Field = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(function Field({ label, error, ...props }, ref) {
  return (
    <label className="auth-field-wrap">
      <span className="label">{label}</span>
      <input ref={ref} className={`field auth-field ${error ? "field-error" : ""}`} {...props} />
      {error && <span className="auth-field-error">{error}</span>}
    </label>
  );
});
