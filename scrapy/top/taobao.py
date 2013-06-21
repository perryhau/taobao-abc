#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

import requests
import datetime
import hashlib
from .top_setting import top
 

_AppKey = top['app_key']
_AppSecret = top['app_secret']
_Gateway = top['gateway']

_Format     = top['format']  
_SignMethod = top['sign_method'] 
_APIVersion = top['v']  

def _now_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

class AbstractClient:
 
    def __init__(self, **app_settings):
        self.sys_params = {  
            'app_key' : _AppKey,  
            'v'       : _APIVersion,  
            'format'  : _Format,  
            'sign_method' : _SignMethod
        }  

        self.app_secret = _AppSecret  
        self.gateway = _Gateway  
        if app_settings :  
            self.sys_params.update(app_settings)
        self.response = None
            
    def exceute(self, session = None):
        raise NotImplementedError("please implement execute method in subclass")

class ClientMinix:
    
    def sign(self, params) :  
        items = params.items()  
        items.sort()  
        s = self.app_secret  
        for item in items :  
            s += '%s%s' % item  
        s += self.app_secret  
        m = hashlib.md5()  
        m.update(s)  
        
        return m.hexdigest().upper() 
    
    def json(self):
        if self.is_fine():
            return self.response.json() 

    def text(self):
        if self.is_fine():
            return self.response.text 

    def is_fine(self):
        if self.response:
            status = self.response.status_code
            return status == 200 or status == 201
        return False

    @property
    def respone(self):
        return self.response


class TopClient(AbstractClient, ClientMinix):
 
    def __init__(self, **app_settings):
        AbstractClient.__init__(self, **app_settings)

    def set_gateway(self, url):
        self.gateway = url

    def execute(self, request, session = None):
        """
        @Args:
            session : taobao api access_token or session
        @Return:
            response : requests.get()-> return value object
        """ 
        params = self.sys_params.copy()  
        api_params = request.get_api_params()

        params['method'] = request.get_method_name()  
        params['timestamp'] =  datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")  
        if session is not None :  
            params['session'] = session  
        params.update(api_params)
        params['sign'] = self.sign(params) 
        #print "params :", params
        self.response = requests.get(self.gateway, params = params)

        return self.response

    
class TopRequest:  
 
    def __init__(self, method_name):  
        self.method_name = method_name  
        self.api_params = {}  

    def get_api_params(self): 
        return self.api_params  

    def get_method_name(self): 
        return self.method_name  

    def __setitem__(self, param_name, param_value): 
        self.api_params[param_name] = param_value



class TopTradeRequest(TopRequest):

    def __init__(self, status = "TRADE_FINISHED" ):
        TopRequest.__init__(self, 'taobao.trades.sold.get')
        # self.api_params['status'] = status
        # self.api_params['page_no'] = 1
        # self.api_params['page_size'] = 50
        # self.api_params['use_has_next'] = "false"
        # self.api_params['end_created'] = _now_timestamp()

    def next_page(self):
        pass