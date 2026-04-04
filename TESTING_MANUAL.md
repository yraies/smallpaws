# Manual QA Checklist

Use this checklist for manual verification of high-value workflows.

Run this checklist in a real Chrome instance when it is used as the final validation pass for changed user-facing work.

## Startup

- [ ] `npm run dev` starts without errors on localhost:3000.
- [ ] Home page loads and explains the three phases: template creation, form filling, and reading results.
- [ ] No console errors in browser dev tools.
- [ ] Recent work is sourced from browser local storage; there is no recent-items listing API request.

## Template Creation

- [ ] Create a template from scratch.
- [ ] Create a template from an existing template.
- [ ] Edit template title, categories, questions, and ordering.
- [ ] Template drafts cannot contain filled answers.
- [ ] Recent local drafts appear in recent work on the home page.
- [ ] Deleting a recent item removes it from the list without navigating into it.

## Template Finalization and Sharing

- [ ] Templates require at least one category and one question before finalization.
- [ ] Finalizing a template freezes structure and answer schema.
- [ ] Shared template links show read-only structure.
- [ ] Recipients can create their own local form from a shared finalized template.

## Form Filling

- [ ] Starting a form from a finalized template creates an independent fillable copy.
- [ ] Form structure is fixed; categories/questions cannot be edited in the form-filling phase.
- [ ] Select answer options (must / would like / maybe / off limits / unset) for questions.
- [ ] Visual indicators correctly reflect selected answer state.
- [ ] Draft answers persist locally until the form is shared/finalized.

## Encryption

- [ ] Enable protection on a template or form — password prompt appears.
- [ ] Encrypted form shows encryption status indicator.
- [ ] Accessing encrypted form requires correct password.
- [ ] Wrong password shows appropriate error.
- [ ] Encryption/decryption round-trip preserves all form data.
- [ ] Shared-link access control uses the same password model as the protected template/form.

## Reading Results and Sharing

- [ ] Sharing a filled form generates a unique shareable URL.
- [ ] Shared filled-form links show a read-only results view.
- [ ] Shared/published forms cannot be edited in place.
- [ ] To revise a shared result, the user creates a new local copy/draft.

## Export and Print

- [ ] CSV export downloads correct file with response data.
- [ ] JSON export downloads correct file with structure and response data.
- [ ] Browser print renders the print-friendly layout with handwritten response space.

## Delete

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
