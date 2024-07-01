import psycopg2
import psycopg2.extras

class EquipamentoCRUD:
    def __init__(self, dbname, user, password, host):
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host

    def connect(self):
        return psycopg2.connect(dbname=self.dbname, user=self.user, password=self.password, host=self.host)

    def create_equipamento(self, codigo, nome, vida_util, ca):
        conn = self.connect()
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO sistema_epi.tb_itens (codigo, descricao, vida_util, ca) VALUES (%s, %s, %s, %s)",
                        (codigo, nome, vida_util, ca))
            conn.commit()
        except Exception as e:
            conn.rollback() # Desfaz a transação se houver um erro
            raise e  # Relança a exceção para ser tratada em outro lugar
        finally:
            cur.close()
            conn.close()

    def update_equipamento(self, codigo, vida_util, ca):
        conn = self.connect()
        cur = conn.cursor()
        try:
            cur.execute("UPDATE sistema_epi.tb_itens SET vida_util = %s, ca = %s WHERE codigo = %s",
                        (vida_util, ca, codigo))
            conn.commit()
        except Exception as e:
            conn.rollback() # Desfaz a transação se houver um erro
            raise e  # Relança a exceção para ser tratada em outro lugar
        finally:
            cur.close()
            conn.close()

    def delete_equipamento(self, codigo):
        conn = self.connect()
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM sistema_epi.tb_itens WHERE codigo = %s", (codigo,))
            conn.commit()
        except Exception as e:
            conn.rollback()  # Desfaz a transação se houver um erro
            raise e  # Relança a exceção para ser tratada em outro lugar
        finally:
            cur.close()
            conn.close()
