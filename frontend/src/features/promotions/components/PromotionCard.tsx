import { Clock, MapPin, Users } from "lucide-react";
import type { Promotion } from "../../../shared/types/promotion";
import { discountLabel } from "../utils/promotion-labels";

export function PromotionCard({
  promotion,
  onClick,
}: {
  promotion: Promotion;
  onClick: () => void;
}) {
  return (
    <article
      className="promo-card"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="promo-card-img-wrap">
        <img
          className="promo-card-img"
          src={promotion.imageUrl}
          alt={promotion.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80";
          }}
        />
        <span className="promo-card-badge">{discountLabel(promotion)}</span>
        {promotion.groupCount > 0 && (
          <span className="promo-card-groups">
            <Users size={12} /> {promotion.groupCount}
          </span>
        )}
      </div>
      <div className="promo-card-body">
        <div className="promo-card-store">
          {promotion.store.name}
          {promotion.store.isVerified && <span className="verified-tick"> ✓</span>}
        </div>
        <h3 className="promo-card-title">{promotion.title}</h3>
        <div className="promo-card-meta">
          <span>
            <Users size={13} /> {promotion.requiredQuantity} buyers needed
          </span>
          {promotion.city && (
            <span>
              <MapPin size={13} /> {promotion.city}
            </span>
          )}
          <span>
            <Clock size={13} />{" "}
            {new Date(promotion.expiresAt).toLocaleDateString("en-GB", {
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
