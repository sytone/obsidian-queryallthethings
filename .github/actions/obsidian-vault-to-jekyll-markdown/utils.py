import os
import re


def get_all_document_paths(source_directory):
    all_paths = list()

    for (dirpath, dirnames, filenames) in os.walk(source_directory):
        dirnames.sort()
        filenames.sort()

        for filename in filenames:
            path = os.path.join(dirpath, filename)
            if "_site" not in dirpath:
                all_paths.append(path.replace("\\", "/"))

    all_paths.sort(reverse=True)

    return all_paths


def get_file_full_text(path):
    print(f"get_file_full_text path is {path}")
    with open(path, encoding="utf-8") as f:
        full_text = f.read()

    return re.sub(r"%%.*%%", "", full_text)


def replace_links(text, all_paths, docs_directory, url_base):
    found_matches = re.findall(r"(?P<full_wiki_link>\[\[(?P<link_page>.*?)\]\]?)", text)
    output_text = text

    for item in found_matches:
        full_wiki_link = item[0]
        link_page_src = item[1]
        link_page_name = re.sub(r"\|.*$", "", link_page_src).split("#")[0]
        link_page_name_anchor = (
            "#" + re.sub(r"\|.*$", "", link_page_src).split("#")[1].replace("\\", "")
            if len(re.sub(r"\|.*$", "", link_page_src).split("#")) > 1
            else ""
        )
        link_page_description = re.sub(r"^.*\|", "", link_page_src)

        print(f"       Original Link: {full_wiki_link}")
        print(f"           Page link: {link_page_name}")
        print(f"Optional description: {link_page_description}")

        page_url = ""
        for path in all_paths:
            just_filename = path.split("/")[-1]
            filename = path.replace(f"{docs_directory}/", "")

            # print('link_page_name:', link_page_name)
            # print(f"replace_links filename is {filename}")

            if (
                link_page_name + ".md" == filename
                or link_page_name + ".md" == just_filename
            ):
                page_url = path
                print(f"    Replacement Path: {page_url}")

        if len(page_url) > 0:

            # print(page_url)
            replacement_text = (
                "["
                + link_page_description.split("/")[-1]
                + "]("
                + page_url.replace(f"{docs_directory}/", f"{url_base}/")
                # .replace(":", " -")
                .replace(".md", "")
                + link_page_name_anchor
                + ")"
            )
        else:
            replacement_text = full_wiki_link
        print(f"🔁 Replacement: {replacement_text}\n")

        output_text = output_text.replace(full_wiki_link, replacement_text)
    return output_text


def replace_mermaid_blocks(text):
    regex = r"(```mermaid(?P<mermaid>[\s\S]*?)```)"
    subst = "<script src='https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js'></script><div class=mermaid>\\g<mermaid></div>"
    result = re.sub(regex, subst, text, 0, re.MULTILINE)
    return result


def replace_callouts(text):
    results = text

    regex = r"(^> \[!(NOTE|INFO)\].*?\n{2})"
    for match in re.finditer(regex, results, re.MULTILINE | re.DOTALL):
        print(match.group(1))
        clean_match = (
            match.group(1)
            .replace("> [!NOTE]", "")
            .replace("> [!INFO]", "")
            .replace("> ", "")
            .replace(">", "")
        )
        jekyll_format = (
            '<div class="code-example" markdown="1">\n📝 Note\n{: .label .label-blue }\n'
            + clean_match
            + "\n</div>\n\n"
        )
        results = results.replace(match.group(1), jekyll_format)

    regex = r"(^> \[!(WARNING|WARN)\].*?\n{2})"
    for match in re.finditer(regex, results, re.MULTILINE | re.DOTALL):
        print(match.group(1))
        clean_match = (
            match.group(1)
            .replace("> [!WARNING]", "")
            .replace("> [!WARN]", "")
            .replace("> ", "")
            .replace(">", "")
        )
        jekyll_format = (
            '<div class="code-example" markdown="1">\n⚠ Warning\n{: .label .label-yellow }\n'
            + clean_match
            + "\n</div>\n\n"
        )
        results = results.replace(match.group(1), jekyll_format)

    return results


def replace_url(path, all_paths, docs_directory, url_base):
    print(f"::group::{path}")

    full_text = get_file_full_text(path)
    replaced_text = replace_links(full_text, all_paths, docs_directory, url_base)
    replaced_text = replace_mermaid_blocks(replaced_text)
    replaced_text = replace_callouts(replaced_text)

    os.remove(path)
    with open(path, "w", encoding="utf-8") as f:
        f.write(replaced_text)
    print("::endgroup::")
