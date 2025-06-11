# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Firebase Setup

Authentication and play storage now use Firebase. Copy `.env.example` to `.env` and set the following environment variables with your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

All of these variables are required. The application will throw an error on
startup if any values are missing.

Run `npm run setup` (or `npm ci`) to install all dependencies, then start the dev server with `npm run dev`.

Lint the project with `npm run lint`.

## Print Options

Use the `Print` button in the playbook library to open the `PrintOptionsModal`.
Choose between wristband, playsheet or playbook layouts and configure play
titles and numbers. The `PrintWrapper` component can be used to apply a
`print-ready` class to the page before calling `window.print()` so that any
`@media print` styles are applied.


## License

This project is licensed under the [MIT License](LICENSE).
