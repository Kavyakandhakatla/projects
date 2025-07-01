# app.py
import os
import time
import streamlit as st
from dotenv import load_dotenv

from langchain.vectorstores import FAISS
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_groq import ChatGroq

# Load environment variables
load_dotenv()
GROQ_KEY = os.getenv("GROQ_API_KEY")

# --- UI Setup ---
st.set_page_config(page_title="RAG Chatbot 💬", layout="wide")
st.title("📄 RAG Chatbot with Groq + FAISS + Context Memory")

# --- Load FAISS & Embeddings ---
@st.cache_resource
def load_vectorstore():
    embedding_model = SentenceTransformerEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    vectorstore = FAISS.load_local("faiss_index", embedding_model, allow_dangerous_deserialization=True)
    return vectorstore.as_retriever()

retriever = load_vectorstore()

# --- Initialize LLM ---
llm = ChatGroq(
    api_key=GROQ_KEY,
    model_name="llama-3.3-70b-versatile"
)

# --- Setup or reuse Memory ---
if "memory" not in st.session_state:
    st.session_state.memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )

# --- Setup QA Chain with memory ---
qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=retriever,
    memory=st.session_state.memory,
    verbose=True
)

# --- Input UI ---
with st.form(key="chat_form", clear_on_submit=True):
    user_input = st.text_input("Ask a question:")
    submit = st.form_submit_button("Send")

# --- Process User Query ---
if submit and user_input:
    with st.spinner("Generating response..."):
        start = time.time()
        response = qa_chain.run(user_input)
        end = time.time()
        duration = round(end - start, 2)

        # Save in displayable chat format
        if "chat_display" not in st.session_state:
            st.session_state.chat_display = []
        st.session_state.chat_display.append(("🧑 You", user_input))
        st.session_state.chat_display.append(("🤖 GroqBot", response))

        st.success(f"✅ Answer generated in {duration} seconds")

# --- Show Chat History ---
if "chat_display" in st.session_state:
    for role, msg in st.session_state.chat_display[::-1]:
        st.markdown(f"**{role}:** {msg}")

