# Seisen Premium

Seisen Premium is a modern software and file distribution platform built with **Next.js (App Router)**, **Tailwind CSS**, and **Supabase**. It provides an intuitive interface for browsing, managing, and downloading categorized files, software, and games.

## Features

- **Categorized Browsing**: Files are organized into distinct categories (Windows, Adobe, Utilities, Games, Microsoft Office, etc.) with a clean grid layout.
- **Bundles & Standalone Files**: Download individual files or access curated bundles containing multiple related files.
- **Search Functionality**: Quickly find the software or game you need using the built-in search features.
- **Role-Based Authentication**:
  - Secure **email-based login** via Supabase Auth.
  - **User Role**: Standard access to browse and download files.
  - **Admin Role**: Elevated credentials allowing access to the Admin Dashboard.
- **Comprehensive Admin Dashboard**:
  - Manage all files, apps, and games.
  - Create and edit software bundles.
  - Add or revoke user access seamlessly.

## Tech Stack

- **Frontend Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4
- **Database & Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage Bucket (for file/software images)
- **Deployment**: Vercel ready

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Setup

Create a `.env.local` file in the root directory and add your Supabase credentials to connect the application to your backend:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
