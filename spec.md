# CRM FAQ Portal

## Current State
Full-stack CRM FAQ Portal with:
- Motoko backend storing entries (title, description, type, area, team, status, notes, reportedBy, dependency, instructions, resolveDate, createdAt, updatedAt) and app settings (labels, typeOptions, areaOptions, teamOptions, logoUrl, bannerUrl)
- Authorization module with #admin/#user/#guest roles
- `createEntry`, `updateEntry`, `deleteEntry` currently gated behind `AccessControl.hasPermission(caller, #user)` — this causes a Runtime.trap for any caller not registered via `initialize()`, since no registration flow exists in the UI. This is the root cause of the "cannot create entry" error.
- `updateSettings` gated behind `#admin`
- Frontend: Dashboard, Entries, New Entry, Settings pages. Import/Export Excel via xlsx library.

## Requested Changes (Diff)

### Add
- "Download Template" button in the Entries page header that generates and downloads a blank .xlsx template file with all column headers pre-filled and one sample row showing valid values for each column

### Modify
- Backend: Remove `#user` permission check from `createEntry`, `updateEntry`, `deleteEntry` — allow any caller (including anonymous) to perform these actions so the create/edit/delete flow works without authentication
- Backend: Remove `#admin` permission check from `updateSettings` — allow any caller to update settings (consistent with prior "remove admin access" request)
- Frontend: Add "Download Template" button next to the Import button in EntriesPage header

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate Motoko backend with createEntry/updateEntry/deleteEntry/updateSettings having no auth checks (open access)
2. Add a `handleDownloadTemplate` function in EntriesPage that uses xlsx to create a blank template with one sample row and all column headers, then downloads it as `bulk-upload-template.xlsx`
3. Add a "Template" button in the EntriesPage header between the Import and Export buttons
