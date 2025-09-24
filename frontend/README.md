# Gifty Frontend

This is the frontend application for Gifty, built with React, Vite, Firebase, and Tailwind CSS.

---

## Tech Stack

| Technology | Purpose                  |
|------------|--------------------------|
| React      | UI library               |
| Vite       | Build tool and dev server|
| Firebase   | Authentication & backend |
| Tailwind   | Styling framework        |

---

## Features

- Responsive UI for desktop and mobile
- Route protection with Firebase Authentication
- Google login integration
- Wishlist management with real-time updates
- Toast notifications for user feedback

---

## Setup

1. Clone the repository and navigate to the `/frontend` folder
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in `/frontend` with the following variables:

   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id

   VITE_API_BASE_URL=https://your-backend-api-url
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

---

## Connecting to Backend

The frontend communicates with the backend API via the base URL specified in `VITE_API_BASE_URL`. Make sure your backend is running and accessible.

---

## Testing

Testing is planned with:

- **Vitest** for unit and integration tests
- **Playwright** for end-to-end testing

---

## CI/CD

Continuous integration and deployment pipelines are configured using GitHub Actions. Deployments target staging and production environments hosted on Azure.

---

## Contributing

Contributions are welcome! Please follow the established code style and submit pull requests for review.

---

Thank you for using Gifty!
