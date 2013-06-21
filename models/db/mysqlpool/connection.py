#!/usr/bin/python
# -*- coding : utf-8 -*-


import MySQLdb
import time
from threading import Semaphore
import logging


class Connection:

    def __init__(self, max_conns=None, closeable=False, **kwargs):
        self._closeable = closeable
        self.max_conns = max_conns
        self._transaction = False
        self._conn_kwargs = {
            'charset': 'utf8',
            'use_unicode': True,
        }
        self._conn_kwargs.update(kwargs)
        self.init()
    

    def init(self):
        self._con = None
        self._closed = True
        self.max_idle_sec = 25200
        self._last_use_sec = time.time()
        self._lock = Semaphore()
        self._locked = False
        self.reconnect()
    

    def _reconect(self):
            self._connect()

    def _connect(self):
        try:
            self._con = MySQLdb.connect(**self._conn_kwargs)
        except MySQLdb.Error, e:
            logging.error("connect wrong %s" % e.args[1])
            

    

    def _store(self):
        self.reconnect()
        self._transaction = False
        self._closed = False
        self._used = 0

    def __del__(self):
        self.close()

    def cursor(self, cursor_type=None):
        self._ensure_connected()
        if cursor_type is None:
            return self._con.cursor()
        
        return self._con.cursor(cursor_type)

    def close(self):
        if self._closeable:
            self._close()
        elif self._transaction:
            self._reset()

    def _close(self):
        
        if self._con is not None:
            self._con.close()
            self._con = None
        self._transaction = False
        self._closed = True

    def _reset(self, force=False):

        if force or self._transaction:
            try:
                self.rollback()
            except Exception:
                pass
            
    def reconnect(self):
        self._close()
        self._connect()
        self._closed = False
        
    def _ensure_connected(self):
        if self._con is None or \
                (time.time() - self._last_use_sec > self.max_idle_sec):
            self.reconnect()
            self._last_use_sec = time.time()

    def begin(self):
        pass

    def commit(self):
        self._con.commit()

    def rollback(self):
        self._con.rollback()

    def lock(self, block=True):
        """
        Lock connection from being used else where
        """
        self._locked = True
        return self._lock.acquire(block)

    def release(self):
        """
        Release the connection lock
        """
        if self._locked is True:
            self._locked = False
            self._lock.release()

    def is_locked(self):
        """
        Returns the status of this connection
        """
        return self._locked
    


if __name__ == '__main__':
    db_setting = {
    'host':       'localhost',
    'user':       'root',
    'passwd':     '123456',
    'db':         'taobao_abc',
    'port':       3306,
    'charset':    'utf8',
    'use_unicode' : True
}
    
    conn = Connection(**db_setting)
    cur = conn.cursor()
    
    
    
    
    