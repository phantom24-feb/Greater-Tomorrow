# Greater Tomorrow Secondary School

A Next.js school portal for public school information, student registration,
student results, tuition, books, accounts, and administration.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The development script uses Next.js Turbopack for faster local compilation.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Create a production build with:

```bash
npm run build
npm run start
```

## Performance and Architecture Changes

- Public session checks use Supabase `getSession()` where only local session
	state is needed, avoiding unnecessary remote authentication requests during
	public page rendering.
- Middleware is limited to protected route patterns and protected layouts still
	perform authoritative user checks before serving private data.
- The homepage announcement query uses `unstable_cache` with a one-hour
	(`3600` second) revalidation period. Private, user-specific queries remain
	uncached to prevent data from being shared between sessions.
- Results and student roster interaction tables are loaded with
	`next/dynamic`, keeping their client-side code out of the initial server
	page bundle until those sections are rendered.
- Real image elements use `next/image` with explicit dimensions. Local upload
	previews remain unoptimized because they use browser blob URLs.
- Pages and layouts that require forms, state, uploads, navigation handlers, or
	print controls remain client components. Server-renderable data pages retain
	their existing route and component architecture.
- The splash screen displays on the first page load or browser refresh, but not
	during back/forward navigation, and its content is centered responsively on
	mobile screens.
- The school branding is consistently named “Greater Tomorrow Secondary
	School.”
- TypeScript relation casts, JSX text escaping, initial data-loading lint
	errors, and client navigation links were corrected without changing the UI.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
