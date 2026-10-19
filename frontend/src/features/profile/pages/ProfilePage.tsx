import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ChevronRight, Save, ShieldCheck, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { FormField } from "../../../shared/components/FormField";
import { useAuth } from "../../auth/hooks/use-auth";
import { profileSchema } from "../../auth/schemas/auth.schemas";
import "../styles/profile.css";

const detailsSchema = profileSchema.extend({
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (value) =>
        value === "" ||
        (/^\+?[0-9 ()-]+$/.test(value) &&
          value.replace(/\D/g, "").length >= 7 &&
          value.replace(/\D/g, "").length <= 15),
      "Enter a valid phone number.",
    ),
  bio: z.string().trim().max(500, "Keep your bio under 500 characters."),
});
type Details = z.infer<typeof detailsSchema>;

export function ProfilePage() {
  const { user, completeProfile, updateAvatar } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Details>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      username: user?.username ?? "",
      address: user?.address ?? "",
      city: user?.city ?? "",
      phone: user?.phone ?? "",
      bio: user?.bio ?? "",
    },
  });
  const busy = uploading || isSubmitting;
  const save = async (values: Details) => {
    setError("");
    setSuccess("");
    try {
      await completeProfile(values);
      reset(values);
      setSuccess("Your profile has been saved.");
    } catch (failure) {
      setError((failure as Error).message);
    }
  };
  const changePhoto = async (file: File | null) => {
    setError("");
    setSuccess("");
    if (
      file &&
      (!["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 2 * 1024 * 1024 ||
        file.size === 0)
    ) {
      setError("Choose a JPEG, PNG or WebP photo under 2 MB.");
      return;
    }
    try {
      setUploading(true);
      await updateAvatar(file);
      setSuccess(
        file ? "Your profile photo has been updated." : "Your profile photo has been removed.",
      );
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setUploading(false);
    }
  };
  if (!user) return null;
  return (
    <section className="profile-page container-page">
      <nav className="profile-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Dashboard</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span>My profile</span>
      </nav>
      <header className="profile-heading">
        <h1>My profile</h1>
        <p>Manage your photo, personal details and contact information.</p>
      </header>
      {error && (
        <p className="profile-notice profile-notice-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="profile-notice profile-notice-success" role="status">
          {success}
        </p>
      )}
      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="profile-photo">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={`${user.username}'s profile`} />
            ) : (
              <UserRound size={52} aria-hidden="true" />
            )}
          </div>
          <h2>{user.username}</h2>
          <p className="profile-email">{user.email}</p>
          <input
            className="sr-only"
            ref={fileInput}
            tabIndex={-1}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Profile photo file"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void changePhoto(file);
            }}
          />
          <button
            type="button"
            className="profile-photo-button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
          >
            <Camera size={16} aria-hidden="true" />
            {uploading ? "Updating photo…" : "Upload photo"}
          </button>
          {user.photoUrl && (
            <button
              type="button"
              className="profile-remove"
              disabled={busy}
              onClick={() => void changePhoto(null)}
            >
              Remove photo
            </button>
          )}
          <small>JPG, PNG or WebP · Up to 2 MB</small>
          <dl className="profile-account-info">
            <div>
              <dt>Member since</dt>
              <dd>
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt>Account</dt>
              <dd>{user.isTestAccount ? "Test account" : "Member"}</dd>
            </div>
          </dl>
        </aside>
        <form className="profile-details" onSubmit={handleSubmit(save)}>
          <fieldset disabled={busy}>
            <legend>Personal information</legend>
            <p>Choose how your name appears on your product posts.</p>
            <FormField
              label="Username"
              autoComplete="username"
              maxLength={30}
              error={errors.username?.message}
              {...register("username")}
            />
            <label className="auth-field-wrap">
              <span className="label">About me (optional)</span>
              <textarea
                className="field auth-field"
                rows={3}
                maxLength={500}
                placeholder="A little about yourself and what you enjoy buying together."
                {...register("bio")}
              />
              {errors.bio && <span className="auth-field-error">{errors.bio.message}</span>}
            </label>
          </fieldset>
          <fieldset disabled={busy}>
            <legend>Contact details</legend>
            <p>Your email and phone number are kept private.</p>
            <div className="profile-form-grid">
              <FormField label="Email address" type="email" value={user.email} readOnly />
              <FormField
                label="Phone number (optional)"
                type="tel"
                autoComplete="tel"
                placeholder="+212 6 12 34 56 78"
                maxLength={30}
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>
          </fieldset>
          <fieldset disabled={busy}>
            <legend>Location</legend>
            <p>Your city helps you discover nearby products. Your address stays private.</p>
            <FormField
              label="City"
              autoComplete="address-level2"
              maxLength={100}
              error={errors.city?.message}
              {...register("city")}
            />
            <FormField
              label="Address"
              autoComplete="street-address"
              maxLength={500}
              error={errors.address?.message}
              {...register("address")}
            />
          </fieldset>
          <footer className="profile-save-bar">
            <span>
              <ShieldCheck size={16} aria-hidden="true" />
              Your contact details stay private.
            </span>
            <button type="submit" disabled={busy || !isDirty}>
              <Save size={16} aria-hidden="true" />
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </footer>
        </form>
      </div>
    </section>
  );
}
