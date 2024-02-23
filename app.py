from flask import Flask, render_template, request, jsonify,redirect, url_for,flash,session
import datetime
import warnings
import pandas as pd
import psycopg2  # pip install psycopg2
import psycopg2.extras 
from functools import wraps
from psycopg2.extras import execute_values
from datetime import datetime,timedelta
import cachetools
import uuid

app = Flask(__name__)
app.secret_key = "appEpi"

DB_HOST = "database-2.cdcogkfzajf0.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASS = "15512332"

warnings.filterwarnings("ignore")

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
            return redirect(url_for('rota_solicitacao_material',username=username))
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

    tb_solicitacoes['data_solicitada'] = pd.to_datetime(tb_solicitacoes['data_solicitada'])
    tb_solicitacoes['data_solicitada'] = tb_solicitacoes['data_solicitada'].dt.strftime('%d/%m/%Y')

    sql = f"select concat(matricula, ' - ', nome) from requisicao.funcionarios"
    
    tb_sql = pd.read_sql_query(sql, conn)

    mapeamento = dict(zip(tb_sql['concat'].str.extract('(\d+)', expand=False), tb_sql['concat']))

    # Substituir na coluna matricula_solicitante
    tb_solicitacoes['matricula_solicitante'] = tb_solicitacoes['matricula_solicitante'].astype(str)
    tb_solicitacoes['matricula_solicitante'] = tb_solicitacoes['matricula_solicitante'].replace(mapeamento)

    tb_solicitacoes['funcionario_recebe'] = tb_solicitacoes['funcionario_recebe'].astype(str)
    tb_solicitacoes['funcionario_recebe'] = tb_solicitacoes['funcionario_recebe'].replace(mapeamento)

    # Agrupar pelo id_solicitacao e manter apenas a primeira linha de cada grupo
    tb_solicitacoes = tb_solicitacoes.groupby('id_solicitacao').first().reset_index()

    tb_solicitacoes = tb_solicitacoes.sort_values(by='id', ascending=False)

    tb_solicitacoes_list = tb_solicitacoes.values.tolist()

    return render_template('home.html',tb_solicitacoes_list=tb_solicitacoes_list)

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
    
    cur = conn.cursor()

    data = request.get_json()

    id_solicitante = data.get('id_solicitante')

    query = f"""
                SELECT
                    solic.*,
                    ass.data_assinatura
                FROM sistema_epi.tb_solicitacoes AS solic
                LEFT JOIN sistema_epi.tb_assinatura AS ass ON ass.id_solicitacao = solic.id_solicitacao
                WHERE solic.id_solicitacao = '{id_solicitante}'
                ORDER BY id asc;
            """
    
    query_solicitacoes = f"""SELECT id,codigo_item,quantidade,motivo  
                         FROM sistema_epi.tb_solicitacoes
                         WHERE id_solicitacao = '{id_solicitante}'
                         ORDER BY id asc;"""

    cur.execute(query)
    info_gerais = cur.fetchall()

    cur.execute(query_solicitacoes)
    equipamento = cur.fetchall()

    dados = {
        'id_solicitacao': info_gerais[-1][1],
        'matricula': info_gerais[-1][2],
        'funcionario': info_gerais[-1][7],
        'data_solicitacao': info_gerais[0][8],
        'data_assinado': info_gerais[-1][9],
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

def gerar_id_solicitacao():
    
    """
    Função para gerar id único
    """

    return str(uuid.uuid1())


def input_tb_solicitacoes(campos_solicitacao,id_solicitacao):
    """
    Função para inputar dados na tabela de solicitações do schema: sistema_epi
    """

    # Dicionário de novas chaves e valores
    novos_campos = {'id_solicitacao': id_solicitacao, 'status': 'Aguardando Assinatura'}

    # Iterar sobre cada dicionário na lista
    for item in campos_solicitacao:
        # Adicionar as novas chaves e valores
        item.update(novos_campos)
    
    print(campos_solicitacao)

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                    password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    # Iterar sobre os dados e inserir no banco de dados
    for item in campos_solicitacao:
        id_solicitacao = list(item.values())[5]
        matricula_solicitante = list(item.values())[0].split()[0]
        codigo = list(item.values())[1]
        quantidade = list(item.values())[2]
        motivo = list(item.values())[4]
        matricula_recebedor = list(item.values())[3].split()[0]

        print(id_solicitacao, matricula_solicitante, codigo, quantidade, motivo,matricula_recebedor)

        sql = """INSERT INTO sistema_epi.tb_solicitacoes 
            (id_solicitacao, matricula_solicitante, codigo_item, quantidade, motivo,funcionario_recebe)
        VALUES
            (%s, %s, %s, %s, %s, %s);"""

        cur.execute(sql,(id_solicitacao,matricula_solicitante,codigo,quantidade,motivo,matricula_recebedor))

    conn.commit()

def input_tb_historico(id_solicitacao):
    """
    Função para inputar dados na tabela de histórico do schema: sistema_epi
    A cada atualização será criado um registro
    """
    
    # campos_solicitacao = [{}]

    # Dicionário de novas chaves e valores
    # campos_solicitacao = {'id_solicitacao': id_solicitacao, 'status': 'Aguardando Assinatura'}

    # Iterar sobre cada dicionário na lista
    # for item in campos_solicitacao:
    #     # Adicionar as novas chaves e valores
    #     item.update(novos_campos)

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                    password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    # Iterar sobre os dados e inserir no banco de dados
    # for item in campos_solicitacao:
    status = 'Aguardando Assinatura'

    print(id_solicitacao, status)

    sql = """INSERT INTO sistema_epi.tb_historico_solicitacoes 
        (id_solicitacao, status)
    VALUES
        (%s, %s);"""

    cur.execute(sql,(id_solicitacao,status))

    conn.commit()

# Operadores
@app.route('/operadores', methods=['GET'])
def listar_operadores():
    """
    Função para buscar operadores disponíveis
    """
    
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                        password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    sql = "select concat(matricula, ' - ', nome) from requisicao.funcionarios"
    cur.execute(sql)

    data = cur.fetchall()

    return jsonify(data)

# Itens
@app.route('/itens', methods=['GET'])
def listar_itens():
    """
    Função para buscar itens
    """
    
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                        password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    sql = "select concat(codigo, ' - ', descricao) from sistema_epi.tb_itens"
    cur.execute(sql)

    data = cur.fetchall()

    return jsonify(data)

# Setor do operador
@app.route('/setor-operador/<operador>', methods=['GET'])
def setor_operador(operador):
    """
    Função para buscar setor do operador
    """

    operador = operador.split()[0]

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                        password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    sql = "select setor from requisicao.funcionarios where matricula = %s"
    cur.execute(sql,(operador,))

    setor = cur.fetchone()

    return jsonify(setor[0])

# Formulário de solicitação
@app.route('/solicitacao-material', methods=['GET','POST'])
def rota_solicitacao_material():

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                        password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    usuario = session.get('user_id')

    sql = f"select concat(matricula, ' - ', nome) from requisicao.funcionarios where matricula = '{usuario}'"
    cur.execute(sql)

    data = cur.fetchall()

    solicitante = data[0][0]

    nome = solicitante.split(' - ')[1]

    """
    Rota para de solicitação de material
    """

    # Renderize o template e passe o parâmetro de sucesso, se aplicável
    return render_template('solicitacao-material.html', solicitante=solicitante,nome=nome)

# Dashboard
@app.route('/dashboard', methods=['GET','POST'])
def dashboard():

    
    # Renderize o template e passe o parâmetro de sucesso, se aplicável
    return render_template('dashboard.html')

@app.route('/solicitacao', methods=['POST'])
def criar_solicitacao():
    """
    Função para receber as solicitações que foram geradas
    """

    dados = request.get_json()
    print(dados)

    # Dicionário para armazenar dados agrupados pelo inputOperador
    dados_agrupados = {}

    # Iterar sobre a resposta original
    for item in dados:
        
        # Obter o valor do inputOperador usando o índice
        input_operador = list(item.values())[3]

        # Verificar se já existe uma entrada para esse inputOperador no dicionário dadosAgrupados
        if input_operador not in dados_agrupados:
            # Se não existir, crie uma nova entrada com uma lista vazia
            dados_agrupados[input_operador] = []

        # Adicione o item à lista correspondente ao inputOperador
        dados_agrupados[input_operador].append(item)

    # Crie uma lista para cada valor único de inputOperador
    listas = {}

    for input_operador, lista in dados_agrupados.items():
        listas[input_operador] = lista

    lista_id_solicitacao = []

    # Imprima as listas
    for input_operador, lista in listas.items():
        id_solicitacao = gerar_id_solicitacao()
        lista_id_solicitacao.append(id_solicitacao)
        input_tb_solicitacoes(lista,id_solicitacao)
    
    for id in lista_id_solicitacao:
        print(id)
        input_tb_historico(id)
    
    return redirect(url_for('rota_solicitacao_material'))

@app.route('/vida-util', methods=['POST'])
def buscar_vida_util():

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                        password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    dados = request.get_json()
    cur.execute('select vida_util from sistema_epi.tb_itens')
    vida_util = cur.fetchone()

    return jsonify(vida_util)

@app.route('/alterar-dados', methods=['POST'])
def alterar_dados():

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                        password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        # Recebe os dados do corpo da solicitação como JSON
        dados = request.get_json()

        # Acesse os dados específicos, por exemplo, os equipamentos
        equipamentos = dados.get('equipamentos', [])
        id_solicitacao = equipamentos[0]['id_solicitacao']
        print(id_solicitacao)

        query_assinatura = f"""DELETE
                FROM sistema_epi.tb_assinatura
                WHERE id_solicitacao = '{id_solicitacao}'"""
        
        cur.execute(query_assinatura)

        input_tb_historico(id_solicitacao)

        # Faça algo com os dados, como salvá-los no banco de dados
        for equipamento in equipamentos:
            idExecucao = equipamento.get('idExecucao')
            equipamento_nome = equipamento.get('equipamento')
            quantidade = equipamento.get('quantidade')
            motivo = equipamento.get('motivo')

            cur.execute(""" UPDATE sistema_epi.tb_solicitacoes
                    SET codigo_item=%s, quantidade=%s, motivo=%s
                    WHERE id = %s
                    """, (equipamento_nome, quantidade, motivo, idExecucao))
            
            print(idExecucao,equipamento_nome,quantidade,motivo)

            conn.commit()
            
        conn.close()

            # Responda ao cliente
        return jsonify({'mensagem': 'Dados recebidos com sucesso!'})

    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/excluir-solicitacao', methods=['POST'])
@login_required
def excluir_solicitacao():

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    data = request.get_json()

    id_solicitacao = data['id_solicitacao']

    query_solicitacao = f"""DELETE FROM sistema_epi.tb_solicitacoes
            WHERE id_solicitacao = '{id_solicitacao}';
            """
    
    cur.execute(query_solicitacao)

    query_historico = f"""DELETE FROM sistema_epi.tb_historico_solicitacoes
            WHERE id_solicitacao = '{id_solicitacao}';
            """
    
    cur.execute(query_historico)

    query_assinatura = f"""DELETE FROM sistema_epi.tb_assinatura
            WHERE id_solicitacao = '{id_solicitacao}';
            """
    
    cur.execute(query_assinatura)

    conn.commit()
    conn.close()

    return 'Dados recebidos com sucesso!'


def condicao_historico(matricula, data_solicit,solicitante_historico):

    consulta_padrao = """
                    SELECT 
                        f_solicitante.nome as nome_solicitante,
                        s.codigo_item,
                        s.quantidade,
                        s.motivo,
                        f.nome as nome_funcionario_recebe,
                        s.data_solicitada
                    FROM 
                        sistema_epi.tb_solicitacoes s
                    JOIN 
                        requisicao.funcionarios f_solicitante ON s.matricula_solicitante = f_solicitante.matricula
                    JOIN 
                        requisicao.funcionarios f ON s.funcionario_recebe = f.matricula
                    WHERE 1=1"""
    
    if matricula:
        consulta_padrao += f" AND s.funcionario_recebe = '{matricula}'"
    if data_solicit:
        mes_inicial, mes_final = data_solicit.split(' - ')
        mes_inicial = datetime.strptime(mes_inicial, '%d/%m/%Y').date()
        mes_final = datetime.strptime(mes_final, '%d/%m/%Y').date() + timedelta(days=1)

        mes_inicial_formatado = mes_inicial.strftime('%Y-%m-%d')
        mes_final_formatado = mes_final.strftime('%Y-%m-%d')
        consulta_padrao += f" AND s.data_solicitada >= '{mes_inicial_formatado}' AND s.data_solicitada <= '{mes_final_formatado}'"
    if solicitante_historico:
        consulta_padrao += f" AND s.matricula_solicitante = '{solicitante_historico}'"

    consulta_padrao += ' ORDER BY s.id desc;'

    return consulta_padrao

@app.route('/historico', methods=['GET','POST'])
@login_required
def historico():

    if request.method == 'POST':

        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                            password=DB_PASS, host=DB_HOST)
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        data = request.get_json()

        matricula = data['matricula']

        data_solicit = data['data']

        solicitante_historico = data['solicitante_historico']

        query_historico = condicao_historico(matricula,data_solicit,solicitante_historico)
        
        cur.execute(query_historico)
        
        historicos = cur.fetchall()

        # Transformar a lista de listas em uma lista de dicionários
        historicos_dicts = []
        for historico in historicos:
            historico_dict = {
                'Solicitante': historico[0],
                'Equipamento': historico[1],
                'Quantidade': historico[2],
                'Motivo': historico[3],
                'Funcionario': historico[4],
                'DataSolicitada': historico[5].strftime('%d/%m/%Y')  # Convertendo para uma string de data formatada
            }
            historicos_dicts.append(historico_dict)

        return jsonify(historicos_dicts)

    else:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                            password=DB_PASS, host=DB_HOST)
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # QUERY PARA EXIBIR APENAS OS FUNCIONARIOS QUE ESTÃO NO tb_solicitacoes

        query_funcionarios = """SELECT DISTINCT funcionario_completo
                                    FROM (
                                        SELECT CONCAT(s.funcionario_recebe, ' - ', f.nome) AS funcionario_completo, s.*
                                        FROM sistema_epi.tb_solicitacoes s
                                        JOIN requisicao.funcionarios f ON s.funcionario_recebe = f.matricula
                                    ) AS subconsulta
                              """
        
        query_solicitante = """SELECT DISTINCT solicitante_completo
                                    FROM (
                                        SELECT CONCAT(s.matricula_solicitante, ' - ', f.nome) AS solicitante_completo, s.*
                                        FROM sistema_epi.tb_solicitacoes s
                                        JOIN requisicao.funcionarios f ON s.matricula_solicitante = f.matricula
                                    ) AS subconsulta
                              """
        
        cur.execute(query_funcionarios)
        
        funcionarios = cur.fetchall()

        cur.execute(query_solicitante)
        
        solicitantes = cur.fetchall()
    
    return render_template('historico.html',funcionarios=funcionarios,solicitantes=solicitantes)
    
