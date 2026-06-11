# SKILL.md — PRIM AI Institute Dev Skills

## Design System
- Background: #020818 (--navy) always
- Accent: #00D4FF (--electric) for labels, borders, focus
- CTA: linear-gradient(--orange, --orange2) pill button
- Cards: glassmorphism (rgba white ~4.5% + blur)
- Fonts: Space Grotesk (headings) / Plus Jakarta Sans (body)
- No white backgrounds, no UI libraries

## Validation (Indian context)
- Phone: /^[6-9]\d{9}$/ — 10-digit Indian mobile
- Name: 2–50 chars
- Message: 10–500 chars

## API Conventions
- All routes prefixed /api
- Public: POST /api/bookings, POST /api/enquiries, GET /api/settings/public
- Protected (Bearer JWT): all /api/admin/* routes

## Enums (must match Prisma)
Profile: SCHOOL_STUDENT | COLLEGE_STUDENT | WORKING_PROFESSIONAL | BUSINESS_OWNER | OTHER  
Course: LEVEL_1_FOUNDATION | LEVEL_2A_GENERALIST | LEVEL_2B_DEVELOPER | NOT_SURE  
LeadStatus: NEW | CONTACTED | CONVERTED | LOST
