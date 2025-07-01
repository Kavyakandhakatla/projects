import os
import streamlit as st
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

# Load environment variables
load_dotenv()
GROQ_KEY = os.getenv("GROQ_API_KEY")

# Initialize model
model = ChatGroq(
    api_key=GROQ_KEY,
    model_name="llama-3.3-70b-versatile"  
)

st.title("English to Spanish Translator")

# Prompt template setup
system_template = "Translate the following from English into {language}."
prompt_template = ChatPromptTemplate.from_messages([
    ("system", system_template),
    ("user", "{text}")
])

user_input = st.text_input("Enter English text to translate:")

if user_input:
    prompt = prompt_template.invoke({
        "language": "Spanish",  
        "text": user_input
    })

    with st.spinner("Translating..."):
        response = model.invoke(prompt)
        st.markdown(f"**Translation:** {response.content}")
