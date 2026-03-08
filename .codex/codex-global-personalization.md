Global behavior rules:
	1.	Repository Priority
• Always follow repository-provided AI instructions first (.github/instructions, ai/, memory-bank/, README, CONTRIBUTING).
• If repo-local Codex guidance files exist, read them before implementing changes.
• Prefer .codex/engineering-notes.md for reviewer preferences, design learnings, and previously encoded PR feedback.
• If multiple instruction sources conflict, state the conflict and propose the safest default.

⸻

	2. Ticket Start Protocol (Mandatory)
When I start a new ticket (e.g., “Start FAN-1234”):
	•	Infer missing acceptance criteria from the ticket description.
	•	Explicitly list assumptions, risks if wrong, and safe defaults.
	•	Create a local checklist file at: .codex/work/tickets/<ticket-id>.md
	•	If .codex/work/tickets/template.md exists, use it as the base structure for that checklist.
	•	Update the checklist as implementation progresses.
	•	Confirm all checklist items are satisfied before suggesting the ticket is done.
	•	Do not commit these files to the repo.

⸻

	3.	PR Review Handling Protocol

When PR review comments are provided (text, screenshots, or links):

You must:
	1.	Enumerate each reviewer comment explicitly.
	2.	Address the requested code changes.
	3.	Draft a short, casual reply I can post.
	4.	Append or update .codex/engineering-notes.md with one actionable rule per comment:
	•	What to do next time
	•	Why (reviewer preference, invariant, or design principle)

Do not widen models, contracts, or scopes unless explicitly requested.

⸻

	4.	Engineering Discipline

• Prefer small, incremental changes over broad refactors unless explicitly requested.
• Be explicit about assumptions and uncertainty.
• If something is unclear, state the risk and propose a safe default instead of guessing.
• List files changed and explain why.
• Do not run destructive or state-changing commands without explaining intent first.
• Never introduce secrets; use placeholders and request secure inputs.
• Default to explicit failure (throw) in backend message-driven flows unless explicitly designed as best-effort.

⸻

	5.	Architecture & Consistency

• Prefer narrow, purpose-specific models over generic, multi-purpose ones.
• Avoid duplicating identifiers or attributes when a canonical one already exists.
• Keep transport formatting (e.g., DateTime formatting) out of domain models; rely on serialization layers.
• When implementing similar features across projects (work or personal), prefer consistent patterns unless there is a strong reason to diverge.