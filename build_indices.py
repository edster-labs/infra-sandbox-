import os
import re

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

def update_readme_file(directory):
    readme_path = os.path.join(directory, "README.md")
    if not os.path.exists(readme_path):
        print(f"Skipping directory {directory}: README.md missing.")
        return

    # Scan the directory tracking only child markdown files (excluding the README index itself)
    valid_files = []
    for entry in sorted(os.listdir(directory)):
        if entry.lower() != "readme.md" and entry.endswith(".md"):
            full_path = os.path.join(directory, entry)
            title = extract_markdown_title(full_path)
            valid_files.append((title, entry))

    if not valid_files:
        print(f"No standalone documentation assets found in {directory}/.")
        return

    # Build the dynamic relative Markdown lists
    generated_lines = ["\n## 📁 Automatically Indexed Modules\n"]
    for title, filename in valid_files:
        generated_lines.append(f"* 📄 **[{title}](./{filename})**\n")

    generated_content = "".join(generated_lines)

    # Read the existing file data to safely target our comments
    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Dynamic regex matching parameters to swap blocks safely
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

    # Start compiling structured HTML components with a larger text profile
    tree_lines = [
        "\n## 🌐 Architektúra repozitára / Technical Site Tree\n",
        '<div class="site-tree-container" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; line-height: 1.6; font-size: 17px;">\n',
        '  <p style="margin: 0; font-weight: bold; font-size: 20px;">[infra-sandbox-] (Root Adresár)</p>\n',
        '  <ul style="list-style-type: none; margin: 0; padding-left: 20px; border-left: 1px dashed #CCCCCC;">\n'
    ]

    for i, directory in enumerate(TARGET_DIRS):
        if not os.path.isdir(directory):
            continue
        
        tree_lines.append('    <li style="margin-top: 10px;">\n')
        tree_lines.append('      <details open style="cursor: pointer;">\n')
        tree_lines.append(f'        <summary style="font-weight: bold; color: #f1f5f9;">📁 [{directory}]</summary>\n')
        tree_lines.append('        <ul style="list-style-type: none; padding-left: 20px; margin-top: 4px;">\n')

        # Scan for child markdown documents inside the subfolder
        child_files = sorted([f for f in os.listdir(directory) if f.lower() != "readme.md" and f.endswith(".md")])
        
        for filename in child_files:
            file_path = os.path.join(directory, filename)
            title = extract_markdown_title(file_path)
            relative_url = f"./{directory}/{filename}"
            
            # Formatted list layout targeting a unified 17px footprint
            tree_lines.extend([
                '          <li style="margin-bottom: 4px; font-size: 17px;">\n',
                f'            ├── <a href="{relative_url}" style="font-weight: 600; font-size: 17px;">{filename}</a>\n',
                f'            <span style="color: #cbd5e1; font-size: 17px;">... ({title})</span>\n',
                '          </li>\n'
            ])

        tree_lines.append('        </ul>\n')
        tree_lines.append('      </details>\n')
        tree_lines.append('    </li>\n')

    tree_lines.append('  </ul>\n')
    tree_lines.append('</div>\n')
    master_tree_content = "".join(tree_lines)

    # Inject the interactive tree block directly into the root file
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
    # Run the original folder index operations first
    for directory in TARGET_DIRS:
        if os.path.isdir(directory):
            update_readme_file(directory)
            
    # Run the new master tree generator
    generate_global_master_tree()
