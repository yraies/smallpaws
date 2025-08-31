# Small Paws Implementation Agent Prompt

## Your Mission

You are implementing the Small Paws project following the detailed Implementation Plan. Small Paws is a privacy-first conversation starter tool for complex personal topics (especially relationship discussions). You're adding missing features to an already solid foundation.

## Current State

- ✅ **40% Complete**: React frontend with excellent form creation/editing works
- ✅ **Working Foundation**: Form/Category/Question data model, templates, local storage
- ✅ **Current Tech**: React + TypeScript frontend
- ❌ **Missing**: Privacy/encryption, form sharing, cloning, export functionality

## Implementation Phases (In Order)

### Phase 0: Migrate to Next.js

**Status**: ✅ Completed  
**Goal**: Move the React frontend to Next.js for better routing and extensibility down the line.

- [x] Set up a new Next.js project
- [x] Migrate existing React components to Next.js pages
- [x] Implement API routes in Next.js
- [x] Integrate a testing framework and write tests for the current functionality

### Phase 1: Privacy & Encryption 🔒

**Status**: Not Started  
**Goal**: Add optional client-side password protection

- [ ] Add password protection to form save flow
- [ ] Implement client-side encryption with crypto-js
- [ ] Add password prompts for encrypted forms
- [ ] Update UI to show encryption status
- [ ] Test encryption/decryption workflow

### Phase 2: Form Sharing 🔗

**Status**: Not Started
**Goal**: Enable shareable links with optional passwords

- [ ] Add shared_forms table to database
- [ ] Create sharing API endpoints
- [ ] Add share button and modal to frontend
- [ ] Create /share/:shareId route and page
- [ ] Implement password-protected shares
- [ ] Test complete sharing workflow

### Phase 3: Form Cloning 📋

**Status**: Not Started
**Goal**: Let users clone shared forms for editing

- [ ] Add clone button to shared form pages
- [ ] Implement clone API endpoint
- [ ] Handle form attribution (cloned_from field)
- [ ] Test cloning workflow
- [ ] Ensure cloned forms are fully editable

### Phase 4: Data Export 📤

**Status**: Not Started
**Goal**: Let users export their forms and responses

- [ ] Implement JSON export functionality
- [ ] Add CSV export for response analysis
- [ ] Create export buttons in UI
- [ ] Add file download utilities
- [ ] Test all export formats

### Phase 5: Public Templates 🌟 (Optional)

**Status**: Not Started
**Goal**: Community-contributed template system

- [ ] Add public_templates table
- [ ] Create template submission workflow
- [ ] Build public template browser
- [ ] Implement simple approval process
- [ ] Test template sharing

## Key Constraints & Guidelines

- **Keep It Simple**: Use well known libraries as much as needed - no over-engineering
- **Preserve What Works**: Don't break existing React frontend or data model
- **Incremental Progress**: Complete each phase fully before moving to next
- **Privacy First**: Client-side encryption, no user accounts required
- **Small Project Scope**: Avoid complex features, focus on core functionality

## Success Criteria Per Phase

- **Phase 0**: Frontend works identically with new backend
- **Phase 1**: Forms can be optionally password-protected
- **Phase 2**: Shareable links work with access controls
- **Phase 3**: Users can clone shared forms successfully
- **Phase 4**: Export functionality works reliably
- **Phase 5**: Community templates can be submitted and browsed

## Resources

- **Requirements**: The requirements for this project cam be found in `FunctionalRequirements.md`
- **Implementation Plan**: Full details in `ImplementationPlan.md`
- **Current Codebase**: React frontend in `/frontend`
- **Data Model**: Excellent immutable Form/Category/Question classes in `/frontend/src/types/Form.tsx`

## Your First Task

Start with Phase 0: Set up a new Next.js project and migrate the existing React codebase. The goal is to allow for a backend without changing the functionality of any frontend code.

Update the progress tracker above as you complete each task, and always work through the phases in order. Focus on getting each phase completely working before moving to the next one.

Good luck! The foundation is excellent - you're building on solid ground.
