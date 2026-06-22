import random
from flask import Flask, Response

app = Flask(__name__)

@app.route('/metrics')
def metrics():
    random_value = random.uniform(0, 100)
    output = '# HELP film_random_value Zufallszahl zwischen 0 und 100\n'
    output += '# TYPE film_random_value gauge\n'
    output += f'film_random_value {random_value:.2f}\n'
    return Response(output, mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
