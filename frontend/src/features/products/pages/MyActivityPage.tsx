import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { productsService } from "../services/products.service";
import type { ProductPost } from "../types/product.types";

export function MyActivityPage() {
  const [posts, setPosts] = useState<ProductPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const location = useLocation();
  useEffect(() => {
    let mounted = true;
    productsService
      .posts()
      .then((savedPosts) => {
        if (mounted) {
          setPosts(savedPosts);
        }
      })
      .catch((failure) => {
        if (mounted) setError(failure.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const changePost = async (post: ProductPost, status: "open" | "full" | "cancelled") => {
    try {
      setBusy(post.id);
      setError("");
      const updated = await productsService.postStatus(post.id, status);
      setPosts((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <section className="workspace-page container-page">
      <div className="workspace-heading">
        <div>
          <h1>My activity</h1>
          <p>Manage the products you have shared.</p>
        </div>
        <Link to="/get-started" className="workspace-link">
          Switch action
        </Link>
      </div>
      <div className="workspace-actions">
        <Link className="btn-primary" to="/search">
          Browse products
        </Link>
        <Link className="btn-secondary" to="/posts/new">
          Post a product
        </Link>
      </div>
      {location.state?.posted && (
        <p className="workspace-success" role="status">
          Your product is published. People can now find it in product search.
        </p>
      )}
      {error && (
        <p className="workspace-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading your activity…</p>
      ) : (
        <>
          <h2>My product posts</h2>
          {!posts.length && <p className="workspace-empty">No products posted yet.</p>}
          <div className="activity-list">
            {posts.map((post) => (
              <article className="activity-card" key={post.id}>
                <div>
                  <h3>{post.productName}</h3>
                  <p>
                    {post.storeName} · {post.city} · {post.price} MAD per item ·{" "}
                    {post.quantityNeeded} items needed
                  </p>
                  <small>
                    Created {new Date(post.createdAt).toLocaleDateString()} · Expires{" "}
                    {new Date(post.expiresAt).toLocaleString()}
                  </small>
                </div>
                <div className="activity-controls">
                  <a
                    className="workspace-link"
                    href={post.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View at store ↗
                  </a>
                  <label>
                    Status
                    <select
                      className="field"
                      aria-label={`Status for post ${post.productName}`}
                      disabled={busy !== null || post.status === "expired"}
                      value={post.status}
                      onChange={(event) =>
                        changePost(post, event.target.value as "open" | "full" | "cancelled")
                      }
                    >
                      <option value="open">Open</option>
                      <option value="full">Full</option>
                      <option value="cancelled">Cancelled</option>
                      {post.status === "expired" && <option value="expired">Expired</option>}
                    </select>
                  </label>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
