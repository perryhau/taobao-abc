#!/usr/bin/python
#-*- coding: utf-8 -*-

"""
Author : Thomas Huang
Date : 2013-05-01
Description:
    MySQL cached and threadsafe connection pool
"""

import time

from threading import Condition, Semaphore
import threading.local

from Queue import Queue
from Queue import  Empty, Full
from connection import Connection

class SharedConnection:
    
    def __init__(self):
        pass

class CherryPool:
    pass