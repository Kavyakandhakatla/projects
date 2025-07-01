import os
import streamlit as st
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

# Load environment variables
load_dotenv()
GROQ_KEY = os.getenv("GROQ_API_KEY")

# Initialize model
model = ChatGroq(
    api_key=GROQ_KEY,
    model_name="llama-3.3-70b-versatile"  
)

st.title("English to Spanish Translator")

user_input = st.text_input("Enter English text to translate:")

if user_input:
    messages = [
        SystemMessage(content="Translate the text from English to Spanish."),
        HumanMessage(content=user_input)
    ]

    with st.spinner("Translating..."):
        placeholder = st.empty()
        translation = ""
        for token in model.stream(messages):
            translation += token.content
            placeholder.markdown(f"**{translation}**")  
