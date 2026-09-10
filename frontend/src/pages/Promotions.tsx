import { Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import type { Promotion } from "../lib/types";
import { PromotionCard } from "../components/PromotionCard";
import { Empty, ErrorBox, Loading } from "../components/ui";
const cities = [
    "",
    "Casablanca",
    "Rabat",
    "Marrakech",
    "Agadir",
    "Tangier",
    "Fes",
  ],
  cats = [
    "",
    "Fashion",
    "Electronics",
    "Beauty",
    "Food",
    "Sports",
    "Gaming",
    "Home",
    "Other",
  ];
export function Promotions() {
  const [sp, setSp] = useSearchParams();
  const qs = sp.toString();
  const { data, error, isLoading } = useQuery({
    queryKey: ["promotions", qs],
    queryFn: () =>
      unwrap<{
        items: Promotion[];
        page: number;
        pages: number;
        total: number;
      }>(api.get(`/promotions?${qs}`)),
  });
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v);
    else n.delete(k);
    if (k !== "page") n.delete("page");
    setSp(n);
  };
  return (
    <div className="container-page py-10">
      <div>
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
        >
          <ArrowLeft size={16} /> Back to choices
        </Link>
        <h1 className="text-4xl">Find a product to buy together</h1>
        <p className="mt-2 text-slate-500">
          Search products listed by the community and find someone to share your
          purchase with.
        </p>
      </div>
      <form
        className="mt-8 flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-3 shadow-card sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          set(
            "search",
            String(
              new FormData(event.currentTarget).get("search") ?? "",
            ).trim(),
          );
        }}
      >
        <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
          <Search className="shrink-0 text-brand-600" size={23} />
          <span className="sr-only">Search products</span>
          <input
            key={sp.get("search") ?? ""}
            name="search"
            type="search"
            className="w-full rounded-lg px-1 py-3 focus:ring-2 focus:ring-brand-100"
            placeholder="What would you like to buy?"
            defaultValue={sp.get("search") ?? ""}
          />
        </label>
        <button className="btn-primary px-7" type="submit">
          Search products
        </button>
      </form>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <select
          className="field"
          aria-label="Filter by city"
          value={sp.get("city") ?? ""}
          onChange={(e) => set("city", e.target.value)}
        >
          {cities.map((x) => (
            <option key={x} value={x}>
              {x || "All cities"}
            </option>
          ))}
        </select>
        <select
          className="field"
          aria-label="Filter by category"
          value={sp.get("category") ?? ""}
          onChange={(e) => set("category", e.target.value)}
        >
          {cats.map((x) => (
            <option key={x} value={x}>
              {x || "All categories"}
            </option>
          ))}
        </select>
        <select
          className="field"
          aria-label="Filter by promotion type"
          value={sp.get("type") ?? ""}
          onChange={(e) => set("type", e.target.value)}
        >
          <option value="">All promotion types</option>
          <option value="BUY_X_GET_DISCOUNT">Buy X, get discount</option>
          <option value="BUY_X_GET_Y_FREE">Buy X, get free</option>
          <option value="MINIMUM_SPEND">Minimum spend</option>
        </select>
      </div>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <div className="mt-8">
          <ErrorBox message={error.message} />
        </div>
      ) : !data?.items.length ? (
        <div className="mt-8">
          <Empty
            title="No products found"
            text="Try removing a filter or using a broader search."
          />
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-slate-500">
            {data.total} {data.total === 1 ? "product" : "products"} found
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => (
              <PromotionCard key={p.id} p={p} />
            ))}
          </div>
          <div className="mt-10 flex justify-center gap-3">
            <button
              className="btn-secondary"
              disabled={data.page <= 1}
              onClick={() => set("page", String(data.page - 1))}
            >
              Previous
            </button>
            <span className="py-3">
              Page {data.page} of {data.pages}
            </span>
            <button
              className="btn-secondary"
              disabled={data.page >= data.pages}
              onClick={() => set("page", String(data.page + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
