from flask import Flask, flash, get_flashed_messages, redirect, render_template, request, session
from flask_session import Session

from helpers import login_required, raise_error, db_query, remove_dictlist_keys
from crypto import get_hash, check_hash

app = Flask(__name__)

app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

tmp_tooltips = False


def set_tooltips(*args):
    if session['tooltips']:
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


@app.route('/receive_data', methods=['POST', 'PUT'])
def receive_data():
    client_data = request.get_json()
    print(f'{client_data=}')
    # Process the received data as needed
    if 'tooltips' in client_data:
        global tmp_tooltips
        tmp_tooltips = True if client_data['tooltips'] == 'true' else False
    else:
        if 'upd_boards' in client_data:
            session['viewed_boards'] = client_data['upd_boards']

        if 'add_board' in client_data:
            db_query("INSERT INTO boards (id,board_name,color,last_modified) VALUES (?,?,?,?)",  # LAST MODIFIED = NOW
                     session['user_id'], client_data['add_board'], client_data['color'][1:], '00:00AM 0000-00-00')
        # edit_board
        if 'get_board' in client_data:
            boards = db_query('SELECT * FROM boards WHERE id=? AND board_id=?',
                              session['user_id'], client_data['get_board'])
            board = remove_dictlist_keys(boards, 'id')[0]
            ts = db_query('SELECT * FROM tasks WHERE id=? AND board_id=?',
                          session['user_id'], client_data['get_board'])
            for t in ts:
                t['list'] = sorted([{'content': x.split('::')[0], 'checked': int(x.split(
                    '::')[1])} for x in t['list'].split('||') if x], key=lambda x: x['checked'])
            board['tasks'] = remove_dictlist_keys(ts, 'id', 'board_id')
            if 'viewed_boards' in session:
                if client_data['get_board'] not in session['viewed_boards']:
                    session['viewed_boards'].append(
                        client_data['get_board'])
                    return board
            else:
                session['viewed_boards'] = [client_data['get_board']]
                return board
            return 'null'
        if 'rem_board' in client_data:
            session['viewed_boards'] = list(
                dict.fromkeys(session['viewed_boards']))
            session['viewed_boards'].remove(client_data['rem_board'])
        if 'del_board' in client_data:
            db_query('DELETE FROM boards WHERE id=? AND board_id=?',
                     session['user_id'], client_data['del_board'])
            db_query('DELETE FROM tasks WHERE id=? AND board_id=?',
                     session['user_id'], client_data['del_board'])
        if 'upd_board_data' in client_data:
            if 'pin' in client_data:
                db_query('UPDATE boards SET is_pinned=? WHERE id=? AND board_id=?',
                         int(client_data['pin']), session['user_id'], client_data['upd_board_data'])

        if 'add_task' in client_data:
            db_query("INSERT INTO tasks (id,board_id,task,list,date,priority,custom_order) VALUES (?,?,?,'',?,?,-1)",
                     session['user_id'], client_data['board_id'], client_data['task'], client_data['date'], client_data['priority'])
        if 'rem_task' in client_data:
            db_query('DELETE FROM tasks WHERE id=? AND board_id=? AND task_id=?',
                     session['user_id'], client_data['board_id'], client_data['rem_task'])
        # move_task

        # add_list
        # rem_list
        # move_list
        if 'upd_list' in client_data:
            ls = '||'.join(
                [a+'::'+str(b) for a, b in sorted(client_data['upd_list'], key=lambda x: x[1])])
            db_query('UPDATE tasks SET list=? WHERE id=? AND board_id=? AND task=?', ls,
                     session['user_id'], client_data['board'], client_data['task'])
    return {'message': 'Data received successfully', 'content': client_data}


@app.route('/')
@login_required
def index():
    set_tooltips('Welcome here', 'test', 'hehehehe')
    return render_template('index.html')


@app.route('/todos', methods=['GET', 'POST'])
@login_required
def todos():
    boards = db_query('SELECT * FROM boards WHERE id=?', session['user_id'])
    boards = remove_dictlist_keys(boards, 'id')
    for board in boards:
        ts = db_query('SELECT * FROM tasks WHERE id=? AND board_id=?',
                      session['user_id'], board['board_id'])
        for t in ts:
            t['list'] = sorted([{'content': x.split('::')[0], 'checked': int(x.split(
                '::')[1])} for x in t['list'].split('||') if x], key=lambda x: x['checked'])
        board['tasks'] = remove_dictlist_keys(ts, 'id', 'board_id')

    viewed_boards = sorted([board for board in boards if board['board_id'] in session.get(
        'viewed_boards', [])], key=lambda x: session.get('viewed_boards', []).index(x['board_id']))

    return render_template('todos.html', boards=boards, viewed_boards=viewed_boards)


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

        if len(rows) != 0:
            return raise_error('Username already taken', request.path)

        if confirmation != password:
            return raise_error('Passwords do not match', request.path)

        db_query('INSERT INTO users (username,hash) VALUES (?,?)',
                 username, get_hash(password))

        session['user_name'] = username
        session['user_id'] = db_query(
            'SELECT id FROM users WHERE username=?', username)[0]['id']
        session['tooltips'] = tmp_tooltips
        session['viewed_boards'] = []

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
        session['tooltips'] = tmp_tooltips
        session['viewed_boards'] = []

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
