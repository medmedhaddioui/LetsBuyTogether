import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Headphones,
  Plus,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Home() {
  const { user } = useAuth();
  return (
    <section className="welcome-page">
      <div className="container-page">
        <div className="hero-intro">
          <div className="eyebrow">
            <span className="live-dot" /> THE COMMUNITY WAY TO SHOP
          </div>
          <h1>
            One shared purchase.
            <br />
            <span>More possibilities.</span>
          </h1>
          <div className="hero-bottom">
            <p>
              That thing you’ve had your eye on?
              <br />
              Find your people. Buy it together.
            </p>
            <span className="hero-prompt">
              How do you want to start? <ArrowDown size={17} />
            </span>
          </div>
        </div>
        <div className="choice-grid">
          <Link
            className="choice-card choice-post group"
            to={user ? "/create-promotion" : "/register?next=/create-promotion"}
          >
            <div className="choice-top">
              <span className="choice-kicker">01 / START SOMETHING</span>
              <span className="choice-icon">
                <Plus size={23} />
              </span>
            </div>
            <div className="choice-art post-art" aria-hidden="true">
              <div className="art-orbit" />
              <div className="product-tile">
                <Headphones size={68} strokeWidth={1.2} />
                <span>YOUR NEXT FIND</span>
              </div>
              <div className="floating-note">
                <span className="note-avatar">
                  <Users size={16} />
                </span>{" "}
                Looking for a buying buddy <span className="note-plus">+</span>
              </div>
            </div>
            <div className="choice-copy">
              <h2>
                You found it.
                <br />
                Now find your people.
              </h2>
              <p>
                Post a product you want to buy and connect with someone to share
                the purchase.
              </p>
            </div>
            <div className="choice-action">
              <span>Post a product</span>
              <ArrowUpRight size={23} />
            </div>
            <span className="choice-footnote">
              {user
                ? "Your next shared purchase starts here"
                : "A free account is all you need"}
            </span>
          </Link>
          <Link className="choice-card choice-search group" to="/promotions">
            <div className="choice-top">
              <span className="choice-kicker">02 / FIND YOUR MATCH</span>
              <span className="choice-icon">
                <Search size={21} />
              </span>
            </div>
            <div className="choice-art search-art" aria-hidden="true">
              <div className="search-preview">
                <Search size={18} />
                <span>Your next great find</span>
                <span className="preview-enter">↵</span>
              </div>
              <div className="preview-products">
                <span>
                  <Headphones size={27} strokeWidth={1.4} /> Tech
                </span>
                <span>
                  <ShoppingBag size={27} strokeWidth={1.4} /> Fashion
                </span>
                <span>
                  <Users size={27} strokeWidth={1.4} /> Together
                </span>
              </div>
              <div className="match-note">
                <Check size={13} /> Same wishlist. New connections.
              </div>
            </div>
            <div className="choice-copy">
              <h2>
                Someone found it.
                <br />
                Maybe it’s your thing.
              </h2>
              <p>
                Explore products already listed by the community. Find a match
                and buy together.
              </p>
            </div>
            <div className="choice-action">
              <span>Explore products</span>
              <ArrowUpRight size={23} />
            </div>
            <span className="choice-footnote">
              Take a look. No account needed.
            </span>
          </Link>
        </div>
        <div className="home-bottom">
          <span>
            <span className="live-dot" /> Made for shopping together in Morocco
          </span>
          <span>Shared finds. Shared possibilities.</span>
        </div>
      </div>
    </section>
  );
}
