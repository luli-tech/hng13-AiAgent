## Legal workflow and agent

This project adds a `legalAgent` and a `legalWorkflow` which analyze a legal issue and return a structured JSON object describing facts, legal questions, potential liabilities, remedies, citations, recommended next steps, and a confidence score.

How the workflow expects input

- The workflow id: `legal-workflow`
- Input shape: { "issue": "<short description or fact pattern>" }

Expected output (JSON object)
{
"facts": "string",
"legalQuestions": ["string", "string"],
"liabilities": [{ "party": "Party A", "theories": ["negligence", "strict liability"] }],
"remedies": ["damages", "injunction"],
"citations": ["Statute X §1", "Case Y v. Z, 123 U.S. 456 (19xx)"],
"recommendedNextSteps": ["Collect contract, interview witness"],
"confidence": 0.8
}

Notes

- The agent returns a JSON object by instructing the LLM to produce JSON; if the model returns non-JSON output the workflow will return a fallback object where the `facts` field contains the raw output.
- This is intended for analysis and research assistance only and not a substitute for legal advice. The agent also includes a short disclaimer in `facts` when appropriate.

Next steps you might want me to take

- Add a dedicated legal scorer to assess completeness and citation quality
- Add a tool to fetch statutes/case law automatically
- Add a small example script to run the workflow programmatically
