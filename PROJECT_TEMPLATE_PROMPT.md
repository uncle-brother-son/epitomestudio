# Project Setup: Next.js + Sanity CMS + Tailwind + Cloudflare Pages

Create a monorepo project with the following structure and configuration:

## Project Structure
```
project-root/
├── studio/              # Sanity Studio
│   ├── sanity.config.ts
│   ├── sanity.cli.ts
│   ├── package.json
│   ├── schemaTypes/
│   └── structure.ts
└── web/                 # Next.js frontend
    ├── src/
    │   ├── app/
    │   ├── sanity/
    │   └── styles/
    ├── next.config.ts
    ├── tailwind.config.js
    ├── package.json
    └── .env.local
```

## Sanity Studio Setup

**studio/package.json dependencies:**
- sanity@latest (v5+)
- @sanity/vision@latest
- @sanity/icons@latest
- sanity-plugin-media@latest
- react@latest
- react-dom@latest
- styled-components@latest

**studio/sanity.config.ts:**
- Use `structureTool` with custom structure
- Include `visionTool()` for GraphQL/GROQ testing
- Include `media()` plugin for media management
- Configure projectId and dataset

**studio/sanity.cli.ts:**
- Add deployment.autoUpdates: true
- Include appId in deployment config (will be generated on first deploy)

## Next.js Web App Setup

**web/package.json dependencies:**
- next@latest (v16+)
- react@latest (v19+)
- react-dom@latest
- @sanity/client@latest
- @sanity/image-url@latest
- @portabletext/react@latest
- framer-motion@latest
- next-view-transitions@latest

**web/next.config.ts:**
- Configure Sanity CDN as remote image pattern: `cdn.sanity.io`
- Set `minimumCacheTTL` for image caching
- NO static export - use full Next.js features

**All dynamic routes must include:**
```typescript
export const runtime = 'edge';
```

**Key features:**
- App Router (not Pages Router)
- TypeScript
- Server Components by default
- Edge Runtime for dynamic routes (required for Cloudflare)
- Disable Link prefetching: `<Link prefetch={false}>`

## Tailwind CSS Configuration (v4 - Latest)

**Use Tailwind CSS v4+ with the new configuration approach:**

**web/src/app/globals.css:**
```css
@import "tailwindcss";

@theme {
  /* Custom colors */
  --color-primary: #your-color;
  --color-secondary: #your-color;
  
  /* Custom fonts */
  --font-sans: "Your Font", sans-serif;
  
  /* Custom spacing, breakpoints, etc. */
  --breakpoint-3xl: 1920px;
}

@layer components {
  /* Your component styles */
}

@layer utilities {
  /* Your utility classes */
}
```

**web/package.json:**
- Add `tailwindcss@next` (v4+)
- Remove `autoprefixer` (no longer needed in v4)
- Keep `postcss`

**web/postcss.config.js:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
  },
};
```

**No tailwind.config.js/ts file needed** - configuration is done via CSS `@theme` directive.

**Key differences from v3:**
- Configuration in CSS using `@theme` instead of JS config file
- Import via `@import "tailwindcss"` instead of three separate @tailwind directives
- Native CSS custom properties instead of JavaScript config
- Faster builds with new Rust-based engine
- Automatic content detection (no need to specify paths)

**Migration notes:**
- If you need v3 for compatibility, use `tailwind.config.ts` with TypeScript
- Content paths: `content: ['./src/**/*.{js,ts,jsx,tsx,mdx}']`
- Use `@layer` directives for custom styles in both v3 and v4

## Sanity Integration

**web/src/sanity/types.ts:**
- Define TypeScript interfaces for all Sanity document types
- Include image asset types, portable text types

**web/src/lib/sanityClient.ts:**
- Configure client with projectId, dataset, apiVersion
- Set useCdn: true for production
- Use @sanity/client v7+

**web/src/queries/:**
- Create separate query files for each document type
- Use GROQ queries
- Include proper TypeScript return types

## Email Integration (Resend)

**Installation:**
```bash
cd web && npm install resend
```

**Environment Variables (.env.local):**
```
RESEND_API_KEY=re_your_api_key_here
```

**API Route - web/src/app/api/contact/route.ts:**
```typescript
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email
    const data = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // Use your verified domain
      to: 'your-email@example.com',
      replyTo: email,
      subject: `New contact form submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
```

