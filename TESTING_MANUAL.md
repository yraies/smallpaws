# Manual QA Checklist

Use this checklist for manual verification of high-value workflows.

## Startup

- [ ] `npm run dev` starts without errors on localhost:3000.
- [ ] Home page loads and displays template list and recent forms.
- [ ] No console errors in browser dev tools.

## Form Creation

- [ ] Create form from a predefined template — form appears with correct categories and questions.
- [ ] Create empty form — prompts for name, creates editable blank form.
- [ ] Form is listed in recent forms on the home page.

## Form Editing

- [ ] Add/remove/reorder categories.
- [ ] Add/remove/reorder questions within a category.
- [ ] Edit form title.
- [ ] Edit question text.
- [ ] Changes persist after page reload (saved to API + localStorage).

## Form Responses

- [ ] Select answer options (must / would like / maybe / off limits / unset) for questions.
- [ ] Visual indicators correctly reflect selected answer state.
- [ ] Once responses are added, form structure becomes read-only.

## Encryption

- [ ] Enable encryption on a form — password prompt appears.
- [ ] Encrypted form shows encryption status indicator.
- [ ] Accessing encrypted form requires correct password.
- [ ] Wrong password shows appropriate error.
- [ ] Encryption/decryption round-trip preserves all form data.

## Sharing

- [ ] Share button generates a unique shareable URL.
- [ ] Shared link shows read-only form view.
- [ ] Password-protected shared forms prompt for password.
- [ ] Share info overlay shows view count, dates, expiry.

## Cloning

- [ ] Clone button on shared form creates a new independent form.
- [ ] Cloned form has cloned_from attribution.
- [ ] Cloned form is fully editable.
- [ ] Original form is unaffected by changes to clone.

## Export and Delete

- [ ] CSV export downloads correct file with response data.
- [ ] Delete form — soft-deletes; form no longer appears in recent list.
- [ ] Shared links to deleted forms show "form deleted" message.

## Responsive Design

- [ ] All features work on mobile viewport (≤768px).
- [ ] Layout adapts properly to narrow screens.
- [ ] Touch interactions work correctly.

## Docker Deployment

- [ ] `podman build -t smallpaws .` builds successfully.
- [ ] Container starts and serves on port 3000.
- [ ] Persistent volume (`smallpaws-data:/app/data`) preserves data across restarts.
