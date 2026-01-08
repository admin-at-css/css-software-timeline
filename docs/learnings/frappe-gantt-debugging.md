# Frappe-Gantt Debugging Lessons Learned

**Date:** December 30, 2024
**Library:** frappe-gantt v1.0.4
**Stack:** React 19 + Vite 7 + TypeScript + Tailwind CSS v4

---

## Summary

After extensive debugging where Gantt chart task bars were invisible despite being present in the DOM, the root cause was identified as **custom CSS overrides conflicting with frappe-gantt's internal positioning**.

---

## The Problem

Task bars were:
- Present in the DOM (verified via console: "Found 5 bars, 4 wrappers")
- Positioned at wrong Y coordinates (bottom of chart instead of aligned with rows)
- Grid lines were not visible
- Dependency arrows were not rendering

---

## Root Cause

**Custom CSS overrides in `gantt-overrides.css` were breaking frappe-gantt's layout calculations.**

Specifically:
1. Using wrong CSS selectors (`.gantt-container` instead of `.gantt`)
2. Forcing dimensions that conflicted with internal calculations
3. CSS specificity wars with the library's own styles

---

## Key Lessons

### 1. frappe-gantt v1.x Dependencies Format

**Wrong (v0.x style):**
```typescript
dependencies: "task1, task2"  // Comma-separated string
```

**Correct (v1.x):**
```typescript
dependencies: ["task1", "task2"]  // Array of strings
```

The TypeScript types for frappe-gantt may be outdated. Use `as any` cast if needed:
```typescript
ganttRef.current = new Gantt(containerRef.current, tasks as any, options as any);
```

### 2. CSS Selectors for frappe-gantt

The library renders an SVG with class `.gantt`. All internal elements are children of this SVG.

**Wrong:**
```css
.gantt-container .bar { }  /* Container is just a wrapper */
```

**Correct:**
```css
.gantt .bar { }  /* Target SVG elements directly */
```

### 3. Don't Override Core Layout CSS

These properties should NOT be customized:
- Bar Y positions (calculated dynamically)
- Row heights (tied to internal calculations)
- SVG viewBox dimensions
- Transform properties on bars

**Safe to customize:**
- Colors (`fill`, `stroke`)
- Font styles
- Border radius on popups
- Scrollbar styling on container

### 4. The Nuclear Option Works

When debugging complex CSS issues, **strip everything back to vanilla**:

```typescript
// Minimal working configuration
const options = {
  view_mode: viewMode,
  scroll_to: scrollToDate,
  on_click: handleTaskClick,
};

ganttRef.current = new Gantt(containerRef.current, tasks, options);
```

```tsx
// Minimal container - no custom classes
return <div ref={containerRef} />;
```

If this works but your styled version doesn't, the problem is in your CSS.

### 5. Tailwind v4 Compatibility

Tailwind CSS v4 works fine with frappe-gantt out of the box. The preflight CSS does NOT break the library.

**Don't do this:**
```css
/* This breaks everything */
.gantt svg,
.gantt svg * {
  all: revert;
}
```

### 6. Debugging DOM vs Visual

When elements exist in DOM but aren't visible:

```javascript
// Check in browser console
document.querySelectorAll('.gantt .bar').forEach((bar, i) => {
  const rect = bar.getBoundingClientRect();
  console.log(`Bar ${i}: y=${rect.y}, height=${rect.height}`);
});
```

If Y positions are wrong (e.g., all at bottom), it's a CSS positioning issue, not a rendering issue.

---

## Working Configuration

### GanttChart.tsx
```typescript
import { useEffect, useRef, useCallback } from 'react';
import Gantt from 'frappe-gantt';
import type { GanttTask, ViewMode } from '../../types/project';
import 'frappe-gantt/dist/frappe-gantt.css';

export function GanttChart({ tasks, viewMode, onTaskClick }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<Gantt | null>(null);

  useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return;
    containerRef.current.innerHTML = '';

    const options = {
      view_mode: viewMode,
      scroll_to: earliestDate,
      on_click: handleTaskClick,
    };

    ganttRef.current = new Gantt(containerRef.current, tasks as any, options as any);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tasks, viewMode, handleTaskClick]);

  return <div ref={containerRef} />;
}
```

### GanttTask Type
```typescript
export interface GanttTask {
  id: string;
  name: string;
  start: string;       // "YYYY-MM-DD" format
  end: string;         // "YYYY-MM-DD" format
  progress: number;    // 0-100
  dependencies: string[];  // Array, not comma-separated string
  custom_class?: string;
}
```

