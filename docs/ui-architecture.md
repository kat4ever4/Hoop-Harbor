# UI Architecture

This guide outlines the webpage interface for software development.
This document outlines the UI conventions, component hierarchy, and data flow patterns used across the /app/recruits routes.
The UI heavily leverages the Next.js App Router paradigm, strictly separating React Server Components (RSCs) for data fetching and Client Components for interactivity.

## Login

## Home

## Recruits
/app/recruits
├── page.tsx (Server) -> Fetches access & lists recruits
│   ├── <AccessNotice>
│   └── <RecruitTable> (Client) -> Handles filtering & responsive layouts
│
├── [id]/page.tsx (Server) -> Fetches single recruit profile
│   ├── <AccessNotice>
│   └── <Profile> (Server) -> Layout for the detail view
│       ├── <Card>, <Row>, <Links> (Server) -> UI primitives
│       └── <StatusSection> (Client) -> Complex interactive modals & state
│
└── [id]/edit/page.tsx (Server) 
    └── <RecruitForm> (Client) -> Handles mutations & optimistic locking

1. Server-Driven UI & Streaming (<Suspense>)
- We use React 19 / Next.js 15 streaming to prevent slow database queries from blocking the initial page load.
- Pattern: The outer page (e.g., RecruitsPage) renders the <SiteNav> and a <Suspense> boundary immediately.
- Execution: Data-fetching logic is isolated in an inner asynchronous component (e.g., <RecruitList> or <ProfileContent>).
- Rule: Never fetch data in the root page component. Always isolate it in a wrapped child component so the page shell renders instantly.

2. Client-Side Interactivity Boundaries
- We keep the 'use client' boundary as low in the tree as possible to maximize performance and SEO.
- Tables & Forms: Components like <RecruitTable> and <RecruitForm> are Client Components because they require useState, useMemo, and DOM event handling.
- Layouts & Text: The <Profile> detail view remains a Server Component because it merely displays text. We only drop into a Client Component for the <StatusSection>, which requires buttons and modals.

3. Responsive Data Displays (Dual-Layout)
- Data-heavy views adapt to screen sizes using CSS rather than JavaScript window listeners.
- Desktop (sm:block): Standard <table> elements with <thead/> and <tbody/>.
- Mobile (sm:hidden): Stacked UI cards (<div/> or <ul/>) optimized for vertical scrolling and touch targets.
- Reference: See <RecruitTable> and the offers/visits tables in <StatusSection>.

4. Advanced Form Handling & Concurrency
- The <RecruitForm> uses useActionState to interface with Next.js Server Actions. It is built to handle multi-user collision (Optimistic Locking).
- State Preservation: We use onSubmit with event.preventDefault() to manually dispatch the FormData. This ensures that if the server returns a validation error, the browser does not wipe the user's typed inputs.
- Optimistic Locking: If two coaches edit a recruit simultaneously, the server returns a state.conflict. The UI surfaces a specific amber alert box allowing the user to merge their changes ("Save my changes too").

Component Reference
<RecruitTable>
- Role: Displays the directory of recruits.Key Mechanics:
- Uses useMemo for client-side filtering (Search, Grad Year, Position).
- Renders a StarsPlaceholder and hardcoded status badges. (Note: These are awaiting F3 schema updates).

<RecruitForm>
- Role: Creates or updates a recruit profile.Key Mechanics:
- Utilizes customized <Section> and <Field> wrapper components to standardize spacing and label typography.
- Handles <DuplicateDialog> to warn coaches if they are adding a recruit that already exists.

<StatusSection>
- Role: Manages the CRM pipeline (Stages, USNA Offers, Other Offers, Visits).Key Mechanics:
- Deeply interactive. Uses localized state (e.g., isAddingUsnaOffer, isAddingVisit) to toggle inline editing and modal dialogs.
- Validates that all required fields are populated before enabling the "Save" button.

## Staff

## Settings
