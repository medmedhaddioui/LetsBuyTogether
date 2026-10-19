import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "../../../shared/components/FormField";
import { useAuth } from "../hooks/use-auth";
import { authService } from "../services/auth.service";

/** Temporary local signup shortcut; the server disables it outside development. */
export function TestSignupForm() {
  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { testSignIn, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const controller = new AbortController();
    authService
      .testSignupEnabled(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setEnabled(value);
      })
      .catch(() => {
        /* The shortcut stays hidden if unavailable. */
      });
    return () => controller.abort();
  }, []);
  if (!enabled) return null;
  return (
    <form
      className="test-signup auth-form"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          setBusy(true);
          setError("");
          const user = await testSignIn(email);
          navigate(user.profileComplete ? "/activity" : "/complete-profile", { replace: true });
        } catch (failure) {
          setError((failure as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Temporary test access</h2>
      <p className="auth-subtitle">
        Enter a test email to try the app without Google verification.
      </p>
      <FormField
        label="Test email"
        type="email"
        placeholder="bot1@gmail.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        maxLength={254}
        required
      />
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button className="auth-submit" type="submit" disabled={busy || loading}>
        {busy ? "Please wait…" : "Enter with test email"}
      </button>
    </form>
  );
}
