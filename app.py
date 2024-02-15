from flask import Flask, render_template, request, jsonify,redirect, url_for,flash,session
import datetime
import pandas as pd
import psycopg2  # pip install psycopg2
import psycopg2.extras 
from functools import wraps
from psycopg2.extras import execute_values
from datetime import datetime
import cachetools

app = Flask(__name__)
app.secret_key = "appEpi"

DB_HOST = "database-2.cdcogkfzajf0.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASS = "15512332"

def login_required(func): # Lógica do parâmetro de login_required, onde escolhe quais páginas onde apenas o usuário logado pode acessar
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'loggedin' not in session:
            return redirect(url_for('login'))
        return func(*args, **kwargs)
    return wrapper

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

        print(user)
        print(user is not None)

        if user is not None:
            session['loggedin'] = True
            session['user_id'] = user['username']
            print(user['username'])
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
@login_required
def pagina_inicial():

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                            password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    s = """SELECT
            solic.*,
            hist.status,
            ass.assinatura,ass.data_assinatura
            FROM sistema_epi.tb_solicitacoes AS solic
            LEFT JOIN (
            SELECT
                id_solicitacao,
                status,
                ROW_NUMBER() OVER (PARTITION BY id_solicitacao ORDER BY data_modificacao DESC) AS row_num
            FROM sistema_epi.tb_historico_solicitacoes
            ) AS hist ON hist.id_solicitacao = solic.id_solicitacao AND hist.row_num = 1
            LEFT JOIN sistema_epi.tb_assinatura AS ass ON ass.id_solicitacao = solic.id_solicitacao;
        """
    
    tb_solicitacoes = pd.read_sql_query(s, conn)

    print(tb_solicitacoes)

    tb_solicitacoes = tb_solicitacoes.sort_values(by=['id','id_solicitacao'])

    # Agrupar pelo id_solicitacao e manter apenas a primeira linha de cada grupo
    tb_solicitacoes = tb_solicitacoes.groupby('id_solicitacao').first().reset_index()

    tb_solicitacoes = tb_solicitacoes.values.tolist()

    print(tb_solicitacoes)

    return render_template('tables.html',tb_solicitacoes=tb_solicitacoes)

@app.route('/receber-assinatura', methods=['POST'])
@login_required
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

        cur.execute("INSERT INTO sistema_epi.tb_assinatura (id_solicitacao, assinatura) VALUES (%s, %s)", (id_solicitacao, dataURL))

        cur.execute("INSERT INTO sistema_epi.tb_historico_solicitacoes (id_solicitacao, status) VALUES (%s, %s)", (id_solicitacao, 'Assinado'))

        conn.commit()

        # Exemplo de resposta de volta para o cliente
        return jsonify({'status': 'success', 'message': 'Assinatura recebida com sucesso!'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/dados-execucao', methods=['POST'])
@login_required
def dados_execucao():
    
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                            password=DB_PASS, host=DB_HOST)
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    data = request.get_json()

    id_solicitante = data.get('id_solicitante')

    query = f"""SELECT DISTINCT tb_solicitacoes.*,tb_historico_solicitacoes.status
            FROM sistema_epi.tb_solicitacoes
            INNER JOIN sistema_epi.tb_historico_solicitacoes
            ON tb_solicitacoes.id_solicitacao = tb_historico_solicitacoes.id_solicitacao
            WHERE tb_solicitacoes.id_solicitacao = '{id_solicitante}';"""
    
    query_solicitacoes = f"""SELECT id,codigo_item,quantidade,motivo  
                         FROM sistema_epi.tb_solicitacoes
                         WHERE id_solicitacao = '{id_solicitante}';"""

    cur.execute(query)
    info_gerais = cur.fetchall()

    cur.execute(query_solicitacoes)
    equipamento = cur.fetchall()

    dados = {
        'id_solicitacao': info_gerais[-1][1],
        'matricula': info_gerais[-1][2],
        'setor': info_gerais[-1][6],
        'funcionario': info_gerais[-1][7],
        'data_solicitacao': info_gerais[0][8],
        'data': info_gerais[-1][8],
        'status': info_gerais[-1][9]
    }

    equipamentos = []
    
    for row in equipamento:
        equipamentos.append({
            'id': row[0],
            'codigo': row[1],
            'quantidade': row[2],
            'motivo': row[3]
        })

    dados['equipamentos'] = equipamentos

    print(dados)

    # Exemplo de resposta de volta para o cliente
    return jsonify(dados)

@app.route('/timeline', methods=['POST'])
@login_required
def timeline_os():

    dados = request.get_json()

    id_solicitacao = dados['id_solicitacao']
    
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                            password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    query = f"""SELECT * 
            FROM sistema_epi.tb_historico_solicitacoes
            WHERE id_solicitacao = '{id_solicitacao}'"""
    
    df_timeline = pd.read_sql_query(query, conn)

    print(df_timeline)

    df_timeline = df_timeline.sort_values(by='id', ascending=True)

    df_timeline = df_timeline.values.tolist()

    return jsonify (id_solicitacao,df_timeline)

if __name__ == '__main__':
    app.run(debug=True)