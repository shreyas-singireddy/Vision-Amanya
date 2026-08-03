import os
from dotenv import load_dotenv

# Load configurations
load_dotenv()

def verify_ai_environment():
    print("--- Verifying AI and Chatbot Workspace ---")
    
    # 1. Verify standard library/data frameworks
    import numpy as np
    import pandas as pd
    print(f"[OK] NumPy version: {np.__version__}")
    print(f"[OK] Pandas version: {pd.__version__}")
    
    # 2. Verify PDF extraction
    import pypdf
    print(f"[OK] PyPDF imported successfully.")
    
    # 3. Verify LangChain and components
    try:
        from langchain_openai import ChatOpenAI, OpenAIEmbeddings
        from langchain_community.vectorstores import FAISS, Chroma
        from langchain_core.prompts import ChatPromptTemplate
        
        print("[OK] LangChain core and community extensions imported successfully.")
        print("[OK] OpenAI integrations resolved successfully.")
        print("[OK] FAISS and Chroma database drivers resolved successfully.")
        
    except ImportError as e:
        print(f"[FAIL] LangChain/Vectorstore import failure: {e}")
        return False
        
    # 4. Verify Huggingface / SentenceTransformers (runs embedding driver locally)
    try:
        from sentence_transformers import SentenceTransformer
        print("[OK] SentenceTransformers driver resolved successfully.")
    except ImportError as e:
        print(f"[FAIL] SentenceTransformers import failure: {e}")
        return False
        
    print("\nEnvironment verification successful! All AI modules are properly installed and resolved.")
    return True

if __name__ == "__main__":
    verify_ai_environment()
