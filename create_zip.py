import os
import zipfile

def make_zip(source_dir, output_filename):
    print(f"📦 Packaging {source_dir} into {output_filename}...")
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Skip node_modules, .git, venv, and cache
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'venv', '__pycache__', '.playwright-cli']]
            for file in files:
                if file.endswith('.pyc') or file == '.DS_Store':
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(source_dir))
                zipf.write(file_path, arcname)
    size_mb = os.path.getsize(output_filename) / (1024 * 1024)
    print(f"✅ Successfully created {output_filename} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    src = os.path.abspath('RoadGuard-AI')
    dest = os.path.abspath('public/RoadGuard-AI.zip')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    make_zip(src, dest)
