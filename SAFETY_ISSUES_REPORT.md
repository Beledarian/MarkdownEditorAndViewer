# Safety Issues Report

This document serves as a baseline for tracking and addressing safety and security issues within the Markdown Editor and Viewer application.

## Status Overview

| Metric | Count |
| :--- | :--- |
| **High Severity** | 0 |
| **Medium Severity** | 0 |
| **Low Severity** | 0 |
| **Resolved** | 3 |

## Identified Issues

### 1. [RESOLVED] Cross-Site Scripting (XSS) Vulnerability via `rehype-raw`
*   **Severity:** **High**
*   **Location:** `src/App.jsx` (Line 808)
*   **Description:** The application uses `rehype-raw` to render Markdown. This plugin allows raw HTML to be parsed and rendered. Without a sanitization step (like `rehype-sanitize`), malicious scripts embedded in Markdown files (e.g., `<script>alert('XSS')</script>` or `<img src=x onerror=alert(1)>`) will be executed when the file is viewed.
*   **Recommendation:** Install `rehype-sanitize` and add it to the `rehypePlugins` array in `App.jsx` after `rehype-raw`. Configure it to allow only safe tags and attributes.

### 2. [RESOLVED] Unsafe HTML Export
*   **Severity:** **Medium**
*   **Location:** `src/App.jsx` (Line 413)
*   **Description:** The "Export HTML" feature extracts the `innerHTML` of the preview pane. If the preview contains malicious scripts (due to the issue above), those scripts will be included in the exported HTML file. When a user opens the exported file, the scripts will execute.
*   **Recommendation:** Sanitize the HTML content before creating the blob for export, or rely on the sanitized output from the fix in Issue #1.

### 3. [RESOLVED] Missing `rel="noopener noreferrer"` on External Links
*   **Severity:** **Low**
*   **Location:** Global (Markdown Rendering)
*   **Description:** Links to external sites (`target="_blank"`) can expose the application to "tabnabbing" attacks if `rel="noopener noreferrer"` is not explicitly set.
*   **Recommendation:** Verify if `react-markdown` adds this automatically. If not, use a plugin or custom renderer to ensure all external links have this attribute.

## Completed Tasks

- [x] **Initial Safety Analysis**: Analyzed codebase for common vulnerabilities.
- [x] **Fix XSS Vulnerability**: Implement `rehype-sanitize`.
- [x] **Secure HTML Export**: Ensure exported HTML is clean. (Fixed via preview sanitization)
- [x] **Audit Dependencies**: Run `npm audit` to check for known vulnerabilities in dependencies.
- [x] **Secure External Links**: Implemented `rehype-external-links` to add `noopener noreferrer`.

## Next Steps

1.  **Prioritize fixing the XSS vulnerability** as it poses the most significant risk.
2.  **Install `rehype-sanitize`**: `npm install rehype-sanitize`.
3.  **Update `App.jsx`** to include the sanitization plugin.
4.  **Verify** that valid HTML (like `<b>bold</b>`) still works while scripts are stripped.