**Client Component Example - web/src/app/components/contactForm.tsx:**
```typescript
'use client';

import { useState, FormEvent } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>

      {status === 'success' && (
        <p className="text-green-600">Message sent successfully!</p>
      )}
      {status === 'error' && (
        <p className="text-red-600">Failed to send message. Please try again.</p>
      )}
    </form>
  );
}
```

**Resend Setup Steps:**
1. Sign up at https://resend.com
2. Get API key from dashboard
3. Verify your domain (or use `onboarding@resend.dev` for testing)
4. Add RESEND_API_KEY to both .env.local and Cloudflare Pages environment variables
5. Update `from` address and `to` address in route.ts

**Edge Runtime Compatibility:**
- Resend SDK is fully compatible with Edge Runtime
- Uses fetch API under the hood
- No Node.js-specific dependencies

**Free Tier Limits:**
- 100 emails per day
- 3,000 emails per month
- Perfect for contact forms

## Cloudflare Pages Deployment

**Build Configuration:**
- Framework preset: Next.js (Static HTML Export)
- Build command: `npm run build`
- Build output directory: `out`
- Root directory: `web`
- Functions directory: `functions` (auto-detected)

**Environment Variables (Production):**
- SANITY_STUDIO_API_PROJECT_ID
- SANITY_STUDIO_DATASET
- NEXT_PUBLIC_SANITY_PROJECT_ID
- NEXT_PUBLIC_SANITY_DATASET
- RESEND_API_KEY (if using email)
- NODE_VERSION=22

**Required Settings:**
- Compatibility flags: `nodejs_compat`
- No deploy command (auto-deploys after build)

**Critical for Edge Runtime:**
- All dynamic routes MUST export `const runtime = 'edge'`
- Cannot use `generateStaticParams` with edge runtime
- Remove any Node.js-specific APIs

## SEO & Performance

**Metadata:**
- Generate dynamic metadata for each page
- Include OpenGraph and Twitter cards
- Canonical URLs
- Structured data (JSON-LD)

**Images:**
- Use Next.js Image component
- Optimize sizes attribute: `100vw, (min-width: 768px) 33vw` format
- Set appropriate loading priority
- Use Sanity image URLs with @sanity/image-url

**robots.txt & sitemap.xml:**
- Create as route handlers in app directory
- Use edge runtime
- Dynamic sitemap from Sanity content

## Additional Configurations

**wrangler.toml (optional in web/):**
- name, compatibility_date
- pages_build_output_dir

**.node-version (root):**
- 22.16.0

**Git setup:**
- Separate .gitignore in studio/ and web/
- Ignore .env.local, node_modules, .next, out

## Development Workflow

1. Install dependencies: `npm install` in both studio/ and web/
2. Start Sanity Studio: `cd studio && npm run dev` (runs on port 3333)
3. Start Next.js: `cd web && npm run dev` (runs on port 3000)
4. Deploy Studio: `cd studio && npx sanity deploy`
5. Deploy Web: Push to GitHub → auto-deploys to Cloudflare Pages

## Key Patterns

**Disable prefetching everywhere:**
All `<Link>` components should have `prefetch={false}` to reduce edge function requests.

**Image loading:**
- First 2-3 images: `loading="eager"`
- Rest: `loading="lazy"`

**Error handling:**
- Use `notFound()` from next/navigation for 404s
- Proper TypeScript null checks

Create this exact structure with these configurations for a production-ready Next.js + Sanity + Cloudflare setup.
