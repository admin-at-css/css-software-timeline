# Timeline Auto-Update Instructions for CLAUDE.md

Add the following section to any project's `CLAUDE.md` file to enable automatic timeline.yaml updates when working with Claude Code.

---

## Template to Add to Your Project's CLAUDE.md

```markdown
## Timeline Tracking

This project uses `timeline.yaml` for progress tracking with CSS Software Timeline.

### Automatic Updates
After completing significant work, update `timeline.yaml` in the project root:

1. **When completing a task:**
   - Set `status: "completed"`
   - Set `progress: 100`
   - Update `actualHours` with time spent

2. **When starting a task:**
   - Set `status: "in_progress"`
   - Update `progress` percentage (estimate)

3. **When blocked:**
   - Set `status: "blocked"`
   - Add a comment explaining the blocker

4. **When logging hours:**
   - Update `actualHours` field for the task
   - Update project-level `actualHours` (sum of all tasks)

### Example Update
After completing a feature, update the relevant task in `timeline.yaml`:

\`\`\`yaml
tasks:
  - id: "feature-x"
    name: "Implement Feature X"
    status: "completed"      # Changed from "in_progress"
    progress: 100            # Changed from 60
    actualHours: 8           # Added/updated
\`\`\`

### Update Metadata
Always update the `metadata.lastUpdated` timestamp:

\`\`\`yaml
metadata:
  lastUpdated: "2024-12-30T15:30:00Z"  # Use current ISO timestamp
  schemaVersion: "1.0.0"
\`\`\`

### Task Status Values
- `pending` - Not started
- `in_progress` - Currently working
- `completed` - Done
- `blocked` - Can't proceed (explain in comments)

### Important
- Keep task IDs consistent (don't rename them)
- Update `actualHours` incrementally
- Don't modify `estimatedHours` after planning phase
- Use YAML comments for context when helpful

### Handling Dynamic Changes (Living Timeline)

Projects evolve. New features get added, scope changes, and unexpected work appears. Here's how to handle these situations:

#### Adding New Tasks Mid-Project
When new features or tasks are discovered:

\`\`\`yaml
# Insert new task in logical order, update dependencies
tasks:
  - id: "existing-task"
    name: "Existing Task"
    status: "completed"
    # ...

  # NEW: Added during implementation - discovered need for caching
  - id: "add-caching"
    name: "Add Redis Caching Layer"
    description: "Performance optimization discovered during load testing"
    startDate: "2025-01-05"
    endDate: "2025-01-08"
    estimatedHours: 12
    status: "pending"
    progress: 0
    dependencies: ["existing-task"]
    type: "task"
    # Use YAML comment to note why this was added
    # Added: 2025-01-05 - discovered during load testing

  - id: "next-task"
    name: "Next Task"
    dependencies: ["add-caching"]  # Update downstream dependencies
    # ...
\`\`\`

#### Adjusting Estimates (Scope Changes)
When estimates need revision:

\`\`\`yaml
- id: "feature-x"
  name: "Feature X"
  estimatedHours: 16      # Original: 8h - scope expanded to include Y
  actualHours: 10
  # Note: Estimate increased from 8h due to additional Y requirement
\`\`\`

#### Re-sequencing Tasks
When priorities shift, update `startDate`, `endDate`, and `dependencies` accordingly. Always check downstream dependencies.

#### Monthly Allocation Updates
Update `monthlyAllocation` when workload shifts:

\`\`\`yaml
monthlyAllocation:
  "2025-01": 48   # Original: 32 - increased due to new feature
  "2025-02": 24   # Original: 40 - reduced, moved work to Jan
\`\`\`

#### Version Notes (Optional)
For significant changes, add notes in metadata:

\`\`\`yaml
metadata:
  lastUpdated: "2025-01-05T10:00:00Z"
  schemaVersion: "1.0.0"
  # changelog:
  #   - "2025-01-05: Added caching task, adjusted Q1 estimates"
  #   - "2025-01-02: Initial timeline created"
\`\`\`
```

---

## Minimal Version (Copy-Paste Ready)

If you want a shorter version:

```markdown
## Timeline Tracking

Update `timeline.yaml` after completing work:
- Set task `status` to "completed" and `progress` to 100
- Update `actualHours` with time spent
- Update `metadata.lastUpdated` timestamp

Task statuses: pending | in_progress | completed | blocked

**Dynamic Changes:** When adding new features mid-project, insert new tasks in logical order with proper dependencies. Use YAML comments to note when/why tasks were added. Update downstream task dependencies as needed.
```

---

## Example Project CLAUDE.md

Here's a complete example of a project's CLAUDE.md with timeline instructions:

```markdown
# CLAUDE.md - My Project

## Overview
This is my awesome project that does X, Y, Z.

## Development Guidelines
- Use TypeScript for all new code
- Write tests for new features
- Follow existing code patterns

## Timeline Tracking

This project uses `timeline.yaml` for progress tracking.

After completing significant work, update the relevant task:
- Set `status: "completed"` and `progress: 100`
- Update `actualHours` with time spent
- Update `metadata.lastUpdated` timestamp

Task statuses: pending | in_progress | completed | blocked

**Adding new work:** Insert new tasks with proper dependencies, use YAML comments to note when/why added.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
```
