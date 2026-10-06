import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  X,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  PROMOTIONS,
  CITIES,
  CATEGORIES,
  PROMO_TYPES,
  type Promotion,
} from "../lib/mockData";

const PAGE_SIZE = 9;

function discountLabel(p: Promotion): string {
  if (p.discountPercentage) return `${p.discountPercentage}% off`;
  if (p.discountAmount) return `${p.discountAmount} MAD off`;
  if (p.freeItemsQuantity) return `${p.freeItemsQuantity} free`;
  if (p.minimumSpend) return `Min. ${p.minimumSpend} MAD`;
  return "Special deal";
}

function typeLabel(t: string): string {
  return (
    PROMO_TYPES.find((x) => x.value === t)?.label ?? t.replace(/_/g, " ")
  );
}

// ─── Promotion Detail Modal ───────────────────────────────────────────────────
function PromoModal({
  p,
  onClose,
}: {
  p: Promotion;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <img
          className="modal-img"
          src={p.imageUrl}
          alt={p.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80";
          }}
        />
        <div className="modal-body">
          <div className="modal-store-row">
            <span className="modal-store-name">
              {p.store.name}
              {p.store.isVerified && <span className="verified-tick"> ✓</span>}
            </span>
            <span className="promo-badge">{discountLabel(p)}</span>
          </div>
          <h2 className="modal-title">{p.title}</h2>
          <p className="modal-desc">{p.description}</p>

          <div className="modal-meta">
            <div className="modal-meta-item">
              <Users size={16} />
              <span>
                Needs <strong>{p.requiredQuantity}</strong> buyers
              </span>
            </div>
            {p.city && (
              <div className="modal-meta-item">
                <MapPin size={16} />
                <span>{p.city}</span>
              </div>
            )}
            <div className="modal-meta-item">
              <Clock size={16} />
              <span>
                Expires{" "}
                {new Date(p.expiresAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="modal-type-row">
            <span className="modal-type-badge">{typeLabel(p.promotionType)}</span>
            <span className="modal-type-badge">{p.category}</span>
            {p.groupCount > 0 && (
              <span className="modal-type-badge">
                {p.groupCount} active group{p.groupCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <a
            href={p.promotionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-cta"
          >
            View deal on {p.store.name} ↗
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Promotion Card ───────────────────────────────────────────────────────────
function PromoCard({ p, onClick }: { p: Promotion; onClick: () => void }) {
  return (
    <article className="promo-card" onClick={onClick} tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}>
      <div className="promo-card-img-wrap">
        <img
          className="promo-card-img"
          src={p.imageUrl}
          alt={p.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80";
          }}
        />
        <span className="promo-card-badge">{discountLabel(p)}</span>
        {p.groupCount > 0 && (
          <span className="promo-card-groups">
            <Users size={12} /> {p.groupCount}
          </span>
        )}
      </div>
      <div className="promo-card-body">
        <div className="promo-card-store">
          {p.store.name}
          {p.store.isVerified && <span className="verified-tick"> ✓</span>}
        </div>
        <h3 className="promo-card-title">{p.title}</h3>
        <div className="promo-card-meta">
          <span>
            <Users size={13} /> {p.requiredQuantity} buyers needed
          </span>
          {p.city && (
            <span>
              <MapPin size={13} /> {p.city}
            </span>
          )}
          <span>
            <Clock size={13} />{" "}
            {new Date(p.expiresAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
        <button className="promo-card-btn">View deal</button>
      </div>
    </article>
  );
}

// ─── Main Search Page ─────────────────────────────────────────────────────────
export function SearchPage() {
  const [search, setSearch] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Promotion | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PROMOTIONS.filter((p) => {
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q) &&
        !p.store.name.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q)
      )
        return false;
      if (city && p.city !== city) return false;
      if (category && p.category !== category) return false;
      if (type && p.promotionType !== type) return false;
      return true;
    });
  }, [search, city, category, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasFilters = city || category || type;

  const clearFilters = () => {
    setCity("");
    setCategory("");
    setType("");
    setSearch("");
    setInputVal("");
    setPage(1);
  };

  return (
    <div className="search-page">
      {/* Header */}
      <div className="search-hero">
        <div className="container-page">
          <Link to="/" className="search-back">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <h1 className="search-title">Find a deal to share</h1>
          <p className="search-subtitle">
            Browse {PROMOTIONS.length} group-buying deals across Morocco. Filter
            by city, category, or deal type.
          </p>

          {/* Search bar */}
          <form
            className="search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(inputVal);
              setPage(1);
            }}
          >
            <div className="search-input-wrap">
              <Search size={20} className="search-icon" />
              <input
                type="search"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search products, stores, categories…"
                className="search-input"
              />
              {inputVal && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => {
                    setInputVal("");
                    setSearch("");
                    setPage(1);
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="search-submit">
              Search
            </button>
            <button
              type="button"
              className={`search-filter-toggle ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={18} />
              {hasFilters && <span className="filter-dot" />}
            </button>
          </form>

          {/* Filter row */}
          {showFilters && (
            <div className="filter-row">
              <select
                className="filter-select"
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                aria-label="Filter by city"
              >
                <option value="">All cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                aria-label="Filter by promotion type"
              >
                <option value="">All deal types</option>
                {PROMO_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              {hasFilters && (
                <button className="filter-clear-btn" onClick={clearFilters}>
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container-page search-results">
        {/* Stats */}
        <div className="search-stats">
          <span>
            <strong>{filtered.length}</strong> deal
            {filtered.length !== 1 ? "s" : ""} found
            {search && ` for "${search}"`}
          </span>
          {filtered.length > 0 && (
            <span className="search-page-info">
              Page {safePage} of {totalPages}
            </span>
          )}
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="search-empty">
            <Search size={40} className="search-empty-icon" />
            <h3>No deals found</h3>
            <p>Try adjusting your search or removing a filter.</p>
            <button className="search-empty-btn" onClick={clearFilters}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="promo-grid">
            {items.map((p) => (
              <PromoCard key={p.id} p={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={safePage <= 1}
              onClick={() => { setPage(safePage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`pagination-num ${n === safePage ? "active" : ""}`}
                  onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              className="pagination-btn"
              disabled={safePage >= totalPages}
              onClick={() => { setPage(safePage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <PromoModal p={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
