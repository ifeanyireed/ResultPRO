# Exam Configuration Flow Implementation

## Summary
Implemented dynamic exam configuration control throughout the Results Setup Wizard. Step 2's exam configuration now controls:
- CSV template column structure  
- CSV parser expectations
- Gradebook paper column layout and display

## Problem Statement
Previously, the exam configuration defined in **Step 2 (Exam Config)** was not being used downstream. Instead:
- CSV template download had **hardcoded columns**: CA 1 (20), CA 2 (20), Project (10), Final Exam (50)
- Gradebook paper display had **hardcoded headers**: CA 1, CA 2, Project, Exam
- CSV parser assumed **exactly 4 columns per subject**

This meant users couldn't customize their exam structure—the system always expected those exact 4 components.

## Solution Implemented

### 1. **Pass Exam Config Through Wizard** 
**File**: `src/pages/school-admin/results-setup/index.tsx`

```tsx
// Step 7 now receives examined components from Step 2
case 7:
  return <Step7ResultsCSV 
    {...stepProps} 
    examConfig={state.step2Data}  // ← NEW: Pass Step 2 data
    initialData={state.step7Data} 
  />;
```

**What Changed:**
- Added `examConfig={state.step2Data}` to Step7 props
- Step7 now has access to the exam components defined in Step 2

---

### 2. **Update Step7ResultsCSV Component**
**File**: `src/pages/school-admin/results-setup/steps/Step7ResultsCSV.tsx`

#### A. Add Exam Component Interface
```tsx
interface ExamComponent {
  name: string;
  score: number;
}

interface Step7Props {
  // ...existing props
  examConfig?: { components?: ExamComponent[] };
}
```

#### B. Load Exam Components on Mount
```tsx
// Load exam components from Step 2 config
useEffect(() => {
  if (examConfig?.components && examConfig.components.length > 0) {
    setExamComponents(examConfig.components);
  } else {
    // Fallback to default components
    setExamComponents([
      { name: 'CA 1', score: 20 },
      { name: 'CA 2', score: 20 },
      { name: 'Project', score: 10 },
      { name: 'Exam', score: 50 },
    ]);
  }
}, [examConfig]);
```

**Benefit:** Falls back to default if Step 2 wasn't completed, but uses custom config when available.

#### C. Dynamic CSV Template Generation
```tsx
const generateCsvTemplate = () => {
  // BEFORE: Fixed 4 columns per subject
  // subHeaders.flatMap(() => ['CAT 1 (20)', 'CAT 2 (20)', 'Project (10)', 'Final Exam (50)'])
  
  // AFTER: Dynamic columns based on exam components
  subHeaders.flatMap(() => 
    examComponents.map(comp => `${comp.name} (${comp.score})`)
  )
};
```

**Benefit:** CSV template adapts to whatever exam components are defined in Step 2.

#### D. Dynamic CSV Parsing
```tsx
const parseCSVComplete = async () => {
  // Calculate how many columns per subject
  const componentsPerSubject = examComponents.length;
  
  // Map subject positions using dynamic component count
  for (let i = 0; i < subjects.length; i++) {
    subjectMap[subjects[i]] = subjectStartCol + (i * componentsPerSubject);
  }
};
```

**Benefit:** Parser no longer assumes 4 columns—adjusts based on actual exam components.

#### E. Dynamic Score Extraction
```tsx
// Extract scores for each exam component
const componentScores: number[] = [];
for (let i = 0; i < examComponents.length; i++) {
  const score = parseInt(row[colPos + i] || '0') || 0;
  componentScores.push(score);
  total += score;
}

// Create dynamic properties for each component
examComponents.forEach((component, idx) => {
  const compKey = component.name.toLowerCase().replace(/\s+/g, '_');
  subjectResultData[compKey] = componentScores[idx];
});
```

**Benefit:** Stores component scores dynamically, regardless of component names.

---

### 3. **Update CompactGradebook Component**
**File**: `src/components/gradebook/CompactGradebook.tsx`