---

## What NOT To Do

1. **Don't** create extensive CSS override files without testing incrementally
2. **Don't** assume TypeScript types are accurate for the library version
3. **Don't** use `all: revert` to fix CSS conflicts
4. **Don't** set fixed heights on the SVG container
5. **Don't** override transform/translate properties on bars

---

## Debugging Checklist

When frappe-gantt bars aren't visible:

- [ ] Check browser console for errors
- [ ] Verify tasks array is not empty
- [ ] Verify date formats are "YYYY-MM-DD"
- [ ] Check if bars exist in DOM (`.gantt .bar`)
- [ ] Check bar positions with `getBoundingClientRect()`
- [ ] Test with ZERO custom CSS
- [ ] Verify dependencies are arrays, not strings
- [ ] Check for CSS specificity conflicts

---

## Bar Colors and Progress Visualization (Added: December 31, 2024)

### The Two-Layer Bar Structure

frappe-gantt renders **TWO overlapping rectangles** for each task:

```
┌─────────────────────────────────────────────┐
│ .bar (base) - uses `color` property         │
│ ┌──────────────────────────────────┐        │
│ │ .bar-progress - uses `color_progress`    │ remaining
│ │        (width = progress %)       │        │ visible
│ └──────────────────────────────────┘        │
└─────────────────────────────────────────────┘
```

### Default CSS Variables

frappe-gantt uses these CSS variables with **problematic defaults**:

```css
:root {
  --g-bar-color: #fff;        /* WHITE - bars invisible on light bg! */
  --g-progress-color: #dbdbdb; /* Gray - covers colored bars */
}
```

### The Color Properties

To properly color bars, you MUST set BOTH properties:

```typescript
const task = {
  id: 'task-1',
  name: 'My Task',
  start: '2024-01-01',
  end: '2024-01-15',
  progress: 80,
  color: '#3b82f6',          // Base bar color (light blue)
  color_progress: '#2563eb', // Progress overlay color (dark blue)
};
```

**What happens without `color_progress`:**
- The `.bar` gets your custom color via inline style
- The `.bar-progress` uses default `--g-progress-color` (#dbdbdb gray)
- Gray progress covers your colored bar, making it look wrong!

### How Colors Are Applied (Source Code)

From `node_modules/frappe-gantt/src/bar.js`:

```javascript
// Line 118: Base bar color
if (this.task.color) this.$bar.style.fill = this.task.color;

// Line 164: Progress bar color
if (this.task.color_progress) this.$bar_progress.style.fill = this.task.color_progress;
```

### Recommended Color Scheme

Use status-based colors with darker shades for progress:

```typescript
const TASK_COLORS = {
  pending: { bar: '#94a3b8', progress: '#64748b' },
  in_progress: { bar: '#3b82f6', progress: '#2563eb' },
  completed: { bar: '#22c55e', progress: '#16a34a' },
  blocked: { bar: '#ef4444', progress: '#dc2626' },
};
```

### Debugging Bar Colors

1. **Check inline styles in DOM:**
   ```html
   <rect class="bar" style="fill: rgb(34, 197, 94);">
   <rect class="bar-progress" style="fill: rgb(22, 163, 74);">
   ```

2. **If colors aren't applied:**
   - Verify `color` property exists on task objects
   - Check frappe-gantt's internal tasks: `(ganttRef.current as any).tasks`
   - Ensure no CSS override file is breaking things

3. **If bars are invisible:**
   - Default `--g-bar-color` is WHITE
   - Check if custom CSS overrides are loaded
   - Verify CSS import order (frappe-gantt CSS should load first)

### CSS Override Files - DANGER!

**DON'T** create extensive `gantt-overrides.css` files. They consistently break frappe-gantt.

If you must customize colors via CSS:
- Only use class-based selectors like `.bar-wrapper.task-completed .bar`
- Never set default `.bar { fill: ... }` without `!important`
- Test incrementally after each change

**PREFERRED:** Use `color` and `color_progress` properties directly on task objects.

---

## Resources

- [frappe-gantt GitHub](https://github.com/frappe/gantt)
- [frappe-gantt v1.x Documentation](https://github.com/frappe/gantt#readme)
- Context7 documentation (for up-to-date API reference)
- [Asana Gantt Chart Basics](https://asana.com/resources/gantt-chart-basics)
- [Monday.com Gantt View](https://support.monday.com/hc/en-us/articles/360015643840)
