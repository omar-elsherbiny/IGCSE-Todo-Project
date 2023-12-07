from flask import flash, redirect, render_template, session
from functools import wraps

def login_required(f):
    """Decorate routes to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user_id') is None:
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated_function

def raise_error(err,url):
    flash(err,'error')
    return redirect(url)