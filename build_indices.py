import os
import re
import sys

# Directories to index automatically
TARGET_DIRS = ["cheat-sheets", "eve-ng-guides", "network-labs", "sec-notebook", "system-architecture"]

def extract_markdown_title(file_path):
    """Extracts the first H1 header found in a markdown file to use as anchor text."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("# "):
                    # Strip out the '# ' and any emoji/spaces to clean the string
                    title = line[2:].strip()
                    return title
    except Exception as e:
        print(f"Error reading title from {file_path}: {e}")
    
    # Fallback to a prettified version of the filename if no H1 title exists
    base = os.path.splitext(os.path.basename(file_path))[0]
    return base.replace("-", " ").replace("_", " ").title()

def inject_navigation_header(file_path):
    """Automatically injects or updates navigation headers ONLY if the file contains the target opt-in tag."""
    nav_marker_start = "<!-- automated-nav-start -->"
    nav_marker_end = "<!-- automated-nav-end -->"
    opt_in_tag = "<!-- include-osi-nav -->"
    
    # Calculate exactly how many folders deep we are relative to the root
    root_dir = os.path.dirname(file_path)
    levels_deep = len(root_dir.split(os.sep)) if root_dir else 0
    path_to_root = "../" * levels_deep if levels_deep > 0 else "./"
    
    # ⚡ Precision Targeting: Routes straight to the table's actual folder file!
    master_table_url = f"{path_to_root}sec-notebook/ddos-attack-classifications/#ddos-attack-threat-mitigation-table"
    main_menu_url = f"{path_to_root}README.md"
   
    nav_content = f"{nav_marker_start}\n[⬅️ DDos Attack Threat Mitigation Table]({master_table_url})\n\n---\n{nav_marker_end}\n"

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if opt_in_tag not in content:
            pattern = f"{re.escape(nav_marker_start)}.*?{re.escape(nav_marker_end)}\\s*"
            cleaned = re.sub(pattern, "", content, flags=re.DOTALL)
            if cleaned != content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(cleaned)
                print(f"Removed leftover header from {file_path}")
            return

            
        pattern = f"{re.escape(nav_marker_start)}.*?{re.escape(nav_marker_end)}\\s*"
        if re.search(pattern, content, re.DOTALL):
            updated_content = re.sub(pattern, nav_content, content, flags=re.DOTALL)
        else:
            updated_content = content.replace(opt_in_tag, f"{opt_in_tag}\n{nav_content}")
            
        if updated_content != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(updated_content)
            print(f"Successfully injected controlled navigation header in {file_path}")
            
    except Exception as e:
        print(f"Error handling controlled navigation injection for {file_path}: {e}")

def update_readme_file(directory):
    readme_path = os.path.join(directory, "README.md")
    if not os.path.exists(readme_path):
        print(f"Skipping directory {directory}: README.md missing.")
        return

    valid_files = []
    
    # 🚀 CHANGED: os.walk recursively searches all sub-folders automatically!
    for root, dirs, files in os.walk(directory):
        for entry in sorted(files):
            # Skip the root README itself or any README files in subfolders
            if entry.lower() != "readme.md" and entry.lower().endswith(".md"):
                full_path = os.path.join(root, entry)
                
                # Run the backlink injector on the file
                inject_navigation_header(full_path)
                
                # Calculate relative path from the root directory to this file for the link
                relative_path = os.path.relpath(full_path, directory)
                title = extract_markdown_title(full_path)
                valid_files.append((title, relative_path))

    if not valid_files:
        print(f"No standalone documentation assets found in {directory}/.")
        return

    generated_lines = ["\n## 📁 Automatically Indexed Modules\n"]
    for title, rel_url in valid_files:
        # Replaces backslashes with forward slashes for cross-platform link compatibility
        clean_url = rel_url.replace("\\", "/")
        generated_lines.append(f"* 📄 **[{title}](./{clean_url})**\n")

    generated_content = "".join(generated_lines)

    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = r"(<!-- toc -->).*?(<!-- endtoc -->)"
    if re.search(pattern, content, re.DOTALL):
        updated_content = re.sub(
            pattern,
            f"<!-- toc -->{generated_content}<!-- endtoc -->",
            content,
            flags=re.DOTALL
        )
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print(f"Successfully compiled and updated {readme_path}")
    else:
        print(f"Warning: Marker comments (<!-- toc --> / <!-- endtoc -->) missing in {readme_path}")

def generate_global_master_tree():
    """Generates an interactive, collapsible HTML site tree for the root README.md."""
    root_readme = "README.md"
    if not os.path.exists(root_readme):
        print("Root README.md missing. Skipping master map creation.")
        return

    tree_lines = [
        "\n## 🌐 Architektúra repozitára / Technical Site Tree\n\n",
        '<div class="site-tree-container" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; line-height: 1.6; font-size: 20px; color: #e2e8f0;">\n',
        '  <span style="margin: 0; font-weight: bold; font-size: 20px; display: block; color: #ffffff;">📂 Site Tree (Root Adresár)</span>\n\n',
        '  <ul style="list-style-type: none; margin: 10px 0 0 0; padding-left: 20px; border-left: 1px dashed #CCCCCC; list-style: none;">\n'
    ]

    for directory in TARGET_DIRS:
        if not os.path.isdir(directory):
            continue
        
        tree_lines.append('<li style="margin-top: 10px;">\n\n')
        tree_lines.append('<details style="cursor: pointer;">\n')
        tree_lines.append(f'<summary style="font-weight: bold; color: #f1f5f9;">📁 [{directory}]</summary>\n')
        tree_lines.append('<ul style="list-style-type: none; padding-left: 20px; margin-top: 4px;">\n')

        for root, dirs, files in os.walk(directory):
            dirs.sort()
            rel_dir = os.path.relpath(root, directory)
            indent = "&nbsp;&nbsp;&nbsp;&nbsp;" if rel_dir != "." else ""

            if rel_dir != ".":
                folder_url = f"./{directory}/{rel_dir}".replace("\\", "/")
                tree_lines.extend([
                    f'<li style="margin-top: 6px; margin-bottom: 4px; font-size: 17px; color: #38bdf8;">',
                    f'├── 📂 <a href="{folder_url}/" style="font-weight: 700; font-size: 17px;">[{rel_dir}]</a>',
                    '</li>\n'
                ])

            child_files = sorted([f for f in files if f.lower() != "readme.md" and f.lower().endswith(".md")])
            for filename in child_files:
                file_path = os.path.join(root, filename)
                title = extract_markdown_title(file_path)
                relative_url = f"./{file_path}".replace("\\", "/")
                
                tree_lines.extend([
                    '<li style="margin-bottom: 4px; font-size: 17px;">',
                    f'{indent}├── <a href="{relative_url}" style="font-weight: 600; font-size: 17px;">{filename}</a> ',
                    f'<span style="color: #cbd5e1; font-size: 17px;">... ({title})</span>',
                    '</li>\n'
                ])

        tree_lines.append('</ul>\n')
        tree_lines.append('</details>\n\n')
        tree_lines.append('</li>\n')

    tree_lines.append('</ul>\n')
    tree_lines.append('</div>\n\n')
    master_tree_content = "".join(tree_lines)

    with open(root_readme, "r", encoding="utf-8") as f:
        root_content = f.read()

    master_pattern = r"(<!-- tree -->).*?(<!-- endtree -->)"
    if re.search(master_pattern, root_content, re.DOTALL):
        updated_root = re.sub(
            master_pattern,
            f"<!-- tree -->{master_tree_content}<!-- endtree -->",
            root_content,
            flags=re.DOTALL
        )
        with open(root_readme, "w", encoding="utf-8") as f:
            f.write(updated_root)
        print(f"Successfully compiled and updated Interactive Master Map in {root_readme}")
    else:
        print(f"Note: Marker comments (<!-- tree --> / <!-- endtree -->) missing in root {root_readme}")


if __name__ == "__main__":
    # Check if the GitHub Action passed specific changed files as command-line arguments
    if len(sys.argv) > 1:
        # sys.argv[0] is the script name itself, sys.argv[1:] are the actual file paths passed in
        changed_files = sys.argv[1:]
        print(f"⚡ Fast-Track: Processing only {len(changed_files)} changed file(s).")
        
        # Track directories that need their README files updated based on which files changed
        directories_to_rebuild = set()
        
        for file_path in changed_files:
            # Clean up path separators just in case
            file_path = file_path.replace("\\", "/")
            
            # Verify it's a markdown file and belongs to one of our managed folders
            if file_path.endswith(".md") and any(td in file_path for td in TARGET_DIRS):
                # 1. Inject the backlink headers immediately into the modified file
                if os.path.exists(file_path) and os.path.basename(file_path).lower() != "readme.md":
                    inject_navigation_header(file_path)
                
                # 2. Extract which root target directory this file belongs to
                for td in TARGET_DIRS:
                    if file_path.startswith(f"{td}/"):
                        directories_to_rebuild.add(td)
                        break
        
        # Only rebuild the README tables of contents for directories that actually saw changes
        for directory in directories_to_rebuild:
            if os.path.isdir(directory):
                update_readme_file(directory)
                
        # Always rebuild the global tree to keep the landing page pristine
        generate_global_master_tree()
        
    else:
        # 🐢 Fallback mode: If no arguments are passed, crawl everything safely
        print("🐢 Fallback: No specific file arguments received. Running complete repository crawl...")
        for directory in TARGET_DIRS:
            if os.path.isdir(directory):
                update_readme_file(directory)
                
        generate_global_master_tree()

