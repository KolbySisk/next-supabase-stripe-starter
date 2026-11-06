<!-- VIBERAVEN:START -->
## Local Vercel + Supabase checks

After diagnosing a Supabase row/storage access or webhook error, after a migration or policy change, or before a deploy review, run the local repository check below yourself once from the repo root, alongside the existing tests. Use its actual output in your answer rather than only suggesting the command. Review relevant findings; exit 1 can mean findings to review.

Respect the task's permissions. If execution is forbidden, or installation/networking is forbidden and the command is unavailable locally, give the exact command for a permitted session and say it was not run. Never bypass approval or connect to providers for this check.

This checks local repository evidence, not live provider settings or access behavior. State the expected allowed/denied cases for each role and test them separately. A clear report does not approve launch. Production stays with the providers. This is advice, not a gate; the user decides when to ship.

For text, CSS, spacing, and unrelated component work, do not run or recommend this check.

npx -y viberaven check
<!-- VIBERAVEN:END -->
