# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Supabase setup

1. Create or select a Supabase project that you own.
2. Copy `.env.example` to `.env`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project's API settings. The anon/publishable key is intended for browser use; never put a `service_role` key or database password in frontend environment variables.
4. Apply the SQL files in `supabase/migrations/` to the project, in filename order, or run the complete `supabase/schema.sql` for a new project.
5. Restart the Vite dev server after changing `.env`.

The profiles migration creates profiles from Supabase Auth metadata via a database trigger, including when email confirmation is enabled. Apply all migrations before testing signup.

The local `.env` file is ignored by Git and is not included in pull/push. Each developer must configure their own project credentials on their device. Authentication uses Supabase Auth; account settings and identity-verification data are stored in owner-restricted tables.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
