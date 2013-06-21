#!/usr/bin/python2.7
# coding:utf-8


redis_setting = {
    'host'    : "localhost",
    'db':  0,
    'port': 6379
}


db_setting = {
    'host':       'localhost',
    'user':       'root',
    'passwd':     '123456',
    'db':         'taobao_abc',
    'port':       3306,
    'charset':    'utf8',
    'use_unicode' : True
}


top_setting = {
    'app_key':        'test',
    'app_secret':     'test',
    'oauth_host':     "https://oauth.taobao.com/authorize",
    'redirect_uri':   "http://192.168.1.101:8688/oauth/code"
}
