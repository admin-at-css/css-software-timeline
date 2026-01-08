# Timeline YAML Schema

**Version:** 1.0.0
**Last Updated:** December 30, 2024

---

## Overview

Each project repository contains a `timeline.yaml` file in its root directory. This file describes the project's metadata, tasks, and progress for display in the CSS Software Timeline application.

---

## File Location

```
your-project/
├── timeline.yaml    # <-- Place here (root directory)
├── src/
├── package.json
└── ...
```

---

## Full Schema

```yaml
# timeline.yaml - Project Timeline Definition
# Schema Version: 1.0.0

# ============================================
# PROJECT METADATA
# ============================================
project:
  # Required: Unique identifier (use kebab-case)
  id: "project-name"

  # Required: Human-readable project name
  name: "Project Display Name"

  # Required: Brief description (1-2 sentences)
  description: "What this project does and why it exists."

  # Required: Current project status
  # Options: draft | planning | in_progress | on_hold | completed | cancelled
  status: "in_progress"

  # Required: Project timeline
  startDate: "2024-12-01"    # YYYY-MM-DD format
  endDate: "2025-03-15"      # YYYY-MM-DD format, or null if ongoing

  # Required: Hour estimates
  estimatedHours: 240
  actualHours: 85            # Optional, defaults to 0

  # Required: Priority level
  # Options: critical | high | medium | low
  priority: "high"
  priorityReason: "Needed for Q1 2025 team expansion"  # Optional

  # Required: At least one stakeholder
  stakeholders:
    - name: "Kevin Zakaria"
      role: "Product Owner"
    - name: "CSS Team"
      role: "End Users"

  # Required: Repository information
  repository:
    url: "https://github.com/username/repo"
    branch: "main"           # Optional, defaults to "main"

  # Optional: Color for Gantt chart (hex code)
  color: "#3b82f6"

# ============================================
# TASKS
# ============================================
tasks:
  - id: "task-1"                          # Required: Unique within project
    name: "Requirements & Planning"        # Required: Task name
    description: "Gather requirements..."  # Optional: Detailed description
    startDate: "2024-12-01"               # Required: YYYY-MM-DD
    endDate: "2024-12-15"                 # Required: YYYY-MM-DD
    estimatedHours: 20                    # Required: Planned hours
    actualHours: 18                       # Optional: Hours spent
    status: "completed"                   # Required: pending | in_progress | completed | blocked
    progress: 100                         # Required: 0-100 percentage
    dependencies: []                      # Required: Array of task IDs (can be empty)
    assignee: "Kevin Zakaria"             # Optional: Who's working on it
    type: "task"                          # Optional: "task" (default) or "milestone"

  - id: "task-2"
    name: "UI/UX Design"
    startDate: "2024-12-10"
    endDate: "2024-12-31"
    estimatedHours: 40
    actualHours: 35
    status: "completed"
    progress: 100
    dependencies: ["task-1"]              # Depends on task-1 completing first
    type: "task"

  - id: "milestone-1"
    name: "Design Complete"
    startDate: "2024-12-31"
    endDate: "2024-12-31"                 # Same date for milestones
    estimatedHours: 0
    status: "completed"
    progress: 100
    dependencies: ["task-2"]
    type: "milestone"

# ============================================
# MONTHLY ALLOCATION (Optional)
# ============================================
# Pre-planned hours per month for capacity planning
monthlyAllocation:
  "2024-12": 60
  "2025-01": 80
  "2025-02": 60
  "2025-03": 40

# ============================================
# BACKLOG (Optional)
# ============================================
# Future ideas not yet scheduled into phases
backlog:
  - id: "feature-idea"                    # Required: Unique identifier
    name: "Feature Name"                   # Required: Short name
    description: "What this feature does"  # Optional: Details
    priority: "medium"                     # Required: critical | high | medium | low
    estimatedHours: 8                      # Optional: Rough estimate
    status: "idea"                         # Required: idea | researching | approved | rejected
    requestedBy: "Kevin Zakaria"           # Optional: Who requested this
    dateAdded: "2024-12-30"               # Required: When added to backlog

# ============================================
# METADATA
# ============================================
metadata:
  lastUpdated: "2024-12-30T10:30:00Z"     # ISO 8601 timestamp
  schemaVersion: "1.0.0"
```

---

## Field Reference

### Project Status Values

| Status | Description | Color |
|--------|-------------|-------|
| `draft` | Initial idea, not yet planned | Gray |
| `planning` | Being scoped and designed | Purple |
| `in_progress` | Active development | Yellow/Amber |
| `on_hold` | Paused temporarily | Orange |
| `completed` | Finished successfully | Green |
| `cancelled` | Stopped, won't continue | Red |

### Task Status Values

| Status | Description | Color |
|--------|-------------|-------|
| `pending` | Not started yet | Gray |
| `in_progress` | Currently being worked on | Blue |
| `completed` | Done | Green |
| `blocked` | Can't proceed (dependency/issue) | Red |

### Priority Values

| Priority | Description |
|----------|-------------|
| `critical` | Must be done immediately, blocking other work |
| `high` | Important, should be prioritized |
| `medium` | Normal priority |
| `low` | Nice to have, can wait |

### Backlog Status Values

| Status | Description |
|--------|-------------|
| `idea` | Just an idea, not yet evaluated |
| `researching` | Being investigated for feasibility |
| `approved` | Approved for future implementation |
| `rejected` | Won't be implemented (document why) |

---

## Minimal Example

```yaml
project:
  id: "my-project"
  name: "My Project"
  description: "A simple project."
  status: "in_progress"
  startDate: "2024-12-01"
  endDate: "2025-01-31"
  estimatedHours: 40
  priority: "medium"
  stakeholders:
    - name: "Developer"
      role: "Owner"
  repository:
    url: "https://github.com/user/repo"

tasks:
  - id: "task-1"
    name: "Build feature"
    startDate: "2024-12-01"
    endDate: "2025-01-31"
    estimatedHours: 40
    status: "in_progress"
    progress: 50
    dependencies: []

metadata:
  lastUpdated: "2024-12-30T00:00:00Z"
  schemaVersion: "1.0.0"
```

---

## Validation Rules

1. **Dates** must be in `YYYY-MM-DD` format
2. **Task IDs** must be unique within the project
3. **Dependencies** must reference existing task IDs
4. **Progress** must be between 0 and 100
5. **estimatedHours** must be a positive number
6. **endDate** must be >= startDate (or null for ongoing projects)

---

## Tips

### Keep It Updated
Update `timeline.yaml` whenever you:
- Complete a task
- Start a new task
- Change project status
- Log actual hours

### Use Comments
YAML supports comments - use them!
```yaml
tasks:
  - id: "api-design"
    name: "API Design"
    # NOTE: Blocked waiting on stakeholder approval
    status: "blocked"
```

### Milestones
For milestones, set `startDate` and `endDate` to the same date:
```yaml
  - id: "v1-release"
    name: "v1.0 Release"
    startDate: "2025-01-31"
    endDate: "2025-01-31"
    estimatedHours: 0
    status: "pending"
    progress: 0
    dependencies: ["final-testing"]
    type: "milestone"
```
