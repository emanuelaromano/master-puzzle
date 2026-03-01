# Master Puzzle

Master Puzzle is a web app that turns random paintings from the Met Museum into drag-and-drop jigsaw puzzles.

## Functionality

- **Artwork source**: Random paintings from the [Met Museum API](https://metmuseum.github.io/) (departments 11 & 21). Object IDs cached in localStorage.
- **Puzzle generation**: Each image is split into irregular pieces via Voronoi diagram (d3-delaunay). Seeded by artwork ID for stable layout.
- **Image loading**: Images are loaded through a backend image proxy (FastAPI) to avoid CORS; primary and fallback (small) URLs are tried.
- **Drag and drop**: Pieces are draggable on the left; drop on the right-side silhouette to place. Magnetic snap: pieces snap when dropped inside or near the correct slot.
- **Progress**: Placed pieces are persisted in localStorage per puzzle seed. Completed puzzle shows the full image and a “Well done!” card with artwork title, artist, country, and date.
- **New puzzle**: Navbar refresh button (hidden when puzzle is complete). “Try another” on the completion screen. Button disabled while loading.
- **Routing**: Single main route; 404 and error (e.g. failed image load) views with “Go home” and optional “Try again”.

## Stack

- **Client**: React, Vite, TypeScript, MUI, React Router. Deployed to Firebase Hosting.
- **Server**: FastAPI, image-proxy only. Deployed to Google Cloud Run.
