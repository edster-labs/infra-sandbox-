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
    """Generates a visual ASCII tree diagram of all files and updates the root README.md."""
    root_readme = "README.md"
    if not os.path.exists(root_readme):
        print("Root README.md missing. Skipping master map creation.")
        return

    tree_lines = [
        "\n## 🌐 Architektúra repozitára / Technical Site Tree\n",
        "```text\n",
        "[infra-sandbox-] (Root Adresár)\n"
    ]

    for i, directory in enumerate(TARGET_DIRS):
        if not os.path.isdir(directory):
            continue
        
        # Select structural branch markers based on folder index position
        dir_marker = " └── " if i == len(TARGET_DIRS) - 1 else " ├── "
        tree_lines.append(f"{dir_marker}[{directory}]\n")

        # Scan for child markdown documents inside the subfolder
        child_files = sorted([f for f in os.listdir(directory) if f.lower() != "readme.md" and f.endswith(".md")])
        
        for j, filename in enumerate(child_files):
            file_path = os.path.join(directory, filename)
            title = extract_markdown_title(file_path)
            
            # Select proper connector lines for nested layout files
            file_lead = "     " if i == len(TARGET_DIRS) - 1 else " │   "
            file_marker = "└── " if j == len(child_files) - 1 else "├── "
            
            # Pad space dynamically to create a clean, uniform matrix layout row
            row_content = f"{file_lead}{file_marker}{filename} "
            dot_padding = "." * (45 - len(row_content))
            
            tree_lines.append(f"{row_content}{dot_padding} ({title})\n")

    tree_lines.append("```\n")
    master_tree_content = "".join(tree_lines)

    # Inject the master tree code block directly into the root layout file
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
        print(f"Successfully compiled and updated Master Map in {root_readme}")
    else:
        print(f"Note: Marker comments (<!-- tree --> / <!-- endtree -->) missing in root {root_readme}")

if __name__ == "__main__":
    # Run the original folder index operations first
    for directory in TARGET_DIRS:
        if os.path.isdir(directory):
            update_readme_file(directory)
            
    # Run the new master tree generator
    generate_global_master_tree()
