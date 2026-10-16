import { Clock, MapPin, Users, X } from "lucide-react";
import type { Promotion } from "../../../shared/types/promotion";
import { discountLabel, typeLabel } from "../utils/promotion-labels";

export function PromotionModal({
  promotion,
  onClose,
}: {
  promotion: Promotion;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <img
          className="modal-img"
          src={promotion.imageUrl}
          alt={promotion.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80";
          }}
        />
        <div className="modal-body">
          <div className="modal-store-row">
            <span className="modal-store-name">
              {promotion.store.name}
              {promotion.store.isVerified && <span className="verified-tick"> ✓</span>}
            </span>
            <span className="promo-badge">{discountLabel(promotion)}</span>
          </div>
          <h2 className="modal-title">{promotion.title}</h2>
          <p className="modal-desc">{promotion.description}</p>

          <div className="modal-meta">
            <div className="modal-meta-item">
              <Users size={16} />
              <span>
                Needs <strong>{promotion.requiredQuantity}</strong> buyers
              </span>
            </div>
            {promotion.city && (
              <div className="modal-meta-item">
                <MapPin size={16} />
                <span>{promotion.city}</span>
              </div>
            )}
            <div className="modal-meta-item">
              <Clock size={16} />
              <span>
                Expires{" "}
                {new Date(promotion.expiresAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="modal-type-row">
            <span className="modal-type-badge">{typeLabel(promotion.promotionType)}</span>
            <span className="modal-type-badge">{promotion.category}</span>
            {promotion.groupCount > 0 && (
              <span className="modal-type-badge">
                {promotion.groupCount} active group{promotion.groupCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <a
            href={promotion.promotionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-cta"
          >
            View deal on {promotion.store.name} ↗
          </a>
        </div>
      </div>
    </div>
  );
}
