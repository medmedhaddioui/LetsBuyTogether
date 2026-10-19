import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { FormField } from "../../../shared/components/FormField";
import { useAuth } from "../hooks/use-auth";
import { profileSchema, type ProfileValues } from "../schemas/auth.schemas";

export function CompleteProfilePage() {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", address: user?.address ?? "", city: user?.city ?? "" },
  });
  if (user?.profileComplete) return <Navigate to="/get-started" replace />;
  const submit = async (values: ProfileValues) => {
    try {
      setError("");
      await completeProfile(values);
      navigate("/get-started", { replace: true });
    } catch (failure) {
      setError((failure as Error).message);
    }
  };
  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Complete your profile</h1>
        <p className="auth-subtitle">
          Signed in as {user?.email}. Add your details to start searching or posting.
        </p>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <form className="auth-form" onSubmit={handleSubmit(submit)}>
          <FormField
            label="Username"
            autoComplete="username"
            maxLength={30}
            error={errors.username?.message}
            {...register("username")}
          />
          <FormField
            label="Address"
            autoComplete="street-address"
            maxLength={500}
            error={errors.address?.message}
            {...register("address")}
          />
          <FormField
            label="City"
            autoComplete="address-level2"
            maxLength={100}
            error={errors.city?.message}
            {...register("city")}
          />
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save and continue"}
          </button>
        </form>
      </div>
    </section>
  );
}
