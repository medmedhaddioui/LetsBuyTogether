import { ChevronRight, SlidersHorizontal, Plus, RotateCcw } from "lucide-react";
import "../styles/product-browser.css";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { categories } from "../constants/product-categories";
import { ProductPostCard } from "../components/ProductPostCard";
import { productsService } from "../services/products.service";
import type { PostResults } from "../types/product.types";

export function BrowseProductsPage() {
  const [filters, setFilters] = useSearchParams();
  const [result, setResult] = useState<PostResults | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const query = filters.toString();
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    productsService
      .browse(new URLSearchParams(query), controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setResult(null);
          setError(failure.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query]);
  return (
    <section className="product-browser container-page">
      <nav className="browser-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Dashboard</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span>Browse products</span>
      </nav>
      <header className="browser-header">
        <div>
          <h1>Browse products</h1>
          <p>Find a product to buy together with people in your city.</p>
        </div>
      </header>
      <div className="browser-toolbar">
        <Link to="/posts/new">
          <Plus size={16} aria-hidden="true" />
          Post a product
        </Link>
        <Link to="/search">
          <RotateCcw size={15} aria-hidden="true" />
          Reset filters
        </Link>
      </div>
      <div className="browser-workspace">
        <aside className="browser-filter-panel">
          <h2>
            <SlidersHorizontal size={17} aria-hidden="true" />
            Filter products
          </h2>
          <p>Narrow down the available posts.</p>
          <form
            key={query}
            className="browser-filters"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const next = new URLSearchParams();
              for (const [key, value] of data)
                if (String(value).trim()) next.set(key, String(value).trim());
              setFilters(next);
            }}
          >
            <label>
              <span>Product keywords</span>
              <input
                className="field"
                name="search"
                maxLength={200}
                defaultValue={filters.get("search") || ""}
                placeholder="Headphones…"
              />
            </label>
            <label>
              <span>City</span>
              <input
                className="field"
                name="city"
                maxLength={100}
                defaultValue={filters.get("city") || ""}
              />
            </label>
            <label>
              <span>Category</span>
              <select
                className="field"
                name="category"
                defaultValue={filters.get("category") || ""}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Max. MAD per item</span>
              <input
                className="field"
                name="maxBudget"
                type="number"
                min={0}
                step="0.01"
                defaultValue={filters.get("maxBudget") || ""}
              />
            </label>
            <label>
              <span>Quantity wanted</span>
              <input
                className="field"
                name="quantity"
                type="number"
                min={1}
                max={10000}
                defaultValue={filters.get("quantity") || ""}
              />
            </label>
            <button className="btn-primary">Find matches</button>
            <Link className="workspace-link" to="/search">
              Clear filters
            </Link>
          </form>
        </aside>
        <div className="browser-results" aria-busy={loading}>
          <div className="browser-results-heading">
            <h2>Product posts</h2>
            <span>{loading ? "Updating…" : `${result?.total || 0} results`}</span>
          </div>
          {loading ? (
            <p role="status">Loading products…</p>
          ) : error ? (
            <p className="workspace-error" role="alert">
              {error}
            </p>
          ) : (
            <>
              {result?.items.length ? (
                <div className="product-post-grid">
                  {result.items.map((post) => (
                    <ProductPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="workspace-empty">
                  <h2>No matching posts yet</h2>
                  <p>Try broader filters or share a product yourself.</p>
                  <Link className="workspace-link" to="/posts/new">
                    Post a product
                  </Link>
                </div>
              )}
              {result && result.pages > 1 && (
                <div className="workspace-pagination">
                  <button
                    disabled={result.page <= 1}
                    onClick={() => {
                      const next = new URLSearchParams(filters);
                      next.set("page", String(result.page - 1));
                      setFilters(next);
                    }}
                  >
                    Previous
                  </button>
                  <span>
                    Page {result.page} of {result.pages}
                  </span>
                  <button
                    disabled={result.page >= result.pages}
                    onClick={() => {
                      const next = new URLSearchParams(filters);
                      next.set("page", String(result.page + 1));
                      setFilters(next);
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
