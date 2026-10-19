import type { ProductPost } from "../types/product.types";

export function ProductPostCard({ post }: { post: ProductPost }) {
  return (
    <article className="product-post-card">
      <img
        src={post.imageUrl}
        alt={post.productName}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
      <div className="product-post-content">
        <span className="product-post-meta">
          {post.storeName} · {post.city}
        </span>
        <h2>{post.productName}</h2>
        <strong>{post.price.toLocaleString()} MAD per item</strong>
        <p>{post.description}</p>
        <p className="product-post-meta">
          {post.category} · Deal needs {post.quantityNeeded} items
          <br />
          Posted by {post.authorUsername} · Expires {new Date(post.expiresAt).toLocaleDateString()}
        </p>
        <a className="btn-primary" href={post.productUrl} target="_blank" rel="noopener noreferrer">
          View product at store ↗
        </a>
      </div>
    </article>
  );
}
