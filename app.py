from flask import Flask, render_template, request, jsonify,redirect, url_for,flash,session
import datetime
import psycopg2  # pip install psycopg2
import psycopg2.extras 
from psycopg2.extras import execute_values
from datetime import datetime
import cachetools

app = Flask(__name__)
app.secret_key = "appEpi"

DB_HOST = "database-2.cdcogkfzajf0.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASS = "15512332"


@app.route('/login', methods=['POST','GET'])
def login(): # Lógica de login
    
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                            password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cur.execute("""SELECT * FROM sistema_epi.tb_usuario WHERE username = %s AND password = %s""", (username, password))
        user = cur.fetchone()

        if user is not None:
            session['user_id'] = user['username']
            return redirect(url_for('pagina_inicial'))
        else:
            flash('Usuário ou Senha inválida', category='error')

    return render_template('login.html')

@app.route('/logout')
def logout(): # Botão de logout
	session.pop('loggedin', None)
	session.pop('id', None)
	session.pop('username', None)
	return redirect(url_for('login'))

@app.route('/', methods=['GET'])
def pagina_inicial():

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                            password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    s = """SELECT s.*, hs.status
            FROM sistema_epi.tb_solicitacoes AS s
            LEFT JOIN sistema_epi.tb_historico_solicitacoes AS hs ON s.id_solicitacao = hs.id_solicitacao;
        """
    
    cur.execute(s)

    tb_solicitacoes = cur.fetchall()

    print(tb_solicitacoes)

    return render_template('tables.html',tb_solicitacoes=tb_solicitacoes)

if __name__ == '__main__':
    app.run(debug=True)