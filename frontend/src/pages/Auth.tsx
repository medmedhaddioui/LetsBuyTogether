import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { forwardRef, useState } from "react";
import { ErrorBox } from "../components/ui";
const loginS = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const regS = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  city: z.string().min(2),
});
type V = z.infer<typeof regS>;
export function AuthPage({ register = false }: { register?: boolean }) {
  const schema = register ? regS : loginS;
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<V>({ resolver: zodResolver(schema) });
  const auth = useAuth(),
    nav = useNavigate();
  const [params] = useSearchParams();
  const next =
    params.get("next") === "/create-promotion"
      ? "/create-promotion"
      : "/dashboard";
  const suffix = next === "/create-promotion" ? "?next=/create-promotion" : "";
  const [error, setError] = useState("");
  const submit = async (v: V) => {
    try {
      setError("");
      if (register) await auth.register(v);
      else await auth.login(v.email, v.password);
      nav(next);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-lg p-7 sm:p-10">
        <h1 className="text-3xl">
          {register ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-slate-500">
          {register
            ? next === "/create-promotion"
              ? "Create a free account, then post your product to find a buying partner."
              : "Join Moroccan shoppers saving together."
            : "Continue coordinating your group buys."}
        </p>
        {error && (
          <div className="mt-5">
            <ErrorBox message={error} />
          </div>
        )}
        <form className="mt-7 grid gap-5" onSubmit={handleSubmit(submit)}>
          {register && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First name"
                error={errors.firstName?.message}
                {...field("firstName")}
              />
              <Field
                label="Last name"
                error={errors.lastName?.message}
                {...field("lastName")}
              />
            </div>
          )}
          {register && (
            <Field
              label="Username"
              error={errors.username?.message}
              {...field("username")}
            />
          )}
          <Field
            label="Email"
            type="email"
            error={errors.email?.message}
            {...field("email")}
          />
          <Field
            label="Password"
            type="password"
            error={errors.password?.message}
            {...field("password")}
          />
          {register && (
            <Field
              label="City"
              error={errors.city?.message}
              {...field("city")}
            />
          )}
          <button disabled={isSubmitting} className="btn-primary">
            {isSubmitting
              ? "Please wait…"
              : register
                ? "Create account"
                : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          {register ? "Already a member?" : "New to LetsBuyTogether?"}{" "}
          <Link
            className="font-semibold text-brand-700"
            to={(register ? "/login" : "/register") + suffix}
          >
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
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
>(function Field({ label, error, ...p }, ref) {
  return (
    <label>
      <span className="label">{label}</span>
      <input ref={ref} className="field" {...p} />
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
});
