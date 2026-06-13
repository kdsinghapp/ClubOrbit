# Club Orbit (React)

Converted from the provided HTML template into a React + Vite project.

## What was done

- Each original `*.html` page was extracted into a React route:
  - `/` (index)
  - `/login`, `/signup`
  - `/activity`, `/add-activity`
  - `/people`, `/places`
  - `/chat`, `/event`
  - `/user-profile`, `/user-setting-password`, `/view-club`
- Assets were moved to `public/assets` so the template paths keep working.
- `.html` navigation links are intercepted and routed through React Router.
- Legacy JS plugins are loaded after page render to avoid DOM-ready errors.
- Pages referenced by nav but missing from the ZIP are provided as placeholders.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
