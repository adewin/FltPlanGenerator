import sqlite3


def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except sqlite3.Error as e:
        print(e)

    return None

def add_size(ident, size):
    conn = create_connection("waypoints.db")
    sql = "UPDATE airports SET size = '{}' WHERE name LIKE '%{}'".format(size, ident)
    print(sql)
    c = conn.cursor()
    c.execute(sql)
    conn.commit()
    c.close()

airports = open("airport-codes.csv","r+",encoding='utf-8').readlines()[1:] # skip first line
for airport in airports:
    data = airport.split(",")
    ident = data[0]
    type = data[1]

    print(ident, type)
    add_size(ident, type)