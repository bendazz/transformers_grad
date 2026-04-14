from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
import re 

app = FastAPI()

vocab = [" ", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

vocab_dictionary = {}
for i,c in enumerate(vocab):
    vocab_dictionary[c] = i

@app.get('/vocab')
def get_vocab():
    return vocab_dictionary


@app.get('/encode')
def encode(string: str):
    encoded = []
    for c in string:
        encoded.append(vocab_dictionary[c])
        
    return encoded




app.mount("/", StaticFiles(directory="static", html=True), name="static")