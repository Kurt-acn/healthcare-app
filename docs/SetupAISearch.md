Step-by-step (Azure Portal)

Azure Portal → Create a resource
Search for Azure AI Search
Click Create

Fill in:

Subscription: your subscription
Resource group: rg-health-rag-demo
Service name:
ais-health-rag
Region:
Same region as Azure OpenAI
Pricing tier: Basic

✅ Click Review + Create → Create



Start Import Wizard (Unstructured Data First)

Open Azure AI Search
Left menu → Import data (new)

You’ll see options:

Keyword search
RAG
Multimodal RAG

✅ Select:
RAG

Connect to Azure Blob Storage (Unstructured)
Step A — Data source

Data source type: Azure Blob Storage
Storage account: sthealthrag...
Container: unstructured-docs
Authentication: API Key (default)

✅ Continue

Connect to Azure OpenAI (Embeddings)
Fill in:

Azure OpenAI resource: aoai-health-rag
Endpoint: auto-filled
API Key: your key
Embedding deployment:
Plain Textembed-health-ragShow more lines


✅ Continue

Index Schema (Very Important)
Azure will auto-generate fields. You should verify the following exist:
✅ Required fields:
id                  (Edm.String, key)
content             (Edm.String)
contentVector       (Collection(Edm.Single))
metadata_storage_pathsource (optional)

📌 Do not remove keyword-searchable fields — we want hybrid search (keyword + vector). [docs.azure.cn], Other fields might be present and you can also add fields you wanted to be added
✅ Continue

Create Indexer (Unstructured)
Name suggestions:
Plain Textindex-healthcareindexer-unstructureddatasource-unstructuredShow more lines
✅ Finish wizard
✅ Wait for indexer run → Status: Success

Add Structured Data (CSV / Excel / JSON)
Now we ingest structured data into the SAME index.

Azure AI Search → Import data (new)
Select RAG
Data source:

Storage account
Container: structured-data



Important rules for structured data

Each row = one document
Prefer JSON / JSONL
Columns like summary, notes, description should be mapped to content

✅ Continue through wizard
✅ Select same:

index-healthcare

Azure AI Search will append documents, not overwrite.

C11 — Create Structured Indexer
Suggested names:
indexer-structured
datasource-structured

✅ Run indexer
✅ Confirm success