Local Environment Setup (Python 3.12)
# Step 1
mkdir healthcare-rag-app
cd healthcare-rag-app
``
# Step 2
Create and activate venv (Windows PowerShell)

py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
``
# Step 3
Manually create Create requirements.txt

Use this minimal, stable set: or refer to the /backend/requirements.txt

fastapi==0.115.8
uvicorn[standard]==0.34.0
python-dotenv==1.0.1
httpx==0.28.1
pydantic==2.10.6
tenacity==9.0.0
azure-search-documents==11.6.0
azure-core==1.32.0
pytest==8.3.4
pytest-asyncio==0.25.3
``
Then install
pip install -r requirements.txt

# Step 4
Create .env (Your Keys + Endpoints) or copy the .env file in /backend/.env
# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://<your-search-service>.search.windows.net
AZURE_SEARCH_KEY=<your-search-admin-or-query-key>
AZURE_SEARCH_INDEX=<your-index-name>

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://<your-aoai-resource>.openai.azure.com
AZURE_OPENAI_API_KEY=<your-aoai-key>
AZURE_OPENAI_CHAT_DEPLOYMENT=chat-health-rag
AZURE_OPENAI_API_VERSION=2024-02-01

# Retrieval tuning
TOP_K=5
MIN_SCORE=0.20

# App
APP_NAME=healthcare-rag-local
LOG_LEVEL=INFO

...
You can find the details in your azure portal app. 

# Step 5
App Code
In /backend create a dir named app

# Step 5.1 Create /backend/app/config.py
# Step 5.2 app/schemas.py 
# Step 5.3 app/search_client.py
# Step 5.4 app/llm_client.py
# Step 5.5 app/rag.py
# Step 5.6 app/logging_setup.py
# Step 5.7 app/main.py

# Step 6 Test and Run 

uvicorn app.main:app --reload --port 8000
``
http://localhost:8000/docs
