# EPITOMESTUDIO

A modern monorepo website built with Next.js, Sanity CMS, Tailwind CSS v4, and deployed on Cloudflare Pages.

## Project Structure

```
epitomestudio/
├── studio/              # Sanity Studio CMS
│   ├── schemaTypes/     # Content schemas
│   ├── sanity.config.ts
│   └── package.json
└── web/                 # Next.js frontend
    ├── src/
    │   ├── app/         # App Router pages
    │   ├── components/  # React components
    │   ├── lib/         # Utilities
    │   ├── queries/     # Sanity queries
    │   └── sanity/      # Sanity types
    └── package.json
```

## Quick Start

### Prerequisites

- Node.js 22.16.0 or higher
- npm or yarn

### 1. Install Dependencies

```bash
# Install studio dependencies
cd studio
npm install

# Install web dependencies
cd ../web
npm install
```

### 2. Configure Environment Variables

Create `web/.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=23z8qxu4
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
RESEND_API_KEY=your_resend_api_key_here
```

### 3. Start Development Servers

**Terminal 1 - Sanity Studio:**
```bash
cd studio
npm run dev
```
Studio will run at http://localhost:3333

**Terminal 2 - Next.js Website:**
```bash
cd web
npm run dev
```
Website will run at http://localhost:3000

## Features

- ✅ Next.js 16+ with App Router
- ✅ Sanity CMS v3 for content management
- ✅ Tailwind CSS v4 with modern CSS configuration
- ✅ TypeScript throughout
- ✅ Edge Runtime support for Cloudflare Pages
- ✅ Contact form with Resend email integration
- ✅ SEO optimization (sitemap, robots.txt, metadata)
- ✅ Responsive images with Next.js Image
- ✅ Portable Text rendering

## Content Types

### Pages
Generic pages with title, slug, description, image, and rich text content.

### Posts
Blog posts with title, slug, author, description, image, and rich text content.

## Deployment

### Deploy Sanity Studio

```bash
cd studio
npm run deploy
```

Your studio will be available at https://epitomestudio.sanity.studio

### Deploy to Cloudflare Pages

1. Push code to GitHub: https://github.com/uncle-brother-son/epitomestudio
2. Connect repository to Cloudflare Pages
3. Configure build settings:
   - Framework preset: None
   - Build command: `cd web && npx @cloudflare/next-on-pages`
   - Build output directory: `web/.vercel/output/static`
   - Root directory: `/`
   
4. Add environment variables in Cloudflare:
   ```
   NODE_VERSION=22
   NEXT_PUBLIC_SANITY_PROJECT_ID=23z8qxu4
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
   RESEND_API_KEY=your_api_key
   ```

5. Add compatibility flag: `nodejs_compat`

## Email Configuration (Resend)

1. Sign up at https://resend.com
2. Get your API key
3. Update `/web/src/app/api/contact/route.ts`:
   - Change `from` email to your verified domain
   - Change `to` email to your recipient address
4. Add `RESEND_API_KEY` to `.env.local` and Cloudflare environment variables

## Development Workflow

1. Create content in Sanity Studio (http://localhost:3333)
2. View content on the website (http://localhost:3000)
3. Push changes to GitHub
4. Cloudflare Pages auto-deploys

## Key Commands

### Studio
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run deploy   # Deploy to Sanity hosting
```

### Web
```bash
npm run dev            # Start dev server
npm run build          # Build for production
npm run pages:build    # Build for Cloudflare Pages
npm run pages:deploy   # Deploy to Cloudflare
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **CMS**: Sanity v3
- **Styling**: Tailwind CSS v4
- **Hosting**: Cloudflare Pages (Edge)
- **Email**: Resend
- **Images**: Next.js Image + Sanity CDN

## GitHub Repository

https://github.com/uncle-brother-son/epitomestudio

## Sanity Project

- Project ID: `23z8qxu4`
- Dataset: `production`

## Notes

- All dynamic routes use Edge Runtime for Cloudflare compatibility
- Link prefetching is disabled (`prefetch={false}`) to reduce edge function calls
- Tailwind CSS v4 configuration is in CSS using `@theme` directive
- Images are optimized through Sanity CDN and Next.js Image component

## Support

For issues or questions, please open an issue on the GitHub repository.
