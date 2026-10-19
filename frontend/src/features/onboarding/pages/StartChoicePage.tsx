import { PackagePlus, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/use-auth";

export function StartChoicePage() {
  const { choosePreference } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const choose = async (preference: "search" | "post") => {
    try {
      setBusy(true);
      setError("");
      await choosePreference(preference);
      navigate(preference === "search" ? "/search" : "/posts/new");
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="workspace-page container-page">
      <h1>What would you like to do?</h1>
      <p className="workspace-intro">
        Browse products or post a deal. You can switch anytime with the same account.
      </p>
      {error && (
        <p className="workspace-error" role="alert">
          {error}
        </p>
      )}
      <div className="workspace-choices">
        <button className="workspace-choice" disabled={busy} onClick={() => choose("search")}>
          <Search size={36} />
          <strong>Browse products</strong>
          <span>Explore available posts and filter by city, category and budget.</span>
        </button>
        <button className="workspace-choice" disabled={busy} onClick={() => choose("post")}>
          <PackagePlus size={36} />
          <strong>Post a product</strong>
          <span>Share a product or deal and the quantity needed.</span>
        </button>
      </div>
      <Link className="workspace-link" to="/activity">
        View my activity
      </Link>
    </section>
  );
}
