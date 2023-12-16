import sqlite3
from flask import Flask, flash, get_flashed_messages, redirect, render_template, request, session
from flask_session import Session

from helpers import login_required, raise_error
from crypto import get_hash, check_hash

app = Flask(__name__)

app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

tooltips = False


def dict_factory(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}


def db_query(query, *params):
    connection_obj = sqlite3.connect('database.db')
    connection_obj.row_factory = dict_factory
    db = connection_obj.cursor()
    if 'SELECT' in query:
        res = db.execute(query, params).fetchall()
        connection_obj.close()
        print(res)
        return res
    elif 'INSERT' in query:
        db.execute(query, params)
        connection_obj.commit()
        connection_obj.close()


def set_tooltips(*args):
    if tooltips:
        for arg in args:
            flash(arg, 'info')

# REMOVE
@app.route('/flash')
def flash_test():
    flash('message')
    flash('very important info', 'info')
    flash('very good success', 'success')
    return raise_error('very dangerous error', '/')


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Expires'] = 0
    response.headers['Pragma'] = 'no-cache'
    return response


@app.route('/receive_data', methods=['POST'])
def receive_data():
    global tooltips
    data_from_client = request.json
    # Process the received data as needed
    print(data_from_client)
    tooltips = True if data_from_client['tooltips'] == 'true' else False
    return {'message': 'Data received successfully'}


@app.route('/')
@login_required
def index():
    set_tooltips('Welcome here', 'test', 'hehehehe')
    return render_template('index.html')


@app.route('/todos', methods=['GET', 'POST'])
@login_required
def todos():
    return render_template('todos.html')

# REMOVE
@app.route('/subjects', methods=['GET', 'POST'])
@login_required
def subjects():
    return render_template('ihatemyself.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    get_flashed_messages()
    session.clear()
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirmation = request.form.get('confirmation')
        if not username:
            return raise_error('Must provide username', request.path)
        elif not password:
            return raise_error('Must provide password', request.path)
        elif not confirmation:
            return raise_error('Must re-type password', request.path)

        rows = db_query('SELECT * FROM users WHERE username = ?',
                        request.form.get('username'))
        print("rows:::::: ", rows)

        if len(rows) != 0:
            return raise_error('Username already taken', request.path)

        if confirmation != password:
            return raise_error('Passwords do not match', request.path)

        db_query('INSERT INTO users (username,hash) VALUES (?,?)',
                 username, get_hash(password))

        session['user_name'] = username
        session['user_id'] = db_query(
            'SELECT id FROM users WHERE username=?', username)

        flash('New account made', 'success')
        return redirect('/')
    else:
        return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    get_flashed_messages()
    session.clear()
    if request.method == 'POST':
        if not request.form.get('username'):
            return raise_error('Must provide username', request.path)
        elif not request.form.get('password'):
            return raise_error('Must provide password', request.path)

        rows = db_query('SELECT * FROM users WHERE username = ?',
                        request.form.get('username'))

        if len(rows) != 1 or not check_hash(rows[0]['hash'], request.form.get('password')):
            return raise_error('Invalid username and/or password', request.path)

        session['user_id'] = rows[0]['id']
        session['user_name'] = rows[0]['username']

        flash('Successfully logged in', 'success')
        return redirect('/')
    else:
        return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('Successfully logged out', 'success')
    return redirect('/')


@app.route('/account', methods=['GET', 'POST'])
@login_required
def account():
    return render_template('account.html')


if __name__ == '__main__':
    # app.run()
    pass