@app.route('/ficha', methods=['GET'])
@login_required
def ficha():

    """Coleta de Informações necessária para a ficha de documentação"""

    return render_template('ficha.html')

# AINDA NÃO UTLIZADA, POREM VAI AJUDAR NA DOCUMENTAÇÃO
@app.route('/pegar-assinatura', methods=['GET'])
@login_required
def pegar_assinatur():

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER,
                            password=DB_PASS, host=DB_HOST)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    consulta = "SELECT id_solicitacao, assinatura, data_assinatura FROM sistema_epi.tb_assinatura"
    cur.execute(consulta)
    resultados = cur.fetchall()

    # 2. Extrair os dados da consulta
    dados_assinatura = []
    for resultado in resultados:
        id_solicitacao, assinatura_memoryview, data_assinatura = resultado
        
        # Converter memoryview para bytes e, em seguida, decodificar
        assinatura_bytes = bytes(assinatura_memoryview)
        assinatura_legivel = assinatura_bytes.decode('utf-8')  # ou outro método apropriado

        # Adicione os dados a uma lista
        dados_assinatura.append({
            'id_solicitacao': id_solicitacao,
            'assinatura': assinatura_legivel,
            'data_assinatura': data_assinatura
        })

    return 'sucess'

if __name__ == '__main__':
    app.run(debug=True)