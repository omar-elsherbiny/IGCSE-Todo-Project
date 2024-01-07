import sqlite3
from flask import flash, redirect, render_template, session
from functools import wraps
from datetime import datetime
from crypto import gen_matrix, matrix_encrypt, matrix_decrypt


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


encryption_key = gen_matrix(2, 25565)


def db_query(query, *params):
    with sqlite3.connect('database.db') as connection_obj:
        connection_obj.row_factory = dict_factory
        db = connection_obj.cursor()
        if 'SELECT' in query:
            res = db.execute(query,
                             [matrix_encrypt(param, encryption_key) if isinstance(param,str) else param for param in params]).fetchall()
            for dic in res:
                for key, value in dic.items():
                    if isinstance(dic[key],str):
                        dic[key] = matrix_decrypt(value, encryption_key)
            print(f'sql query result={res}')
            return res
        elif any(k in query for k in ('INSERT', 'UPDATE', 'DELETE')):
            db.execute(query,
                        [matrix_encrypt(param, encryption_key) if isinstance(param,str) else param for param in params])
            connection_obj.commit()


def remove_dictlist_keys(dictlist, *keys):
    return [{key: val for key, val in d.items() if key not in keys} for d in dictlist]


def current_time():
    return datetime.now().strftime("%H:%M:%S %Y-%m-%d")


def sorted_on_time(dictlist, time_attr, seconds=True):
    if not seconds:
        return sorted(dictlist, key=lambda x: datetime.strptime(x[time_attr], "%H:%M %Y-%m-%d"), reverse=True)
    return sorted(dictlist, key=lambda x: datetime.strptime(x[time_attr], "%H:%M:%S %Y-%m-%d"), reverse=True)
