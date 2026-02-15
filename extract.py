import requests
from bs4 import BeautifulSoup
import re
from openai import OpenAI

# 🔥 PASTE URL HERE
URL = "https://example.com/mpox"

# 🔥 PASTE YOUR OPENAI KEY
client = OpenAI(api_key="YOUR_OPENAI_KEY")


def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def detect_section_with_ai(question):
    prompt = f"""
Classify the following medical question into ONE of these categories:

Overview
Symptoms
Transmission
Risk Factors
Complications
Diagnosis
Treatment
Prevention
General

Question: "{question}"

Return ONLY the category name.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return response.choices[0].message.content.strip()


def detect_disease_with_ai(question):
    prompt = f"""
Extract the disease name from this medical question:

"{question}"

Return only the disease name.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return response.choices[0].message.content.strip()


def extract_qa(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()

    documents = []
    current_question = None

    for tag in soup.find_all(["h2", "h3", "p"]):
        text = tag.get_text(strip=True)

        if not text:
            continue

        # Question detect
        if text.endswith("?"):
            current_question = text

        # Answer detect
        elif tag.name == "p" and current_question:
            print(f"\n🔍 Processing Question: {current_question}")

            disease = detect_disease_with_ai(current_question)
            section = detect_section_with_ai(current_question)

            doc = {
                "id": f"{slugify(disease)}-{slugify(section)}",
                "disease": disease,
                "section": section,
                "content": text,
                "embedding": None
            }

            documents.append(doc)
            current_question = None

    return documents


def generate_js_file(documents):
    print("\n\nconst documents = [\n")

    for doc in documents:
        print(f"""  {{
    id: "{doc['id']}",
    disease: "{doc['disease']}",
    section: "{doc['section']}",
    content: `{doc['content']}`,
    embedding: null
  }},""")

    print("\n];\n\nexport default documents;")


# 🔥 RUN
docs = extract_qa(URL)
generate_js_file(docs)
