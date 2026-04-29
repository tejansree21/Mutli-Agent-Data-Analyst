import ollama

response = ollama.chat(
    model="llama3.1:8b",
    messages=[
        {"role": "user", "content": "Explain what a CSV file is in one sentence."}
    ]
)

print(response["message"]["content"])