---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 
# AI Features Specification & Implementation Steering

This document defines the rules and architecture for AI features in
TalentCore.

The system currently focuses on two major AI capabilities:

1. AI Resume Parsing
2. AI Candidate Evaluation

AI features must provide real business value, reduce manual HR work,
and provide explainable decision support.

---

# 1. AI Resume Parsing

## 1.1 Purpose

AI Resume Parsing helps candidates populate their structured CV/profile
more quickly.

The flow is:

CV/content provided by candidate
→ AI Parsing
→ Structured JSON
→ Backend validation
→ Candidate Review
→ Candidate Edit
→ Candidate Confirmation
→ Candidate database

AI must NOT directly persist extracted data into the Candidate document.

The Candidate must review and confirm AI-generated/extracted information
before it becomes official profile data.

The structured Candidate profile is the source of truth.

---

## 1.2 Supported Candidate Sections

The parser should support:

- Personal information
- Professional headline
- Summary
- Skills
- Experiences
- Educations
- Projects
- Certifications
- Languages
- Custom sections

Custom sections are required because candidates may have additional
sections such as:

- Awards
- Publications
- Volunteer Experience
- Leadership
- Activities
- Achievements
- Other custom sections

---

## 1.3 AI Parsing Rules

AI MUST:

- Extract only information supported by the provided input.
- Never fabricate candidate information.
- Never invent skills, companies, positions, dates, degrees,
  certifications, achievements or project details.
- Return null/empty values when information is unavailable.
- Preserve the original meaning of the candidate's information.
- Identify uncertain information where possible.
- Return structured output that can be validated by the backend.

AI MUST NOT:

- Invent missing information.
- Automatically save extracted data.
- Change candidate data without confirmation.
- Convert uncertain information into a definite fact.

---

## 1.4 Structured AI Output

The AI parser should return structured JSON.

Example:

{
  "headline": "Full-Stack Developer",
  "summary": "...",

  "skills": [
    {
      "name": "ReactJS",
      "proficiency": "ADVANCED",
      "yearsOfExperience": 2
    }
  ],

  "experiences": [
    {
      "company": "FPT Software",
      "position": "Frontend Developer Intern",
      "startDate": "2025-06-01",
      "endDate": "2025-12-31",
      "description": "...",
      "technologies": ["React", "TypeScript"]
    }
  ],

  "educations": [],
  "projects": [],
  "certifications": [],
  "languages": [],

  "customSections": [],

  "uncertainFields": []
}

The exact schema must follow the current Candidate DTO/schema.
Do not create a second incompatible Candidate data model.

---

## 1.5 AI Provider

AI provider-specific code must be isolated behind a backend service
or adapter.

Business modules must not depend directly on a specific AI SDK.

The frontend must never call the AI provider directly.

AI credentials and API keys must remain on the backend.

---

# 2. AI Candidate Evaluation

## 2.1 Purpose

AI Candidate Evaluation helps HR quickly understand how well a candidate
matches a Job Description.

The system evaluates:

Candidate structured profile
+
Job Description requirements
+
HR-configured evaluation criteria
+
Weights
+
Scoring rubric

The AI provides evidence-based evaluation and decision support.

AI does not make the final hiring decision.

---

# 2.2 Evaluation Criteria

HR may configure criteria such as:

- Skills
- Experience
- Education
- Certifications
- Projects
- Languages
- Other job-specific criteria

Each criterion may have a weight.

Example:

Skills = 35%
Certifications = 30%
Projects = 35%

Sub-criteria may also have weights.

Example:

Skills = 35%

Within Skills:

ReactJS = 40%
NextJS = 30%
MongoDB = 10%
Docker = 10%
AWS = 10%

Sub-criteria weights must total 100% within their parent criterion.

---

## Match Score Rubric

The AI evaluates each criterion from 0 to 100 using evidence found
in the candidate's structured profile.

The scoring rubric is:

