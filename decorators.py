from functools import wraps

from flask import g, flash, redirect, url_for, request, jsonify
from werkzeug.exceptions import HTTPException

def web_authenticated(method):
    @wraps(method)
    def wrapper(*args, **kwargs):
        if g.user is None:
            flash(u'You need to be signed in for this page.')
            return redirect(url_for('users.login', next=request.path))
        return method(*args, **kwargs)
    
    return wrapper 



def is_ajax(method):
    @wraps(method)
    def wrapper(*args, **kwargs):
        if "X-Requested-With" in request.headers:
            if request.headers['X-Requested-With'] == "XMLHttpRequest":
                return method(*args, **kwargs)
        else:                                                                                                                                                                 
            return jsonify(status= "error", msg= "It is not ajax request")                                                    

    return wrapper 
    
def ajax_authenticated(method):
    """Decorate methods with this to require that the user be logged in.

    If the user is not logged in, it will send User Authenticated Failed to cilent
    """
    @wraps(method)
    def wrapper(*args, **kwargs):
        if g.user:
            if request.method in ("GET", "HEAD"):
                return jsonify(status="error", msg="User Authenticated Failed")
            raise HTTPException(403)
        return method( *args, **kwargs)
    
    return wrapper