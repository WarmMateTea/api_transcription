# Sample .env:

TOKEN_SERVER_PORT = 4000
OPENAI_API_KEY = openai_key
API_KEY = static_api_key

# Request info (post)

route: /api/upload

headers:
    "x-api-key": API_KEY

body (form-data):
    "file": FILE


    
