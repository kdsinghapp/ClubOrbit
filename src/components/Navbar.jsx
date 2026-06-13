import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { useAuthContext } from "../context/AuthContext";

const NAV_LINKS = [
  { label: "Home", to: "/activity" },
  { label: "About Us", to: "/about" },
  { label: "Clubs", to: "/clubs" },
  { label: "Contact Us", to: "/contact-us" },
];

export default function Navbar() {
  const location = useLocation();
  const { user: authUser, logout } = useAuthContext();
  const { profile } = useProfile(authUser?.uid);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  /* ── scroll detection for navbar shadows ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── close everything on route change ── */
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* ── close profile dropdown on outside click/touch ── */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  /* ── body scroll lock — properly cleaned up ── */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* ── derived values ── */
  const isLoggedIn = !!authUser;

  const displayName =
    profile?.body?.result?.user?.displayName ||
    authUser?.displayName ||
    authUser?.email?.split("@")[0] ||
    "User";

  const u = profile?.body?.result?.user;
  const ue = profile?.body?.result?.userEntity;

  const avatarSrc =
    u?.profilePicUrl ||
    u?.profilePic?.url ||
    u?.profilePic?.thumbnailURL ||
    u?.profilePic?.fullURL ||
    (typeof u?.profilePic === "string" ? u?.profilePic : null) ||
    ue?.profilePicUrl ||
    authUser?.photoURL ||
    "/assets/img/profiles/avatar-05.jpg";

  const memberships = profile?.body?.result?.userEntity?.memberships || [];

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch {
      /* ignore */
    }
  };

  const openMenu = (e) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        /* ══════════════════════════════════════
           CLUB ORBIT — NAVBAR (fixed position)
           Dark theme · mobile-first · no click bugs
        ══════════════════════════════════════ */

        :root {
          --co-bg:      #0f1923;
          --co-bg2:     #1a2535;
          --co-border:  rgba(255,255,255,0.08);
          --co-accent:  #f5c518;
          --co-accent2: #e6a800;
          --co-text:    #e8edf3;
          --co-muted:   #7a8a9a;
          --co-radius:  12px;
          --co-shadow:  0 8px 32px rgba(0,0,0,0.45);
        }

        /* ── Navbar shell (FIXED) ── */
        .co-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--co-bg);
          border-bottom: 1px solid var(--co-border);
          transition: box-shadow 0.3s ease;
        }
        .co-navbar.co-scrolled {
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }
        .co-navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* ── Page content spacer ── */
        .co-navbar-spacer {
          height: 64px;
          flex-shrink: 0;
        }

        /* ── Logo ── */
        .co-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .co-logo img {
          height: 36px;
          width: auto;
          display: block;
        }

        /* ── Desktop nav links ── */
        .co-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .co-nav-links li a {
          display: block;
          padding: 8px 14px;
          font-size: 14px;
          font-weight: 500;
          color: var(--co-muted);
          text-decoration: none;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .co-nav-links li a:hover {
          color: var(--co-text);
          background: rgba(255,255,255,0.06);
        }
        .co-nav-links li.active a {
          color: var(--co-accent);
          background: rgba(245,197,24,0.1);
        }

        /* ── Right side actions ── */
        .co-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        /* ── Login button (logged out) ── */
        .co-btn-login {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          font-size: 14px;
          font-weight: 600;
          color: var(--co-bg);
          background: var(--co-accent);
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .co-btn-login:hover {
          background: var(--co-accent2);
          transform: translateY(-1px);
        }
        .co-btn-login svg {
          width: 15px;
          height: 15px;
        }

        /* ── Avatar trigger ── */
        .co-avatar-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid var(--co-border);
          transition: border-color 0.2s;
          background: var(--co-bg2);
          flex-shrink: 0;
        }
        .co-avatar-btn:hover,
        .co-avatar-btn.open {
          border-color: var(--co-accent);
        }
        .co-avatar-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── Profile dropdown ── */
        .co-profile-wrap {
          position: relative;
        }
        .co-profile-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 270px;
          background: var(--co-bg2);
          border: 1px solid var(--co-border);
          border-radius: var(--co-radius);
          box-shadow: var(--co-shadow);
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-6px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .co-profile-dropdown.show {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }
        .co-pd-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--co-border);
        }
        .co-pd-header img {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--co-accent);
          flex-shrink: 0;
        }
        .co-pd-header-text { min-width: 0; }
        .co-pd-header-text h6 {
          margin: 0 0 2px;
          font-size: 14px;
          font-weight: 600;
          color: var(--co-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .co-pd-header-text p {
          margin: 0 0 4px;
          font-size: 12px;
          color: var(--co-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .co-pd-header-text a {
          font-size: 12px;
          color: var(--co-accent);
          text-decoration: none;
        }
        .co-pd-header-text a:hover { text-decoration: underline; }

        .co-pd-memberships {
          padding: 10px 16px 6px;
          border-bottom: 1px solid var(--co-border);
        }
        .co-pd-memberships-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: var(--co-muted);
          margin-bottom: 6px;
        }
        .co-pd-membership-item {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 3px 0;
          font-size: 13px;
          color: var(--co-text);
        }

        .co-pd-divider {
          height: 1px;
          background: var(--co-border);
          margin: 4px 0;
        }
        .co-pd-bottom { padding: 4px; }
        .co-pd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          font-size: 14px;
          color: var(--co-muted);
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          border-radius: 8px;
        }
        .co-pd-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--co-text);
        }
        .co-pd-item svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          opacity: 0.6;
        }
        .co-pd-item:hover svg { opacity: 1; }
        .co-pd-item.co-logout:hover {
          color: #ff6b6b;
          background: rgba(255,107,107,0.08);
        }

        /* ── Hamburger ── */
        .co-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          cursor: pointer;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--co-border);
          border-radius: 8px;
          padding: 0;
          flex-shrink: 0;
        }
        .co-hamburger span {
          display: block;
          width: 18px;
          height: 2px;
          background: var(--co-text);
          border-radius: 2px;
        }

        /* ══ OVERLAY — KEY FIX ══ */
        .co-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          z-index: 1040;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .co-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        /* ── Mobile Drawer ── */
        .co-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 300px;
          max-width: 85vw;
          height: 100vh;
          background: var(--co-bg);
          border-right: 1px solid var(--co-border);
          z-index: 1050;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        .co-drawer.open {
          transform: translateX(0);
        }
        .co-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--co-border);
          flex-shrink: 0;
        }
        .co-drawer-header img {
          height: 32px;
          width: auto;
        }
        .co-drawer-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--co-border);
          border-radius: 8px;
          cursor: pointer;
          color: var(--co-text);
          font-size: 16px;
          line-height: 1;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .co-drawer-close:hover {
          background: rgba(255,255,255,0.12);
        }
        .co-drawer-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: var(--co-bg2);
          border-radius: 10px;
          margin: 12px 12px 0;
          flex-shrink: 0;
        }
        .co-drawer-user img {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--co-accent);
          flex-shrink: 0;
        }
        .co-drawer-user-text h6 {
          margin: 0 0 2px;
          font-size: 14px;
          font-weight: 600;
          color: var(--co-text);
        }
        .co-drawer-user-text p {
          margin: 0;
          font-size: 12px;
          color: var(--co-muted);
        }
        .co-drawer-nav {
          list-style: none;
          margin: 0;
          padding: 12px 12px 0;
          flex: 1;
        }
        .co-drawer-nav li a {
          display: flex;
          align-items: center;
          padding: 12px 14px;
          font-size: 15px;
          font-weight: 500;
          color: var(--co-muted);
          text-decoration: none;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .co-drawer-nav li a:hover {
          color: var(--co-text);
          background: rgba(255,255,255,0.06);
        }
        .co-drawer-nav li.active a {
          color: var(--co-accent);
          background: rgba(245,197,24,0.1);
        }
        .co-drawer-footer {
          padding: 12px;
          border-top: 1px solid var(--co-border);
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }
        .co-drawer-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s;
          cursor: pointer;
        }
        .co-drawer-btn.primary {
          background: var(--co-accent);
          color: var(--co-bg);
        }
        .co-drawer-btn.primary:hover { background: var(--co-accent2); }
        .co-drawer-btn.secondary {
          background: rgba(255,255,255,0.06);
          color: var(--co-text);
          border: 1px solid var(--co-border);
        }
        .co-drawer-btn.secondary:hover { background: rgba(255,255,255,0.1); }
        .co-drawer-btn.danger {
          background: rgba(255,107,107,0.12);
          color: #ff6b6b;
        }
        .co-drawer-btn.danger:hover { background: rgba(255,107,107,0.2); }

        /* ── Responsive ── */
        @media (max-width: 991px) {
          .co-nav-links { display: none; }
          .co-hamburger { display: flex; }
        }
        @media (min-width: 992px) {
          .co-drawer  { display: none !important; }
          .co-overlay { display: none !important; }
        }
        @media (max-width: 400px) {
          .co-navbar-inner { padding: 0 14px; }
          .co-profile-dropdown { right: -10px; width: 250px; }
        }
      `}</style>

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className={`co-navbar${scrolled ? " co-scrolled" : ""}`}>
        <div className="co-navbar-inner">

          {/* Logo */}
          <Link className="co-logo" to="/">
            <img src="/assets/img/logo.png" alt="Club Orbit" />
          </Link>

          {/* Desktop links */}
          <ul className="co-nav-links">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to} className={isActive(to) ? "active" : ""}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="co-nav-right">

            {isLoggedIn ? (
              /* ── Avatar + dropdown ── */
              <div className="co-profile-wrap" ref={profileRef}>
                <div
                  className={`co-avatar-btn${profileOpen ? " open" : ""}`}
                  onClick={() => setProfileOpen((p) => !p)}
                  role="button"
                  aria-label="Profile menu"
                >
                  <img
                    src={avatarSrc || "/assets/img/profiles/avatar-05.jpg"}
                    alt={displayName}
                  />
                </div>

                <div className={`co-profile-dropdown${profileOpen ? " show" : ""}`}>
                  {/* User header */}
                  <div className="co-pd-header">
                    <img
                      src={avatarSrc || "/assets/img/profiles/avatar-05.jpg"}
                      alt={displayName}
                    />
                    <div className="co-pd-header-text">
                      <h6>{displayName}</h6>
                      <p>{authUser?.email}</p>
                      <Link to="/user-profile" onClick={() => setProfileOpen(false)}>
                        View Profile →
                      </Link>
                    </div>
                  </div>

                  {/* Memberships */}
                  {memberships.length > 0 && (
                    <div className="co-pd-memberships">
                      <div className="co-pd-memberships-label">Club Memberships</div>
                      {memberships.slice(0, 3).map((m, i) => (
                        <div key={i} className="co-pd-membership-item">
                          <span>🏠</span>
                          {m.club?.name || "Unknown Club"}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="co-pd-bottom">
                    <div className="co-pd-divider" />
                    <Link
                      className="co-pd-item"
                      to="/user-profile"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile Settings
                    </Link>
                    <Link
                      className="co-pd-item"
                      to="/activity"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      My Activity
                    </Link>
                    <div className="co-pd-divider" />
                    <a
                      className="co-pd-item co-logout"
                      href="#"
                      onClick={handleLogout}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Login button ── */
              <Link className="co-btn-login" to="/login">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Login
              </Link>
            )}

            {/* Hamburger (mobile only) */}
            <button
              className="co-hamburger"
              onClick={openMenu}
              aria-label="Open menu"
            >
              <span /><span /><span />
            </button>

          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="co-navbar-spacer" />

      {/* ══════════════ OVERLAY ══════════════ */}
      <div
        className={`co-overlay${menuOpen ? " active" : ""}`}
        onClick={closeMenu}
        onTouchEnd={(e) => { e.preventDefault(); closeMenu(); }}
        aria-hidden="true"
      />

      {/* ══════════════ MOBILE DRAWER ══════════════ */}
      <div
        className={`co-drawer${menuOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="co-drawer-header">
          <Link to="/" onClick={closeMenu}>
            <img src="/assets/img/logo.png" alt="Club Orbit" />
          </Link>
          <div
            className="co-drawer-close"
            onClick={closeMenu}
            role="button"
            aria-label="Close menu"
          >
            ✕
          </div>
        </div>

        {/* Logged-in user card */}
        {isLoggedIn && (
          <div className="co-drawer-user">
            <img
              src={avatarSrc || "/assets/img/profiles/avatar-05.jpg"}
              alt={displayName}
            />
            <div className="co-drawer-user-text">
              <h6>{displayName}</h6>
              <p>{authUser?.email}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <ul className="co-drawer-nav">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to} className={isActive(to) ? "active" : ""}>
              <Link to={to} onClick={closeMenu}>{label}</Link>
            </li>
          ))}
        </ul>

        {/* Footer buttons */}
        <div className="co-drawer-footer">
          {isLoggedIn ? (
            <>
              <Link
                className="co-drawer-btn secondary"
                to="/user-profile"
                onClick={closeMenu}
              >
                Profile Settings
              </Link>
              <Link
                className="co-drawer-btn secondary"
                to="/activity"
                onClick={closeMenu}
              >
                My Activity
              </Link>
              <a
                className="co-drawer-btn danger"
                href="#"
                onClick={(e) => { handleLogout(e); closeMenu(); }}
              >
                Logout
              </a>
            </>
          ) : (
            <>
              <Link className="co-drawer-btn primary" to="/login" onClick={closeMenu}>
                Login
              </Link>
              <Link className="co-drawer-btn secondary" to="/signup" onClick={closeMenu}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}