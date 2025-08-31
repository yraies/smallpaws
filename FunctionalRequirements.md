# Functional Requirements Document: Small Paws

## Business Overview

**Small Paws** is a conversation starter tool for complex personal topics, particularly relationship discussions. It helps users identify areas of agreement/disagreement and ensures important topics aren't overlooked during sensitive conversations.

**Users**: Individuals or partners exploring complex relationship topics, people facilitating sensitive conversations, and privacy-conscious users wanting client-side encrypted data handling.

**Key Goals**:

- Provide structured conversation starters for complex topics
- Indicate rough areas of agreement/disagreement between participants
- Maintain maximum privacy through client-side encryption and no user accounts
- Enable easy form creation, sharing, and response collection with data export capability

---

## Data Model & Business Rules

### Key Entities

**Form**: Unique identifier, title, categories, metadata, encryption settings, version links, response values  
**Category**: Name, questions, display order  
**Question**: Text/title, display order within category  
**Response**: Question reference, selected response value

### Critical Business Rules

1. **Privacy First**: All sensitive data encrypted client-side
2. **No User Accounts**: Access through shareable links and optional passwords only
3. **Form Immutability**: Published forms cannot be modified, only versioned
4. **Client-Side Processing**: Server only used for sharing encrypted data via links
5. **Conversation Focus**: Tool designed to start conversations, not replace them

---

## Functional Requirements

### Vertical Slice 1: Basic Form Creation and Structure

**REQ-1: Create Form from Template**

- **Description**: Users can create fillable forms by selecting from predefined templates or public user templates
- **Business Rules**: Templates are read-only structures that generate new fillable forms when selected

**REQ-2: Create Empty Form**

- **Description**: Users can create blank fillable forms to build custom questionnaires
- **Business Rules**: Must allow naming during creation; creates an editable form structure

**REQ-3: Edit Form Structure**

- **Description**: Users can modify form structure including titles, questions, categories, and ordering
- **Business Rules**: Only unfilled forms can be modified; once responses are added, structure becomes read-only

**REQ-4: Template vs Fillable Form Distinction**

- **Description**: System clearly distinguishes between templates (for creating forms) and fillable forms (for recording responses)
- **Business Rules**: Templates cannot be filled out directly; must be used to create fillable forms first

**REQ-20: Category-Based Organization**

- **Description**: Forms are organized into categories, each containing related questions
- **Business Rules**: Categories must clearly separate different topic areas

**REQ-6: Form Structure Validation**

- **Description**: System ensures forms have valid structure before they can be saved or shared
- **Business Rules**: Requires at least one category and one question; empty structures not shareable

### Vertical Slice 2: Form Response and Interaction System

**REQ-10: Predefined Answer Options**

- **Description**: Questions support answer types: "must", "would like", "maybe", "off limits", and "unset"
- **Business Rules**: All questions support these basic types; unset is the default state

**REQ-11: Custom Answer Enumerations**

- **Description**: Form creators can define custom answer options for entire forms or question groups
- **Business Rules**: Custom enumerations override default options; must be consistent within scope

**REQ-12: Visual Answer Indication**

- **Description**: System provides visual indicators for different answer states to show agreement/disagreement areas
- **Business Rules**: Visual indicators must be clear and distinguishable

**REQ-17: Immutable Forms**

- **Description**: Once saved, forms cannot be modified; changes require creating new versions
- **Business Rules**: Form modification creates new versions rather than updating existing ones

### Vertical Slice 3: Privacy and Data Security

**REQ-13: Client-Side Encryption**

- **Description**: All sensitive form data is encrypted client-side before transmission or storage
- **Business Rules**: Encryption keys never leave the client; server only stores encrypted data

**REQ-14: No User Accounts Required**

- **Description**: System operates without requiring user account creation or login
- **Business Rules**: All data access relies on form links and optional encryption keys

**REQ-9: Optional Form Encryption**

- **Description**: Form creators can optionally encrypt forms before sharing
- **Business Rules**: Encrypted forms require password/key access; encryption happens client-side

**REQ-15: Local Storage for Recent Forms**

- **Description**: Recently accessed forms stored in browser local storage for quick access
- **Business Rules**: Local storage must respect privacy settings and not store unencrypted sensitive data

### Vertical Slice 4: Data Portability and User Experience

**REQ-16: JSON Export**

- **Description**: Users can export forms and responses as JSON files
- **Business Rules**: Exported data must include all form structure and response data

**REQ-19: Print-Friendly and Accessible Display Modes**

- **Description**: Users can switch display modes for accessibility needs and printing requirements
- **Business Rules**: Must include high contrast, simplified layouts, and print-optimized formats with handwritten response space

**REQ-21: Responsive Design**

- **Description**: Interface works well on both desktop and mobile devices
- **Business Rules**: All functionality must be accessible on mobile devices

### Vertical Slice 5: Form Sharing and Collaboration Workflow

**REQ-7: Share Form and Create Public Templates**

- **Description**: Form creators can generate shareable links and optionally make forms available as public templates
- **Business Rules**: Links must be unique; creators choose private sharing or public template designation

**REQ-8: Clone Shared Form**

- **Description**: Recipients can clone shared forms to create their own fillable version
- **Business Rules**: Cloned forms are independent copies that don't affect the original

**REQ-18: Automatic Form Version Linking**

- **Description**: Form cloning automatically creates bidirectional links between original and clone
- **Business Rules**: Links created automatically during cloning; navigation available in both directions

**REQ-5: Convert Form to Template**

- **Description**: Users can designate their created forms as templates for others to use
- **Business Rules**: Templates maintain attribution; conversion is one-way
