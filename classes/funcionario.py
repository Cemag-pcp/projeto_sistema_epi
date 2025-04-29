import psycopg2
import psycopg2.extras

class FuncionarioCRUD:
    def __init__(self, dbname, user, password, host):
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host

    def connect(self):
        return psycopg2.connect(dbname=self.dbname, user=self.user, password=self.password, host=self.host)
    

    # def create_funcionario(self, matricula, nome, setor, data_admissao):
    #     conn = self.connect()
    #     cur = conn.cursor()
    #     try:
    #         cur.execute("INSERT INTO requisicao.funcionarios (matricula, nome, setor, data_admissao) VALUES (%s, %s, %s, %s)",
    #                     (matricula, nome, setor, data_admissao))
    #         conn.commit()
    #     except Exception as e:
    #         conn.rollback() # Desfaz a transação se houver um erro
    #         raise e  # Relança a exceção para ser tratada em outro lugar
    #     finally:
    #         cur.close()
    #         conn.close()

    def update_funcionario(self, matricula, nome, setor, data_admissao, matriculaAnterior, ativoFuncionario):
        conn = self.connect()
        cur = conn.cursor()
        # sql = "UPDATE requisicao.funcionarios SET matricula = %s, nome = %s, setor = %s, data_admissao = %s WHERE matricula = %s",(matricula, nome, setor, data_admissao, matriculaAnterior)
        try:
            cur.execute("UPDATE requisicao.funcionarios SET matricula = %s, nome = %s, setor = %s, data_admissao = %s, ativo = %s WHERE matricula = %s",
                        (matricula, nome, setor, data_admissao, ativoFuncionario, matriculaAnterior))
            conn.commit()
        except Exception as e:
            conn.rollback() # Desfaz a transação se houver um erro
            raise e  # Relança a exceção para ser tratada em outro lugar
        finally:
            cur.close()
            conn.close()

    def desabilitar_funcionario(self, matricula):
        conn = self.connect()
        cur = conn.cursor()
        try:
            cur.execute("UPDATE requisicao.funcionarios SET ativo = FALSE WHERE matricula = %s", (matricula,))
            conn.commit()
        except Exception as e:
            conn.rollback()  # Desfaz a transação se houver um erro
            raise e  # Relança a exceção para ser tratada em outro lugar
        finally:
            cur.close()
            conn.close()
    