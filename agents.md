# Agent-Assisted Development

This project utilizes AI agents to accelerate development and improve code quality. This document outlines the agents involved and their roles.

## Jules (@google/jules)

Jules is an AI-powered coding agent that can be assigned complex, end-to-end software development tasks.

### Role

Jules is used for:
- **Feature Implementation:** Implementing new features from a high-level description.
- **Large-Scale Refactoring:** Performing codebase-wide refactors and optimizations.
- **Bug Fixes:** Analyzing and fixing complex bugs.
- **Parallel Development:** Working on multiple features simultaneously in independent sessions to speed up development.

### Workflow

1.  **Task Definition:** A clear, high-level task is defined (e.g., "Implement dark mode theming").
2.  **Delegation:** The task is assigned to one or more Jules sessions using the `jules new` command. For parallel work, multiple, distinct tasks are created. For competing solutions to a single problem, the `--parallel` flag can be used.
3.  **Monitoring:** The progress of Jules sessions is tracked via the provided console URL.
4.  **Integration:** Once a session is complete, the resulting code changes (patches) are pulled, reviewed, and merged into the main branch using Git.
