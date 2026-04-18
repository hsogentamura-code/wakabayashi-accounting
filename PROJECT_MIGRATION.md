# Wakabayashi West Web - Project Migration Guide

## Project Overview
This project is a Next.js (App Router) application managed with MicroCMS for the Wakabayashi West Neighborhood Association.
It includes a public-facing site and an admin dashboard (`/admin`) for content management.

## Current Status (2026/02/19)
The project is currently focused on enhancing the Admin Dashboard to support full content management (CRUD) and ensuring the user-facing site reflects these changes.

### Recently Implemented Features
1. **User-Side Pagination**:
   - Implemented pagination (5 items per page) for News (`/news`) and Resources (`/about`).
   - Uses `src/components/ui/Pagination.tsx` (shared component).

2. **"Important" Flag Display**:
   - Added `! 重要` (Red, Bold) flag to News items on the user-facing site (List & Detail views).

3. **Admin Dashboard Improvements**:
   - **Delete Functionality**: Fixed `DeleteButton` to correctly pass `title` prop for confirmation dialogs.
   - **Tag/Category Styling**: Updated Admin list views (News, Events, Resources) to match the visual style (colors/shapes) of the public site.
   - **Sorting**: Admin lists are now sorted by `publishedAt` (descending) to show newest items first.

4. **API Updates**:
   - Added `deleteContent` to `src/lib/microcms-mgmt.ts`.
   - Created API routes at `src/app/api/admin/[type]/[id]/route.ts` handling `PATCH` and `DELETE`.

## Remaining Tasks (To Do Next)
The following tasks were in progress or planned:

1. **Admin Edit Pages**:
   - **News**: `src/app/admin/(dashboard)/news/edit/[id]/page.tsx` (Partially implemented/To be verified).
   - **Resources**: `src/app/admin/(dashboard)/resources/edit/[id]/page.tsx` (Not started).
   - **Events**: `src/app/admin/(dashboard)/events/edit/[id]/page.tsx` (Not started).

2. **Dashboard Navigation**:
   - Update `src/app/admin/(dashboard)/page.tsx` links to point to the new List pages (`/admin/news`, etc.) instead of the "Create New" pages.

3. **Verification**:
   - Verify the Edit functionality for all content types once implemented.

## Technical Context
- **Framework**: Next.js 15+ (App Router)
- **CMS**: MicroCMS
- **Styling**: CSS Modules (`*.module.css`) + Global CSS variables
- **Data Fetching**:
  - `src/lib/data.ts`: Public data fetching (cached).
  - `src/lib/microcms-mgmt.ts`: Management data fetching/mutating (no-store).
- **Environment Variables**:
  - `MICROCMS_SERVICE_DOMAIN`
  - `MICROCMS_API_KEY` (Public/Get-only)
  - `MICROCMS_MGMT_API_KEY` (Management/Write access)

## How to Resume
1. Open the project folder (renamed to `wakabayashi-west-web` or similar).
2. Run `npm run dev`.
3. Check `task.md` (if available) or this file to pick up the remaining tasks.