#### A. Accept Exam Components Prop
```tsx
interface CompactGradebookProps {
  school: School;
  result: SchoolResult;
  template: GradebookTemplate;
  examComponents?: ExamComponent[];  // ← NEW
  previewMode?: boolean;
}
```

#### B. Dynamic Column Headers
```tsx
// BEFORE: Hardcoded 4 columns
// <th>CA 1</th>
// <th>CA 2</th>
// <th>Project</th>
// <th>Exam</th>

// AFTER: Dynamic columns
{displayComponents.map((comp) => (
  <th key={comp.name}>
    {comp.name}
  </th>
))}
```

#### C. Dynamic Score Lookup
```tsx
{displayComponents.map((comp) => {
  const compKey = comp.name.toLowerCase().replace(/\s+/g, '_');
  const score = (subject as any)[compKey] !== undefined 
    ? (subject as any)[compKey] 
    : null;
  return (
    <td>{score !== null ? score : '-'}</td>
  );
})}
```

**Benefit:** Gradebook displays whatever columns are defined in Step 2.

#### D. Pass to Gradebook in Step7
```tsx
<CompactGradebook
  school={school}
  result={previewGradebooks[selectedStudentIndex]}
  template={template}
  examComponents={examComponents}  // ← NEW
  previewMode={true}
/>
```

---

## Flow Diagram

```
Step 2: Exam Config
┌─────────────────────────────────────┐
│ Define exam components:             │
│ - CA 1: 20 points                   │
│ - CA 2: 20 points                   │
│ - Project: 20 points                │
│ - Assignment: 20 points             │
│ - Exam: 20 points                   │
└──────────────┬──────────────────────┘
               │ Save as step2Data
               ▼
Step 7: Results CSV
┌──────────────────────────────────────┐
│ Load examConfig from Step 2          │
│ ✓ generateCsvTemplate uses them      │
│ ✓ parseCSVComplete uses them         │
│ ✓ Student score extraction uses them │
└──────────────┬──────────────────────┘
               │
               ▼
CSV Template Download
┌──────────────────────────────────────┐
│ Dynamic headers based on Step 2:     │
│ CA 1 (20) | CA 2 (20) | Project (20)│
│     | Assignment (20) | Exam (20)   │
└──────────────────────────────────────┘

       + 

Gradebook Paper Generation
┌──────────────────────────────────────┐
│ Dynamic columns from Step 2:         │
│ Subject | CA 1 | CA 2 | Project |   │
│   Assignment | Exam | Total | Grade │
└──────────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Complete Step 2 with custom exam components (e.g., 3 components, or 6 components)
- [ ] Verify CSV template download shows custom component names/scores
- [ ] Upload CSV with custom component structure
- [ ] Verify gradebook preview shows custom columns
- [ ] Verify gradebook paper prints with custom columns
- [ ] Re-enter wizard and verify exam config persists
- [ ] Test with default components (Step 2 skipped)

---

## Fallback Behavior

If a user doesn't complete Step 2 properly or the exam config isn't available:
- CSV template uses default: [CA 1 (20), CA 2 (20), Project (10), Exam (50)]
- Gradebook uses same defaults
- System continues to work without breaking

---

## Files Modified

1. `src/pages/school-admin/results-setup/index.tsx` - Pass exam config to Step7
2. `src/pages/school-admin/results-setup/steps/Step7ResultsCSV.tsx` - Dynamic template and parsing
3. `src/components/gradebook/CompactGradebook.tsx` - Dynamic gradebook columns

---

## Key Principles Applied

1. **Props Drilling**: Exam config passed through wizard hierarchy
2. **Dynamic Generation**: Template and columns generated from config, not hardcoded
3. **Backward Compatibility**: Fallback to defaults if config unavailable
4. **Single Source of Truth**: Step 2 exam config controls all downstream components
5. **DRY**: Component scores stored dynamically instead of hardcoded properties
