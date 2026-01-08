# Timeline.yaml Guide

This guide explains how to create and maintain `timeline.yaml` files for CSS projects to track progress on the [CSS Software Timeline](https://github.com/admin-at-css/css-software-timeline) dashboard.

## Quick Start

1. **Copy a template** from `templates/` to your project root as `timeline.yaml`
   - Use `timeline-minimal.yaml` for idea/planning phase projects
   - Use `timeline-full.yaml` for active development projects

2. **Fill in your project details** (see Field Reference below)

3. **Commit and push** to your repository

4. **Add repo to config** in css-software-timeline (if not already listed)

5. Your project will appear on the dashboard after the next build

---

## Choosing a Template

| Template | Use When | Complexity |
|----------|----------|------------|
| `timeline-minimal.yaml` | Project is an idea, in planning, or early stage | ~30 lines |
| `timeline-full.yaml` | Project is in active development with phases/milestones | ~120 lines |

**You can always upgrade** from minimal to full as the project evolves.

---

## Field Reference

### Project Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | Yes | string | Unique identifier, lowercase with dashes (e.g., `css-chrome-extension`) |
| `name` | Yes | string | Human-readable project name |
| `description` | Yes | string | What problem does this solve? |
| `status` | Yes | enum | Current project state (see Status Values) |
| `startDate` | Yes | date | When work begins (YYYY-MM-DD) |
| `endDate` | No | date | Target completion date |
| `estimatedHours` | Yes | number | Total hours estimate (0 if unknown) |
| `actualHours` | No | number | Hours actually spent |
| `priority` | Yes | enum | Priority level (see Priority Values) |
| `priorityReason` | No | string | Why this priority was assigned |
| `stakeholders` | Yes | array | At least one {name, role} object |
| `repository.url` | Yes | string | GitHub repository URL |
| `repository.branch` | No | string | Default branch (defaults to "main") |
| `color` | No | string | Hex color for dashboard display |

### Task Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | Yes | string | Unique within project, lowercase with dashes |
| `name` | Yes | string | Task name shown on Gantt chart |
| `description` | No | string | Detailed task description |
| `startDate` | Yes | date | Task start date |
| `endDate` | Yes | date | Task end date |
| `estimatedHours` | Yes | number | Hours estimate (0 for milestones) |
| `actualHours` | No | number | Hours actually spent |
| `status` | Yes | enum | Current task state (see Status Values) |
| `progress` | Yes | number | 0-100 percentage complete |
| `dependencies` | Yes | array | Array of task IDs this depends on |
| `assignee` | No | string | Person assigned |
| `type` | No | enum | `task` (default) or `milestone` |

---

## Status Values

### Project Status

| Status | When to Use | Dashboard Color |
|--------|-------------|-----------------|
| `draft` | Just an idea, not committed | Gray |
| `planning` | Actively planning, not started | Blue |
| `in_progress` | Work is happening | Yellow |
| `on_hold` | Paused for some reason | Orange |
| `completed` | All done | Green |
| `cancelled` | Not going to happen | Red |

### Task Status

| Status | When to Use |
|--------|-------------|
| `pending` | Not started yet |
| `in_progress` | Currently working on |
| `completed` | Done |
| `blocked` | Can't proceed (explain in description) |

### Priority Values

| Priority | When to Use |
|----------|-------------|
| `critical` | Must ship ASAP, blocking other work |
| `high` | Important, should be prioritized |
| `medium` | Normal priority |
| `low` | Nice to have, can wait |

---

## Hours Tracking

Hours are the key metric for stakeholder visibility. Track them accurately.

### Estimating Hours

- **For new projects**: Make your best guess, update as you learn
- **For tasks**: Break down into phases, estimate each
- **Set to 0** if completely unknown (better than a wild guess)

### Logging Hours

Update `actualHours` as you work:

```yaml
# Before working
estimatedHours: 40
actualHours: 20

# After 8 hours of work
estimatedHours: 40
actualHours: 28
```

**Also update project-level `actualHours`** (sum of all task hours).

---

## Maintenance Workflow

### When Starting Work

1. Set task `status` to `in_progress`
2. Update `progress` percentage estimate

```yaml
# Before
- id: "feature-x"
  status: "pending"
  progress: 0

# After starting
- id: "feature-x"
  status: "in_progress"
  progress: 10
```

### While Working

1. Update `progress` periodically (every few hours or at end of day)
2. Update `actualHours` with time spent

```yaml
# During work
- id: "feature-x"
  status: "in_progress"
  progress: 60
  actualHours: 12
```

### When Completing

1. Set `status` to `completed`
2. Set `progress` to `100`
3. Set final `actualHours`
4. Update project-level `actualHours`
5. Update `metadata.lastUpdated`

```yaml
# After completing
- id: "feature-x"
  status: "completed"
  progress: 100
  actualHours: 18
```

### Commit Message Convention

```
chore: update timeline.yaml progress

- Task X: 60% → 80%
- Added 4h actual hours
```

---

## Common Patterns

### Phases with Milestones

Structure work into phases, each followed by a milestone:

```yaml
tasks:
  - id: "phase-1"
    name: "Phase 1: Setup"
    type: "task"
    dependencies: []

  - id: "milestone-1"
    name: "Phase 1 Complete"
    type: "milestone"
    estimatedHours: 0
    dependencies: ["phase-1"]

  - id: "phase-2"
    name: "Phase 2: Features"
    type: "task"
    dependencies: ["milestone-1"]
```

### Parallel Tasks

Tasks can run in parallel by depending on the same parent:

```yaml
tasks:
  - id: "setup"
    name: "Project Setup"
    dependencies: []

  - id: "frontend"
    name: "Frontend Development"
    dependencies: ["setup"]

  - id: "backend"
    name: "Backend Development"
    dependencies: ["setup"]

  - id: "integration"
    name: "Integration"
    dependencies: ["frontend", "backend"]
```

### Idea/Planning Projects

For projects not yet started, use a single discovery task:

```yaml
tasks:
  - id: "discovery"
    name: "Discovery & Planning"
    startDate: "2025-01-08"
    endDate: "2025-01-22"
    estimatedHours: 8
    status: "pending"
    progress: 0
    dependencies: []
```

---

## Validation

The dashboard validates your `timeline.yaml`. Common errors:

| Error | Fix |
|-------|-----|
| "Missing required field: X" | Add the required field |
| "Invalid date format" | Use YYYY-MM-DD format |
| "Invalid status value" | Use one of the allowed enum values |
| "Dependency not found" | Check task ID spelling in dependencies |
| "Stakeholders must be non-empty" | Add at least one stakeholder |

---

## Tips

1. **Start minimal, add detail later** - You can always upgrade the schema
2. **Update regularly** - Stale data is worse than no data
3. **Be honest with estimates** - It's okay to be wrong, just update as you learn
4. **Use milestones for checkpoints** - They help stakeholders see progress
5. **Keep descriptions brief** - The Gantt chart has limited space

---

## Getting Help

- Check existing `timeline.yaml` files in other CSS repos for examples
- Look at `css-software-timeline/timeline.yaml` as a complete reference
- Open an issue if something isn't clear
