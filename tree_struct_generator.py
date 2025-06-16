import os

def generate_github_urls(base_path, repo_url, exclude_folders=None):
    if exclude_folders is None:
        exclude_folders = []

    github_urls = []

    for root, dirs, files in os.walk(base_path, topdown=True):
        # Filter excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_folders]

        # Relative path from base
        rel_root = os.path.relpath(root, base_path)
        if rel_root == ".":
            rel_root = ""

        # Directory URL
        #if rel_root:
        #    github_urls.append(f"{repo_url}/main/{rel_root.replace(os.sep, '/')}")

        # File URLs
        for file in files:
            file_path = os.path.join(rel_root, file).replace(os.sep, '/')
            github_urls.append(f"{repo_url}/main/{file_path}")

    return github_urls

if __name__ == "__main__":
    target_directory = "./"  # Change to your repo path
    github_repo_url = "https://raw.githubusercontent.com/LBukai/mng_sercice"
    exclude = ["node_modules", ".git", ".next", "__pycache__"]

    output_file = "github_urls.txt"
    urls = generate_github_urls(target_directory, github_repo_url, exclude_folders=exclude)

    with open(output_file, "w") as f:
        for url in urls:
            f.write(url + "\n")

    print(f"\n✅ GitHub URLs saved to {output_file}")
