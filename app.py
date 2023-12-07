import sqlite3
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session

from helpers import login_required

app = Flask(__name__)

app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

connection_obj = sqlite3.connect('database.db')
db = connection_obj.cursor()


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Expires'] = 0
    response.headers['Pragma'] = 'no-cache'
    return response


@app.route('/')
#@login_required
def index():
    flash('HEEEEEEEEEEEEELO','error')
    flash('HI')
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    session.clear()
    if request.method == 'POST':
        if not request.form.get('username'):
            return apology('must provide username', 400)

        # Ensure password was submitted
        elif not request.form.get('password'):
            return apology('must provide password', 400)

        # Query database for username
        rows = db.execute('SELECT * FROM users WHERE username = ?',
                          request.form.get('username'))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]['hash'], request.form.get('password')):
            return apology('invalid username and/or password', 400)

        # Remember which user has logged in
        session['user_id'] = rows[0]['id']

        # Redirect user to home page
        return redirect('/')

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

if __name__=='__main__':
    pass