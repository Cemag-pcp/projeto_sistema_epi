from flask import Flask, render_template, request, jsonify,redirect, url_for,flash,session
import datetime
import pandas as pd
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

    s = """SELECT s.*, hs.status, a.assinatura
            FROM sistema_epi.tb_solicitacoes AS s
            LEFT JOIN sistema_epi.tb_historico_solicitacoes AS hs ON s.id_solicitacao = hs.id_solicitacao
            LEFT JOIN sistema_epi.tb_assinatura AS a ON s.id = a.id;  -- Adicionei este LEFT JOIN
        """
    
    tb_solicitacoes = pd.read_sql_query(s, conn)

    print(tb_solicitacoes)

    tb_solicitacoes = tb_solicitacoes.sort_values(by=['id','id_solicitacao'])

    # Agrupar novamente e concatenar os valores da coluna codigo_item
    tb_solicitacoes['codigo_item'] = tb_solicitacoes.groupby('id_solicitacao')['codigo_item'].transform(lambda x: ', '.join(x))

    # Agrupar pelo id_solicitacao e manter apenas a primeira linha de cada grupo
    tb_solicitacoes = tb_solicitacoes.groupby('id_solicitacao').first().reset_index()

    tb_solicitacoes = tb_solicitacoes.values.tolist()

    print(tb_solicitacoes)

    return render_template('tables.html',tb_solicitacoes=tb_solicitacoes)

@app.route('/receber-assinatura', methods=['POST'])
def receber_assinatura():
    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                        password=DB_PASS, host=DB_HOST)
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # Obtém os dados do JSON enviado no corpo da solicitação
        data = request.get_json()

        # Obtém o dataURL da assinatura
        id_solicitacao = data.get('id_solicitacao')
        dataURL = data.get('dataURL')
        id = data.get('id')

        cur.execute("INSERT INTO sistema_epi.tb_assinatura (id_solicitacao, assinatura,id) VALUES (%s, %s,%s)", (id_solicitacao, dataURL,id))
        conn.commit()

        # Exemplo de resposta de volta para o cliente
        return jsonify({'status': 'success', 'message': 'Assinatura recebida com sucesso!'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/dados-execucao', methods=['POST'])
def dados_execucao():
    
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                            password=DB_PASS, host=DB_HOST)
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    data = request.get_json()

    id = data.get('id')

    query = f"""SELECT s.*, hs.status
            FROM sistema_epi.tb_solicitacoes AS s
            LEFT JOIN sistema_epi.tb_historico_solicitacoes AS hs ON s.id_solicitacao = hs.id_solicitacao
            WHERE s.id = {id};"""

    cur.execute(query)
    execucao = cur.fetchall()

    print(execucao)

    dados = {
        'id':execucao[0][0],
        'id_solicitacao':execucao[0][1],
        'matricula':execucao[0][2],
        'codigo':execucao[0][3],
        'quantidade':execucao[0][4],
        'motivo':execucao[0][5],
        'setor':execucao[0][6],
        'funcionario':execucao[0][7],
        'data':execucao[0][8],
        'status':execucao[0][9]
    }
    print(execucao[0][0])

    # Exemplo de resposta de volta para o cliente
    return jsonify(dados)

if __name__ == '__main__':
    app.run(debug=True)