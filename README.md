# Master Puzzle

Master Puzzle is a web app that turns random paintings from the Met Museum into drag-and-drop jigsaw puzzles.

## Functionality

- **Artwork**: Each puzzle uses a random painting from the [Met Museum collection](https://metmuseum.github.io/).
- **Puzzle**: The image is cut into irregular pieces. You drag pieces on the left and drop them into the outline on the right; they snap into place when close enough.
- **Progress**: Your progress is saved. When you finish, you see the full image and details (title, artist, country, date).
- **New puzzle**: Use the refresh icon in the header to get another painting, or “Try another” on the completion screen. The button is disabled while a puzzle is loading.
- **Errors**: If a page isn’t found or an image fails to load, you get a simple message with “Go home” and, when relevant, “Try again”.

## Stack

- **Client**: React, Vite, TypeScript, MUI, React Router. Deployed to Firebase Hosting.
- **Server**: FastAPI, image-proxy only. Deployed to Google Cloud Run.
