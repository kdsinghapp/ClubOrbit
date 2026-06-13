import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

function normalizeHtmlLinks(html) {
  // Make sure any remaining relative asset references work from nested routes.
  // (Most are already fixed during extraction, but keep this as a safety net.)
  return String(html || "")
    .replaceAll('src="assets/', 'src="/assets/')
    .replaceAll("src='assets/", "src='/assets/")
    .replaceAll('href="assets/', 'href="/assets/')
    .replaceAll("href='assets/", "href='/assets/")
    .replaceAll("url(assets/", "url(/assets/");
}

export default function RawHtmlPage({ html }) {
  const navigate = useNavigate();

  const safeHtml = useMemo(() => normalizeHtmlLinks(html), [html]);

  useEffect(() => {
    // Run template init after the HTML is mounted.
    const t = setTimeout(() => {
      if (typeof window.__clubOrbitSpaInit === "function") window.__clubOrbitSpaInit();
    }, 0);
    return () => clearTimeout(t);
  }, [safeHtml]);

  function onClickCapture(e) {
    const a = e.target?.closest?.("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    // Skip special/absolute links
    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#") ||
      href.startsWith("javascript:")
    ) {
      return;
    }

    // Only intercept local .html navigations
    if (!href.toLowerCase().endsWith(".html")) return;

    e.preventDefault();

    const base = href.split("/").pop();
    const name = base.replace(/\.html$/i, "");

    if (name === "index") navigate("/");
    else navigate(`/${name}`);
  }

  return (
    <div
      onClickCapture={onClickCapture}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
