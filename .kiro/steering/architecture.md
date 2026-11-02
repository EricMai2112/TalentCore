---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 
# Architecture

## Architecture Style

TalentCore uses a **Modular Monolith architecture**.

The backend is deployed and runs as a single NestJS application, while business domains are separated into independent modules.

The system is NOT a microservices architecture.

## Modular Boundaries

Each business domain should be encapsulated inside its own NestJS module.

Current domains include:
- Auth
- Users
- Candidates
- Skills
- Departments
- Positions
- Job Descriptions
- Pipeline Templates
- Email Templates
- Applications
- Interviews
- Offers
- AI Evaluation

The actual implemented modules must always be verified against the existing codebase.

## Module Structure

Each module should generally contain:

```text
<module>/
├── controllers/
├── services/
├── schemas/
├── dtos/
└── <module>.module.ts