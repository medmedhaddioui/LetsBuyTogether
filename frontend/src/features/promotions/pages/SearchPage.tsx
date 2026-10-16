import { ArrowLeft, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Promotion } from "../../../shared/types/promotion";
import { PromotionCard } from "../components/PromotionCard";
import { PromotionModal } from "../components/PromotionModal";
import { CATEGORIES, CITIES, PROMO_TYPES } from "../constants/promotion-filters";
import { PROMOTIONS } from "../data/demo-promotions";

const PAGE_SIZE = 9;

export function SearchPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredPromotions = useMemo(() => {
    const query = search.toLowerCase().trim();
    return PROMOTIONS.filter((promotion) => {
      if (
        query &&
        !promotion.title.toLowerCase().includes(query) &&
        !promotion.description.toLowerCase().includes(query) &&
        !promotion.store.name.toLowerCase().includes(query) &&
        !promotion.category.toLowerCase().includes(query)
      )
        return false;
      if (city && promotion.city !== city) return false;
      if (category && promotion.category !== category) return false;
      if (type && promotion.promotionType !== type) return false;
      return true;
    });
  }, [search, city, category, type]);

  const totalPages = Math.max(1, Math.ceil(filteredPromotions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visiblePromotions = filteredPromotions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasFilters = city || category || type;

  const clearFilters = () => {
    setCity("");
    setCategory("");
    setType("");
    setSearch("");
    setSearchInput("");
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
            Browse {PROMOTIONS.length} group-buying deals across Morocco. Filter by city, category,
            or deal type.
          </p>

          {/* Search bar */}
          <form
            className="search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
              setPage(1);
            }}
          >
            <div className="search-input-wrap">
              <Search size={20} className="search-icon" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products, stores, categories…"
                className="search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => {
                    setSearchInput("");
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
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by city"
              >
                <option value="">All cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by promotion type"
              >
                <option value="">All deal types</option>
                {PROMO_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
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
            <strong>{filteredPromotions.length}</strong> deal
            {filteredPromotions.length !== 1 ? "s" : ""} found
            {search && ` for "${search}"`}
          </span>
          {filteredPromotions.length > 0 && (
            <span className="search-page-info">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* Grid */}
        {visiblePromotions.length === 0 ? (
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
            {visiblePromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onClick={() => setSelectedPromotion(promotion)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => {
                setPage(currentPage - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`pagination-num ${n === currentPage ? "active" : ""}`}
                  onClick={() => {
                    setPage(n);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => {
                setPage(currentPage + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPromotion && (
        <PromotionModal promotion={selectedPromotion} onClose={() => setSelectedPromotion(null)} />
      )}
    </div>
  );
}
