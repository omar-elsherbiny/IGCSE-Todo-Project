CREATE TABLE users (
    id INTEGER NOT NULL PRIMARY KEY,      
    username TEXT NOT NULL UNIQUE,        
    hash TEXT NOT NULL UNIQUE,
    tasks_done INTEGER DEFAULT 0
);
CREATE TABLE boards (
    board_id INTEGER NOT NULL PRIMARY KEY,
    id INTEGER NOT NULL,
    board_name TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    color TEXT,
    last_modified TEXT,
    sort_type INTEGER DEFAULT 0,
    FOREIGN KEY (id) REFERENCES users(id) 
);
CREATE TABLE tasks (
    task_id INTEGER NOT NULL PRIMARY KEY,
    id INTEGER NOT NULL,
    board_id INTEGER NOT NULL,
    task TEXT NOT NULL,
    list TEXT,
    date TEXT,
    priority INTEGER DEFAULT 0,
    custom_order INTEGER DEFAULT -1,
    creation_date TEXT,
    FOREIGN KEY (id) REFERENCES users(id),
    FOREIGN KEY (board_id) REFERENCES boards(board_id)
);
