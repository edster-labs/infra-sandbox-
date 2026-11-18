# Architectural Blueprint: 

## 1. Core Mission, Identity & Voice

* Repository: edster-labs/infra-sandbox- | Live Portal: https://github.io
* Purpose: Centralized personal engineering sandbox and laboratory notebook tracking network topologies, active deployments, cross-layer OSI threat mitigations, hypervisor optimizations, and cryptographic reference ledgers.
* Voice & Style: Written in grounded, practical first-person, avoiding buzz words, corporate or academic language when possible, while framing active lab directories as an evolving work-in-progress. Everything remains in English (the global enterprise IT standard).

## 🏗️ 2. Repository Directory Structure & Role Map

* index.md / README.md (Root): Entry portal containing the introductory mission banner, quick repository directory links, and the master interactive Site Tree (<!-- tree -->).
* network-labs/ (Core Heart of Repo): Practical L2/L3 network topologies, routing protocols, switching redundancy, and full-stack case studies (e.g., cisco-ospfv2-single-area.md, cisco-ospfv2-multi-area.md, cisco-eigrp-routing-lab.md), plus interactive visualizers.
* eve-ng-guides/ (Static Troubleshooting Vault): Operational runbooks for EVE-NG emulation, QEMU master image baking, Cisco IOL/IOSv provisioning, and Linux kernel bridge tuning. (Omit "work in progress" disclaimers here).
* cheat-sheets/: Operational logbook of command snippets and baselines for isolated Linux DHCP/routing nodes, Netplan, and Windows Firewall PowerShell rules.
* sec-notebook/: Reference ledger for cryptographic principles (TLS 1.2/1.3, WPA3-SAE) and cross-layer OSI DDoS mitigation frameworks (layer-1-physical through layer-7-application).
* system-architecture/: Meta-documentation detailing the repository's own CI/CD automation pipeline and UI/UX design choices.
* _includes/head-custom.html: Theme hook file injected into <head> across all pages.
* assets/css/style.css: Custom dark slate theme, typography, readability containers, and print stylesheet.
* build_indices.py & .github/workflows/update-toc.yml: Autonomous Python indexing engine triggered on push to main.

## ⚙️ 3. CI/CD Automation Engine (build_indices.py & GitHub Actions)

* Trigger (update-toc.yml): Automatically runs whenever .md files are pushed to main (or via manual workflow_dispatch).
* How build_indices.py Works:
	1. Scans target directories (cheat-sheets, eve-ng-guides, network-labs, sec-notebook, system-architecture).
	2. Extracts the first # H1 title from Line 1 of every .md file. (Critical: Never place images or HTML tags above Line 1 # H1 in lab files).
	3. Updates local folder README.md indexes between <!-- toc --> and <!-- endtoc -->. (Critical: Do not put <!-- toc --> markers inside individual case study files).
	4. Rebuilds the global interactive <details> accordion tree inside the root README.md / index.md between <!-- tree --> and <!-- endtree -->.
* Tree Rendering Rules:
	* Folders render collapsed by default (no open boolean attribute on <details>).
	* HTML strings inside build_indices.py use zero leading spaces at the left margin with \n\n breaks around block elements so Jekyll compiles clean HTML rather than escaping indented lines into grey code blocks.
	* Monospace typography (ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace) is enforced at 20px (root) and 17px (file links).

## 🎨 4. Theme, CSS Styling & Browser Extension Lock

* Base Theme: jekyll-theme-primer (automatically inherited by GitHub Pages).
* Custom Dark Slate Palette (assets/css/style.css):
	* Canvas Background: #0f172a (rgb(15, 23, 42))
	* Primary Body Text: #cbd5e1 / #e2e8f0
	* Interactive Links & Summaries: #38bdf8 (cyan accent)
* Dark Reader Extension Protection (_includes/head-custom.html):
	* Contains <meta name="darkreader-lock">.
	* jekyll-theme-primer automatically injects _includes/head-custom.html into <head> on every page, preventing browser extensions like Dark Reader from double-inverting #0f172a into washed-out grey (#202227). (Never put <meta> tags inside .md files).
* Readability & Print Rules (assets/css/style.css):
	* Intro banners use <section style="max-width: 720px !important; margin: 16px 0 28px 0 !important;"> (or .brief-container) to prevent ultra-wide line stretching on desktop monitors.
	* @media print inverts the dark slate UI to #FFFFFF white background with #1d70b8 corporate blueprint blue links when printing (Ctrl + P).

## 🧩 5. Strict Jekyll / Kramdown Markdown & HTML Rules

GitHub's preview parser is lenient, whereas GitHub Pages' Kramdown parser is strict. Every new or edited .md file must follow these exact rules:
1. # H1 on Line 1: Every lab/guide must start on Line 1 with # Title so build_indices.py indexes it accurately.
2. Collapsible Device Configs (<details>):
	* Always include markdown="1" on the opening <details> tag (<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">) so Kramdown compiles fenced code blocks (```ios) inside HTML tags instead of rendering literal backticks.
	* Always leave 1 empty blank line after </summary> before opening a code fence, and 1 empty blank line after the closing code fence before </details>.
	* Every <details> block must have its own matching </details> closing tag before the next block starts.
3. Images & Assets:
	* Prefer verified GitHub attachment URLs or verified repo paths under assets/images/—never use unverified relative paths.
4. Chat Transfer Rule:
	* When generating or editing .md files containing triple backticks (```), avoid wrapping the entire file inside outer triple backticks in chat responses (or provide a backtick-free Python script / targeted diff) so inner code fences never break copy-paste formatting.

## 🚀 6. Current Status & Next Planned Milestones

* Completed:
	* network-labs/cisco-ospfv2-multi-area.md published and live (Area 0/Area 10, ABR R11, Dual-ISP Type-5 LSA failover, HSRP VIPs, LACP Po1, centralized DHCP relay, Netplan bond0 active-backup, VLSM table, and 9 collapsible IOS config blocks).
	* build_indices.py indentation fixed and CI/CD workflow (update-toc.yml) verified green.
	* _includes/head-custom.html deployed site-wide with <meta name="darkreader-lock">.
* Pending / Next Up:
	* Apply <section style="max-width: 720px !important;"> readability wrapper to root README.md / index.md intro banner and align system-architecture/README.md banner tone.
	* Phase 2 Lab Expansion: Add dual-process OSPF redistribution (router ospf 2) on the boundary edge to cisco-ospfv2-multi-area.md (or as a dedicated follow-up case study).
  
