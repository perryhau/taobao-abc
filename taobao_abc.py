#!/usr/bin/python2.7
# -*- coding: utf-8 -*-


import json

from flask import Flask, session, g, render_template
from flask.sessions import SecureCookieSession, SecureCookieSessionInterface

from models.model import Model
import settings



class JSONSecureCookieSession(SecureCookieSession):
    serialization_method = json

class JSONSecureCookieSessionInterface(SecureCookieSessionInterface):
    session_class = JSONSecureCookieSession


app = Flask(__name__)
app.secret_key = "I-like-cookies-and-some-secure-cookies"
app.session_interface = JSONSecureCookieSessionInterface()
app.debug = True

      
def init_db_settings():
    """initialize database the database tables."""
    Model.initailize(settings.db_setting)
    
    
@app.before_request
def before_request():
    """
    pull user's profile from the database before every request are treated
    """
    g.user = None
    if 'member_auth' in session:
        g.user = session.get('member_auth')
    

@app.route(r'/')
def index():
    user = None
    return render_template("index.html", user = user)

@app.route(r'/v')
def v():
    return render_template("v.html")


@app.route(r'/fav')
def fav():
    return render_template('fav.html')


@app.route(r'/c')
def c():
    return render_template('c.html')


@app.route(r'/l')
def l():
    return render_template('l.html')

    
@app.route(r'/ajax/')
def ajax_key():
    pass


if __name__ == '__main__':
    init_db_settings()
    app.run()
