# ADR-0009: Groq JSON Course Generation

**Date**: 2026-06-02
**Status**: Accepted

## Context

The teacher course generator showed this UI error after a teacher submitted a syllabus:

> Generation produced no output. Please try again.

The failure was reproducible through the `/generate` flow. The dev server log showed the real cause in `POST /api/generate-course`:

```text
[generate-course] stream error: {
  error: {
    message: "Failed to call a function. Please adjust your prompt. See 'failed_generation' for more details.",
    type: 'invalid_request_error'
  }
}
```

ADR-0004 recorded `mode: 'tool'` for Groq structured object generation. In practice, with `llama-3.3-70b-versatile`, the tool/function-call path can fail before producing any object. The React `experimental_useObject` hook then reaches `onFinish` with no object, which is why the UI displays the empty-output error.

There was also a separate page compile blocker while verifying the fix: `components/RichTextarea.tsx` contained a malformed `} from 'react'` fragment. That prevented `/generate` from compiling until removed.

## Decision

Use Groq JSON structured output for LMS Course previews.

Specifically:

- `LMS_STRUCTURED_OBJECT_MODE` is now `json`.
- `POST /api/generate-course` now uses `generateObject` instead of `streamObject`.
- The route returns `JSON.stringify(object)` as plain text so `experimental_useObject` can parse the response and call `onFinish` with a valid `CoursePreview`.
- The e2e course-generation test now targets the rich-text editor by accessible role/name and clicks the first visible `Save Course` button, because the review screen renders more than one save action.

This supersedes the ADR-0004 statement that Groq requires `tool` mode for course-generator structured object output.

## Consequences

- **Positive**: Course generation no longer fails through Groq function/tool calling with `failed_generation`.
- **Positive**: `/api/generate-course` returns clean JSON that the existing `useObject` client can parse.
- **Positive**: The teacher flow was verified end to end: paste syllabus, generate preview, save course, navigate to the course page.
- **Negative / trade-offs**: The course preview no longer streams partial module updates during generation. The UI still shows the generating state, then switches to review when the object is ready.
- **Risks**: If live partial preview streaming becomes important again, we should revisit the provider/model choice or add a server-side streaming transform that guarantees parseable JSON chunks for `useObject`.

## Regression Coverage

Added `app/api/generate-course/route.test.ts` to lock the API behavior: in the Groq-compatible structured-output mode, the route returns a parseable Course preview.

Updated:

- `lib/__tests__/ai-model.test.ts`
- `tests/e2e/course-generation-flow.test.ts`

Verification run:

```text
npm run test -- app/api/generate-course/route.test.ts lib/__tests__/ai-model.test.ts
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 PLAYWRIGHT_SKIP_WEBSERVER=1 npx playwright test tests/e2e/course-generation-flow.test.ts -g "teacher pastes syllabus"
```

Both passed after the fix.

`npm run typecheck -- --pretty false` still fails on unrelated pre-existing `components/SpeedGrader.test.tsx` fixtures that are missing the required `course` field in `SpeedGraderData`.
