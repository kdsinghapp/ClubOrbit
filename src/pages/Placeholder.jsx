export default function Placeholder({ title }) {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>{title}</h1>
      <p style={{ marginTop: 12, lineHeight: 1.5 }}>
        This page is referenced by the template navigation, but its HTML file was not included in the source ZIP.
      </p>
    </div>
  );
}
