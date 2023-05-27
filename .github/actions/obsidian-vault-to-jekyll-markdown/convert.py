import os

from utils import get_all_document_paths, replace_url

docs_directory = os.environ["INPUT_SRC_ROOT_DIRECTORY"]
url_base = (
    os.environ.get("INPUT_URL_BASE") if os.environ.get("INPUT_URL_BASE") != None else ""
)

print(f"INPUT_SRC_ROOT_DIRECTORY: {docs_directory}")
print(f"INPUT_URL_BASE: {url_base}")

all_paths = get_all_document_paths(docs_directory)

for path in all_paths:
    full_path = path.split("/")
    filename = full_path[-1]

    if path.endswith(".md"):
        replace_url(path, all_paths, docs_directory, url_base)