| Score | Evidence Level |
|------:|----------------|
| 0 | Không có thông tin liên quan |
| 20 | Có đề cập gián tiếp nhưng chưa đủ bằng chứng |
| 40 | Có liệt kê kỹ năng nhưng chưa chứng minh việc sử dụng |
| 60 | Có sử dụng trong học tập hoặc dự án cá nhân |
| 80 | Có sử dụng trong dự án thực tế, sản phẩm hoặc công việc và mô tả rõ vai trò |
| 100 | Có bằng chứng rất rõ về mức độ đáp ứng và phù hợp cao với JD; có thể kèm kết quả, số liệu, sản phẩm, Demo hoặc GitHub |

The AI must evaluate based on evidence rather than simply checking
whether a keyword exists.

Evidence should be gathered from all relevant candidate sections,
including:

- Skills
- Experiences
- Projects
- Educations
- Certifications
- Languages
- Custom Sections

Context matters.

Example:

ReactJS appears only in the Skills section:

→ weaker evidence.

ReactJS appears in a Project:

→ stronger evidence.

ReactJS appears in Work Experience with relevant responsibilities:

→ stronger evidence.

ReactJS appears in multiple relevant projects and professional
experience:

→ very strong evidence.

The AI should explain why the evidence supports the assigned score.

---

# 2.5 Weight Calculation

AI should evaluate evidence and produce Match Scores.

Deterministic mathematical calculations must be performed by backend
business logic.

Example:

ReactJS parent contribution:

Skills = 35%
ReactJS = 40%

ReactJS maximum contribution:

35 × 40% = 14 points

If ReactJS Match Score = 90:

90 / 100 × 14 = 12.6 points

The backend must perform this calculation.

The LLM must not be trusted to perform final score aggregation.

---

# 2.6 AI Evaluation Output

The evaluation should provide:

- Overall Match Score
- Category scores
- Sub-criteria scores
- Score contributions
- Evidence
- Key strengths
- Potential gaps
- Missing mandatory requirements
- Recommendation
- Evaluation timestamp
- Evaluation version when applicable

Example conceptual structure:

{
  "overallScore": 82,

  "criteria": [
    {
      "name": "Skills",
      "weight": 35,
      "score": 88,
      "contribution": 30.8,

      "subCriteria": [
        {
          "name": "ReactJS",
          "weight": 40,
          "matchScore": 90,
          "evidence": [
            "Used ReactJS in two professional projects"
          ]
        }
      ]
    }
  ],

  "strengths": [],
  "gaps": [],
  "missingRequirements": [],
  "recommendation": "..."
}

---

# 3. AI Evaluation Persistence

AI Evaluation is associated with an Application.

Relationship:

Application 1 ─── N AiEvaluation

AiEvaluation contains:

- applicationId
- evaluation version
- criteria scores
- evidence
- strengths
- gaps
- missing requirements
- overall score
- evaluatedAt

Use applicationId in AiEvaluation.

Do not store aiEvaluationId in Application unless explicitly required.

Historical evaluations should not be overwritten when the system
supports multiple evaluation runs.

---

# 4. AI Safety and Data Integrity

AI output is untrusted input.

All AI responses must:

1. Be validated by backend DTO/schema validation.
2. Be sanitized where appropriate.
3. Be checked for required fields and valid values.
4. Handle malformed or incomplete responses.
5. Never bypass normal business validation.

AI must never silently modify Candidate or Application data.

---

# 5. AI vs Deterministic Business Logic

Use AI for tasks requiring semantic understanding:

- Extracting information
- Understanding evidence
- Comparing experience with requirements
- Assessing evidence strength
- Generating explanations

Use normal backend code for deterministic operations:

- Weight validation
- Percentage validation
- Score multiplication
- Score aggregation
- Required-field validation
- Database persistence
- Permission checks

AI should not be used where deterministic code can perform the task
reliably.