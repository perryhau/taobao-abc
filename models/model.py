#!/usr/bim/python
#-*-coding: utf-8 -*-


from .db.mysqlpool.simplepool import EasyPool
import MySQLdb
import logging

class Model:
    
    @staticmethod
    def initailize(database_setting):
        if not hasattr(Model, "_db_settings"):
            Model._db_settings = database_setting
        if not hasattr(Model, "_pool"):
            Model._pool = EasyPool(max_conns = 100,threadsafe = True, **Model._db_settings)
            
    @staticmethod
    def initailized():
        """Returns true if the class variable _db_settings has been created."""
        print Model._db_settings
        return hasattr(Model, "_db_settings")
    
    
    @classmethod
    def query(cls, query, *parameters):
        conn = Model._pool.connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)
        try:
            cursor.execute(query, parameters)
            columns = cursor.fetchall()
            return columns
        
        except MySQLdb.Error, e:
            logging.error("Error MySQL on %s", e.args[1])
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def fetchone(cls, query, *parameters):
        conn = Model._pool.connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)
        try:
            cursor.execute(query, parameters)
            column = cursor.fetchone()
            return column
        except MySQLdb.Error, e:
            logging.error("Error MySQL on %s", e.args[1])
        finally:
            cursor.close()
            conn.close()
        
    def __init__(self):
        pass
        
    def __getitem__(self, name):
        self._row[name]

    def __setitem__(self, name, value):
        self._row['name'] = value

    def save(self):
        raise NotImplementedError("save")

    @classmethod
    def save_many(cls, tablename, cols, valuelist):
        l = len(cols)
        value_arg = "%s," * (l - 1) + "%s"
        stmt = "INSERT IGNORE INTO " + tablename + \
            "(" + ",".join(cols) + ")" + "VALUES(%s)" % (value_arg)
        Model.execute_many(stmt, valuelist)

    @classmethod
    def replace_many(cls, tablename, cols, valuelist):
        l = len(cols)
        value_arg = "%s," * (l - 1) + "%s"
        stmt = "REPLACE INTO " + tablename + "(" + ",".join(
            cols) + ")" + "VALUES(%s)" % (value_arg)
        Model.execute_many(stmt, valuelist)

    @classmethod
    def execute_many(cls, query, args):
        conn = Model._pool.connection()
        cursor = conn.cursor()
        try:
            cursor.executemany(query, args)
            conn.commit()
        except MySQLdb.Error, e:
            conn.rollback()
            logging.error("Error MySQL on %s", e.args[1])
        finally:
            cursor.close()
            conn.close()

    @classmethod
    def execute(cls, query, *args):
        conn = Model._pool.connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, args)
            conn.commit()
        except MySQLdb.Error, e:
            conn.rollback()
            logging.error("Error MySQL on %s", e.args[1])
        finally:
            cursor.close()
            conn.close()

    @classmethod
    def find_by_sql(cls, query, *args):
        return cls.query(query, *args)

    @classmethod
    def fetch_one(cls, query, *args):
        return cls.fetchone(query, *args)

    @staticmethod
    def create():
        raise NotImplementedError("create")

    @staticmethod
    def destory():
        raise NotImplementedError("destory")
