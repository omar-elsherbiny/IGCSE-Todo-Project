import sqlite3
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


def raise_error(err, url):
    flash(err, 'error')
    return redirect(url)


def dict_factory(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}


def db_query(query, *params):
    with sqlite3.connect('database.db') as connection_obj:
        connection_obj.row_factory = dict_factory
        db = connection_obj.cursor()
        if 'SELECT' in query:
            res = db.execute(query, params).fetchall()
            print(f'sql query result={res}')
            return res
        elif any(k in query for k in ('INSERT', 'UPDATE', 'DELETE')):
            db.execute(query, params)
            connection_obj.commit()


def remove_dictlist_keys(dictlist, *keys):
    return [{key: val for key, val in d.items() if key not in keys} for d in dictlist]
