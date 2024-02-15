from flask import Flask, render_template, request, jsonify,redirect, url_for,flash
import datetime
import psycopg2  # pip install psycopg2
import psycopg2.extras 
from psycopg2.extras import execute_values
from datetime import datetime
import cachetools
import uuid

app = Flask(__name__)
app.secret_key = "appEpi"

DB_HOST = "database-2.cdcogkfzajf0.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASS = "15512332"

@app.route('/', methods=['GET'])
def pagina_inicial():

    """
    Rota para página inicial
    """

    return render_template('tables.html')

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

    """
    Rota para de solicitação de material
    """

    # Renderize o template e passe o parâmetro de sucesso, se aplicável
    return render_template('solicitacao-material.html')

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

if __name__ == '__main__':
    app.run(debug=True)