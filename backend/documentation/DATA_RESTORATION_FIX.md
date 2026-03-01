# Data Persistence Fix: Form Restoration on Page Refresh

## Problem Statement

When users refresh the page after completing a wizard step and saving data to the database:
- **Observed**: All form fields showed as empty (using default values)
- **Expected**: Form fields should restore with the saved data from the database
- **Root Cause**: Form components were not responding to changes in `initialData` prop

## Root Cause Analysis

The issue occurred in this sequence:

1. **On page load**: `checkSetupStatus()` effect in `index.tsx` runs
   - Fetches session from database ✅
   - Parses saved data and updates parent component state ✅
   - Sets `state.step2Data`, `state.step3Data`, etc. with restored values ✅

2. **Components render**: Child components (Step2ExamConfig, Step3AffectiveDomain, etc.) receive `initialData` as a prop
   - **BUG**: Components only used `initialData` in `useState()` default value
   - `useState()` only evaluates default value on initial mount, NOT when prop changes
   - When `initialData` prop changes after mount, component state doesn't update

3. **Result**: Old empty state persists, data isn't visible in restored form

## Solution: Add useEffect Hooks for Prop Changes

For components using `useState()` to manage form data directly:

```tsx
// Step 2 Example: Components array state
const [components, setComponents] = useState<ExamComponent[]>(
  initialData?.components || DEFAULT_COMPONENTS
);

// NEW: Watch for initialData changes and update state
useEffect(() => {
  if (initialData?.components && initialData.components.length > 0) {
    const componentsWithIds = initialData.components.map((c: any, index: number) => ({
      id: c.id || `${Date.now()}-${index}`,
      name: c.name,
      score: c.score,
    }));
    setComponents(componentsWithIds);
  }
}, [initialData?.components]);
```

For components using `useForm()` from react-hook-form:

```tsx
// Step 3 Example: Form library
const form = useForm<Step3FormData>({
  resolver: zodResolver(step3Schema),
  defaultValues: initialData || { affectiveDomain: '', affectiveDescription: '' },
});

// NEW: Watch for initialData changes and reset form
useEffect(() => {
  if (initialData) {
    form.reset({
      affectiveDomain: initialData.title || '',
      affectiveDescription: initialData.description || '',
    });
  }
}, [initialData, form]);
```

## Files Modified

### Frontend Step Components
Fixed all 7 step components to restore data on page refresh:

1. **Step1SelectSessionTerm.tsx** - Restores sessionId/termId to form + re-populates terms dropdown
2. **Step2ExamConfig.tsx** - Restores exam components array with real-time validation
3. **Step3AffectiveDomain.tsx** - Restores title and description fields
4. **Step4PsychomotorDomain.tsx** - Restores title and description fields
5. **Step5StaffUploads.tsx** - Restores signature URLs and file references
6. **Step6AssignStudents.tsx** - Restores assigned students list
7. **Step7ResultsCSV.tsx** - Restores CSV file reference (prep for enhancement)

### Pattern Applied
- Added `useEffect` hook after form/state initialization
- Listens for `initialData` or specific `initialData` properties to change
- Calls `setComponents()` for direct state components
- Calls `form.reset()` for react-hook-form components

## Data Flow After Fix

```
1. User fills Step 2 → axios.post to /api/results-setup/step/2
2. Backend stores examConfigComponents JSON to DB ✅
3. User refreshes page
4. checkSetupStatus() effect:
   - Fetches session from DB ✅
   - Parses examConfigComponents JSON ✅
   - Sets state.step2Data = { components: [...] } ✅
   - Parent component re-renders with new initialData prop
5. Step2ExamConfig receives new initialData prop
   - useEffect detects initialData?.components changed ✅
   - Calls setComponents(parsedComponents) ✅
   - Form state updates with saved data ✅
6. User sees form filled with restored data ✅
```

## Verification

Both frontend and backend compile without errors:

```bash
# Frontend
npm run build
✓ 2264 modules transformed
Build complete

# Backend
npm run build
tsc (no errors)
```

## Database Integration

No database changes required. The existing `ResultsSetupSession` model already stores all data as JSON:
- `examConfigComponents` - Stored as JSON string, parsed on restore
- `affectiveDomainTitle`, `psychomotorDomainTitle` - Restored directly
- Other step data - Restored with same pattern

## Testing Checklist

To verify the fix works:

- [ ] Fill Step 1 (Session/Term) → Save → Refresh → Data restored
- [ ] Fill Step 2 (Exam Config) → Save → Refresh → Components list restored
- [ ] Fill Step 3 (Affective Domain) → Save → Refresh → Title/Description restored
- [ ] Test backward navigation (Previous button) → Data preserved
- [ ] Test forward navigation (Next button) → Data carries to next step

## Future Enhancement

For Step 7 (CSV Upload), file content cannot be restored client-side due to browser security restrictions. Consider:
- Show preview/summary of previously uploaded results
- Allow re-upload or deletion of previous results
- Track upload status/timestamp in UI

