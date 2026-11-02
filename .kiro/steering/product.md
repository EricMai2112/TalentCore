# TalenCore — Product Overview

TalenCore is an **Applicant Tracking System (ATS)** that manages the full hiring lifecycle for organizations.

## Two User Worlds

**HR/Admin Portal** (`frontend-admin`, port 3000) — for internal staff:
- HR Admins: full access to all features
- Department Managers: create job requisitions, view interviews
- Employees: view their assigned interviews

**Candidate Portal** (`frontend-candidates`, port 3001) — for job seekers:
- Browse and filter published job listings
- Apply to open positions
- Receive real-time notifications when new jobs go live

## Core Domain Features

- **Job Descriptions** — requisitions flow through statuses: `PENDING → APPROVED → JD_CREATED` (published)
- **Pipeline Templates** — configurable recruitment stages (name, order, color) reused per job
- **Kanban Board** — move candidates through pipeline stages visually
- **Candidates** — applicant profiles and application tracking
- **Interviews** — scheduling and management
- **Offers** — offer letter generation and tracking
- **Email Templates** — typed templates (`INTERVIEW_INVITATION`, `OFFER_LETTER`, `REJECTION`, `CUSTOM`) with placeholder variables
- **Settings** — manage departments, positions, skills, users, pipeline templates, email templates

## Real-Time
When a JD reaches `JD_CREATED` status, a WebSocket event (`job_published`) is broadcast to the candidate portal, triggering a live notification banner.

## Language
All user-facing strings, UI labels, validation messages, and error messages are written in **Vietnamese**.

## Mobile Apps
`mobile-admin` and `mobile-candidates` exist but are currently early-stage Expo scaffolds with no real feature implementation.

## AI Features

TalentCore includes AI-assisted features to reduce HR manual work and improve candidate screening.

Current/planned AI capabilities include:
- AI CV Parsing: extract structured candidate information from CV content.
- AI Candidate Matching: evaluate candidate suitability against Job Description requirements using configurable criteria, weights and scoring rubrics.

AI provides decision support and does not replace the final decision of HR or hiring managers.