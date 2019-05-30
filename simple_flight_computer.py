import math
import sqlite3
import xml.etree.ElementTree as ET


class airport:
    def __init__(self, lat, long, magvar):
        self.lat = lat
        self.long = long
        self.magvar = magvar

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


def calculate_initial_compass_bearing(pointA, pointB):
    """
    Calculates the bearing between two points.
    The formulae used is the following:
        θ = atan2(sin(Δlong).cos(lat2),
                  cos(lat1).sin(lat2) − sin(lat1).cos(lat2).cos(Δlong))
    :Parameters:
      - `pointA: The tuple representing the latitude/longitude for the
        first point. Latitude and longitude must be in decimal degrees
      - `pointB: The tuple representing the latitude/longitude for the
        second point. Latitude and longitude must be in decimal degrees
    :Returns:
      The bearing in degrees
    :Returns Type:
      float
    """
    if (type(pointA) != tuple) or (type(pointB) != tuple):
        raise TypeError("Only tuples are supported as arguments")

    lat1 = math.radians(pointA[0])
    lat2 = math.radians(pointB[0])

    diffLong = math.radians(pointB[1] - pointA[1])

    x = math.sin(diffLong) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - (math.sin(lat1)
            * math.cos(lat2) * math.cos(diffLong))

    initial_bearing = math.atan2(x, y)

    # Now we have the initial bearing but math.atan2 return values
    # from -180° to + 180° which is not what we want for a compass bearing
    # The solution is to normalize the initial bearing as shown below
    initial_bearing = math.degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360

    return compass_bearing


def angle_between_airports(airport1_ident, airport2_ident):
    conn = create_connection("waypoints.db")
    c = conn.cursor()
    c.execute("SELECT * FROM airports WHERE name=?", (airport1_ident,))
    airport1_response = c.fetchall()[0]
    airport1 = airport(airport1_response.split(",")[0], airport1_response.split(",")[1], airport1_response.split(",")[2])
    c.execute("SELECT * FROM airports WHERE name=?", (airport2_ident,))
    airport2_response = c.fetchall()[0]
    airport2 = airport(airport2_response.split(",")[0], airport2_response.split(",")[1], airport2_response.split(",")[2])
    c.close()

    heading = calculate_initial_compass_bearing((airport1.lat, airport1.long), (airport2.lat, airport2.long))
    print(heading)


print(angle_between_airports("CYBF", "CYF8"))