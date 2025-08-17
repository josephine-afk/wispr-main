# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack for faster builds
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Architecture

This is a Next.js 15.4.6 application using the App Router pattern with TypeScript and Tailwind CSS v4.

### Key Directories
- `app/` - App Router pages and layouts
- `public/` - Static assets served directly

### Tech Stack
- **Next.js 15.4.6** with App Router
- **React 19.1.0** 
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** configured via PostCSS plugin
- **ESLint 9** with flat configuration format

### Path Aliases
- `@/*` maps to the root directory

## Frontend Component Standards

When creating components:

1. **Structure**: 
   - Props interface/type at the top
   - Named component export
   - Styles at the bottom

2. **Styling**:
   - Use Tailwind CSS utility classes
   - Avoid inline styles
   - Dark mode is supported via CSS media queries

3. **Accessibility**:
   - Include appropriate aria-* attributes

4. **Fonts**:
   - Geist Sans and Geist Mono are available via CSS variables
   - Applied through `font-[family-name:var(--font-geist-sans)]`

## Development Notes

- Turbopack is enabled for faster development builds
- The project uses the latest versions of all major dependencies
- Use context7 for documentation lookups when needed