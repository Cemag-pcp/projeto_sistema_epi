from flask import Flask, render_template, request, jsonify,redirect, url_for,flash
import datetime
import psycopg2  # pip install psycopg2
import psycopg2.extras 
from psycopg2.extras import execute_values
from datetime import datetime
import cachetools

app = Flask(__name__)
app.secret_key = "appEpi"

DB_HOST = "database-1.cdcogkfzajf0.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASS = "15512332"

@app.route('/', methods=['GET'])
def pagina_inicial():

    """
    Rota para página inicial
    """

    return render_template('tables.html')

if __name__ == '__main__':
    app.run(debug=True)