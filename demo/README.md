# Demo Materials

Everything you need to run the live hackathon demo in one place.

---

## Setup (run once before the demo)

```bash
supabase db reset
psql $DATABASE_URL -f supabase/seed-test-data.sql
npm run dev
```

Open **http://localhost:8001**

---

## Demo Flow

### Step 1 — Show pre-loaded courses (Teacher view)
- Toggle to **Teacher**
- Two courses already exist: **BIO 111** and **COMS 101**
- Each has 15 students enrolled
- Gradebook shows Week 1 submissions in various states (graded, pending, drafts)

### Step 2 — Generate MATH 143 live
- Click **New Course** (or equivalent)
- Paste the contents of **`math-143-syllabus.txt`** into the syllabus box
- Hit Generate — watch the AI build the full course structure
- The first assignment in Week 1 will be **"Wednesday Problem – Week 1"**

### Step 3 — Submit the Wednesday Problem (Student view)
- Toggle to **Student** (Alex Rivera)
- Open MATH 143 → Week 1 → Wednesday Problem – Week 1
- Paste the contents of **`wednesday-problem-submission.txt`** into the text box
  *(stop at "The limit is")*
- Type the final line live: `= +1`
  *(the correct answer is -1 — this is the intentional sign error)*
- Submit

### Step 4 — AutoGrade (Teacher view)
- Toggle back to **Teacher**
- Open MATH 143 → Wednesday Problem → Alex Rivera's submission
- Run **SpeedGrader**
- Expected result: **9/10**
  - Criteria 1–3 (method): full credit — steps are correct
  - Criterion 4 (final answer): 0/1 — wrong sign
  - AI feedback will note the sign error specifically

---

## Files in this folder

| File | What it's for |
|------|---------------|
| `math-143-syllabus.txt` | Paste into New Course to generate MATH 143 live |
| `wednesday-problem-submission.txt` | Paste into the submission box for the SpeedGrader demo |

---

## Student roster (for testing any student's view)

All students are enrolled in BIO 111 and COMS 101.
The role toggle in the UI points to **Alex Rivera** (student `...002`).

| # | Name | Email | UUID suffix |
|---|------|-------|-------------|
| 1 | Alex Rivera | alex@demo.lms | `...002` ← role toggle |
| 2 | Jordan Lee | jordan@demo.lms | `...003` |
| 3 | Maya Patel | maya@demo.lms | `...004` |
| 4 | Tyler Brooks | tyler@demo.lms | `...005` |
| 5 | Sam Nguyen | sam@demo.lms | `...006` |
| 6 | Priya Sharma | priya@demo.lms | `...007` |
| 7 | Marcus Johnson | marcus@demo.lms | `...008` |
| 8 | Sofia Reyes | sofia@demo.lms | `...009` |
| 9 | Ethan Kim | ethan@demo.lms | `...010` |
| 10 | Aaliyah Washington | aaliyah@demo.lms | `...011` |
| 11 | Connor Murphy | connor@demo.lms | `...012` |
| 12 | Zoe Chen | zoe@demo.lms | `...013` |
| 13 | Diego Flores | diego@demo.lms | `...014` |
| 14 | Hannah Okafor | hannah@demo.lms | `...015` |
| 15 | Liam Patel | liam@demo.lms | `...016` |
