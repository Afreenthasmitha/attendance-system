import requests

url = "http://127.0.0.1:5000/records"
res = requests.get(url)

print(res.json())
