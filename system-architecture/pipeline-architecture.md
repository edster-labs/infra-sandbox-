# 🛠️ Autonomous Documentation Engine & CI/CD Pipeline Architecture

Welcome to the architectural breakdown of the automation engine powering the **Infra Sandbox** repository layout. This document details how changes pushed to markdown documentation assets are discovered, mapped, compiled, and published live to the internet completely hands-free.

---

## 🏗️ System Architecture Flowchart

```text
[ Data Layer: New Lab/Guide .md File Pushed ]
                      │
                      ▼
[ Orchestration Layer: GitHub Actions Workflow ]
                      │
  ├── Wakes up a clean Linux execution environment
  └── Prepares a native Python 3.10 virtual environment
                      │
                      ▼
[ Automation Core: Custom Python Engine (build_indices.py) ]
                      │
  ├── Scans target directories recursively
  ├── Opens every documentation file to read its H1 header title (#)
  ├── Compiles structured relative Markdown pathing maps
  └── Injects the clean links between <!-- toc --> and <!-- endtoc --> tags
                      │
                      ▼
[ State Management: Git Auto-Commit Pipeline ]
                      │
  └── Commits and pushes the modified README.md indices back to the repo
                      │
                      ▼
[ Web Server Delivery Layer: Jekyll Engine / GitHub Pages ]
                      │
  └── Converts the raw Markdown workspace files into browseable internet content
```

---

## ⚙️ Component Operations Matrix

| Pipeline Component | Active Execution Tool | Operational Responsibility / Mechanics |
| :--- | :--- | :--- |
| **Pipeline Trigger** | GitHub Events Runner | Tracks the commit pipeline. It initiates a container build only when modifications are registered inside markdown patterns (`**/*.md`). |
| **Automation Controller** | `actions/setup-python@v5` | Boots up an isolated execution container to support programmatic script handling without taxing native resources. |
| **Directory Indexer** | `build_indices.py` (Python Core) | Programmatically parses the workspace file structures. It isolates content strings, builds link mappings, and writes to files safely. |
| **State Synchronizer** | `git-auto-commit-action` | Tracks localized template changes made by the script inside the container runner and writes them permanently to the origin log. |
| **Web Server Router** | Jekyll Core Engine (`_config.yml`) | Maps standard relative directory queries (e.g., `./network-labs/`) to search for index pages, preventing internet 404 routing drops. |

---

## 🔍 Code Base Insight: How the Python Core Parses Content

The heart of the directory scanner relies on custom Python logic to parse the markdown syntax without needing external package footprints:

```python
def extract_markdown_title(file_path):
    """Extracts the first H1 header found in a markdown file to use as anchor text."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("# "):
                    # Strip out the marker to isolate raw display text
                    return line[2:].strip()
    except Exception as e:
        print(f"Error reading title from {file_path}: {e}")
```

---

## 💡 Architectural Benefits

1. **Zero Administrative Overhead:** Adding new documentation, lab parameters, or system writeups requires no index alterations. The pipeline automatically manages the links.
2. **Unified Presentation Profile:** The file links work interchangeably inside the native GitHub code review browser interface and across the live public internet portfolio domain.
3. **No External Dependencies:** The system utilizes native workflows and pure Python standard library packages, ensuring security compliance and fast container build execution speeds.
