#!/usr/bin/python
#-*- coding: utf-8 -*-

"""
Author : Thomas Huang
Date : 2013-05-01
Description:
    MySQL  connection pool
"""

import time

from threading import Condition, Semaphore
import os
from Queue import  Empty, Full
from connection import Connection

class SimpleConnection:
    
    def __init__(self, pool, con):
        self._con = con
        self._pool = pool
    def close(self):
        """release connection to pool for reusing"""
        if self._con is not None:
            self._pool.release(self._con)
            self._con = None
    
    def __getattr__(self, name):
        return getattr(self._con, name)
    
    
    def __del__(self):
        self.close()
        
class EasyPool:
    
    def __init__(self, conn_class = Connection, 
                 max_conns = None, threadsafe = True,
                 **conn_kwargs):
        #self.name = ""
        self.pid = os.getpid()
        self.conn_class = conn_class
        self.conn_kwargs = conn_kwargs
        
        if threadsafe:
            self._lock = Condition()
            self.connection = self.threadsafe_get_connection
            self.release = self.threadsafe_release
            self.max_conns = max_conns or 2 ** 31
            self._created_conns = 0
            
            self._available_conns = []
            self._in_use_conns = []
        else:
            from Queue import Queue
            self._queue = Queue(max_conns) # create the queue
            self.connection = self.unthreadsafe_get_connection
            self.release = self.unthreadsafe_release
            
        
    
    def _checkpid(self):
        if self.pid != os.getpid():
            self.disconnect()
            self.__init__(self.conn_class, self.max_conn, **self.conn_kwargs)
    
    def threadsafe_get_connection(self):
        """get a connection from pool"""
        self._checkpid()
        self._lock.acquire()
        try:
            connection = self._available_conns.pop()
        except IndexError:
            connection = self.threadsafe_new_connection()
            self._in_use_conns.append(connection)
        finally:
            self._lock.release()
        return SimpleConnection(self, connection)
    
    def threadsafe_new_connection(self):
        if self._created_conns >= self.max_conns:
            raise Exception("Too many connections")
        self._lock.acquire()
        self._created_conns += 1
        self._lock.release()
        conn = self.conn_class(max_conns=None, closeable=False, **self.conn_kwargs)
        return conn
        
    
    def threadsafe_release(self, connection):
        self._checkpid()
        self._lock.acquire()
        if connection in self._in_use_conns:
            self._in_use_conns.remove(connection)
            self._available_conns.append(connection)
        self._lock.release()
    
    def unthreadsafe_get_connection(self):
        conn = None
        try:
            conn = self._queue.get()
        except Empty:
            raise Exception("No connection available.")
        if conn is None:
            # thread unsafe 
            conn = self.unthreadsafe_new_connection()
        return SimpleConnection(self, conn)
    
    def unthreadsafe_new_connection(self):
        return self.connection_class(**self.conn_kwargs)
    
    def unthreadsafe_release(self, conn):
        """Releases the connection back to the pool."""
        self._checkpid()
        
        # Put the connection back into the pool.
        try:
            self._queue.put_nowait(conn)
        except Full:
            pass
        
    def disconnet(self):
        #all_conns = chain(self._available_conns, self._in_use_conns)
        for conn in self._available_conns:
            conn.close()
        for conn in self._in_use_conns:
            conn.close()

            
class MySQLSyncPool:    
    
    def __init__(self, max_conns = 50, timeout = 20,conn_class = None, queue_class = None, **conn_kwargs):
        if conn_class  is None:
            conn_class = Connection
        if queue_class is None:
            from Queue import LifoQueue
            queue_class = LifoQueue 
        
        self._lock = Condition()
        self.conn_class = conn_class
        self.conn_kwargs = conn_kwargs
        self.max_conns = max_conns 
        self.timeout = timeout
        is_valid = isinstance(max_conns, int) and max_conns > 0
        if not is_valid:
            raise ValueError('``max_connections`` must be a positive integer')
    
        self.pid = os.getpid()

        # Create and fill up a thread safe queue with ``None`` values.
        self.pool = self.queue_class(max_conns)
        while True:
            try:
                self.pool.put_nowait(None)
            except Full:
                break

        # Keep a list of actual connection instances so that we can
        # disconnect them later.
        self._conns = []
        
    def _checkpid(self):
        """
        Check the current process id.  If it has changed, disconnect and
        re-instantiate this connection pool instance.
        """
        # Get the current process id.
        pid = os.getpid()

        # If it hasn't changed since we were instantiated, then we're fine, so
        # just exit, remaining connected.
        if self.pid == pid:
            return

        # If it has changed, then disconnect and re-instantiate.
        self.disconnect()
        self.reinstance()
    
    def new_connection(self):
        self._lock.acquire()
        try:
            conn = self.conn_class(**self.conn_kwargs)
            self._conns.append(conn)
        except Exception:
            pass
        finally:
            self._lock.release()
        return conn
    
    def get_connection(self):
        self._checkpid()
        conn = None
        try:
            conn = self.pool.get(block=True, timeout=self.timeout)
        except Empty:
            raise Exception("No connection available.")
        if conn is None:
            # thread unsafe 
            conn = self.new_connection()
        return conn   
    
    def release(self, connection):
        """Releases the connection back to the pool."""
        self._checkpid()
        
        # Put the connection back into the pool.
        try:
            self.pool.put_nowait(connection)
        except Full:
            pass
    
    def disconnect(self):
        """Disconnects all connections in the pool."""
        for conn in self._conns:
            try:
                conn.disconnect()
            except Exception:
                        pass  
        self._conns = []
           
    def reinstance(self):
        """
        Reinstatiate this instance within a new process with a new connection
        pool set.
        """
        self.__init__(max_conns=self.max_conns,
                      timeout=self.timeout,
                      conn_class=self.conn_class,
                      queue_class=self.queue_class, **self.conn_kwargs)
    
class MySQLCherryPool:
        
    def __init_(self,conn_class, max_conns, 
                    max_shared, timetout,conn_kwargs, threadlocal):
        self.threadlocal = threadlocal

    def get_connection(self, shareable = True):
        pass
        
    def new_connection(self):
        pass
            
            
            
            
            
            
            
            
            
            
            
            
            
            
        