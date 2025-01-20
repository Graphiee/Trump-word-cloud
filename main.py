from openai import OpenAI
import nltk
import os
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

nltk.download('punkt_tab')

client = OpenAI()

audio_file = open("inauguration_2025.mp3", "rb")
transcript_org = client.audio.transcriptions.create(
  file=audio_file,
  model="whisper-1",
  response_format="verbose_json",
  timestamp_granularities=["segment"]
)

timestamps = []


for segment in transcript_org.segments:
  text = segment.text
  # Convert text to lowercase
  text = text.lower()

  # Remove punctuation
  text = text.translate(str.maketrans('', '', string.punctuation))

  # Tokenize the text into words
  words = word_tokenize(text)

  # Download stopwords if not already downloaded
  nltk.download('stopwords')
  nltk.download('punkt')

  # Get English stop words
  stop_words = set(stopwords.words('english'))

  # Remove stop words and words less than 2 characters
  cleaned_words = [word for word in words if word not in stop_words and len(word) > 2]

  timestamps.append(f'{segment.start} - {segment.end}: {' '.join(cleaned_words)}')


timestamps = '\n'.join(timestamps)
with open('transcript.txt', 'w') as file:
    file.write(timestamps)
