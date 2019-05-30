import sqlite3
import xml.etree.ElementTree as ET


def frequuency_dict_array_to_str(array): #Converts an array of dictionarys into a database-friendly format of key*pair-key*pair_
    output = ""
    for dict in array:
        output += "type*" + dict["type"] + "-freq*" + dict["freq"] + "_"
    if output is not "":
        return output
    else:
        return "none"


def runway_dict_array_to_str(array): #Converts an array of dictionarys into a database-friendly format of key*pair-key*pair_
    output = ""
    for dict in array:
        output += "designation*" + dict["designation"] + "-length*" + dict["length"] + "-width*" + dict["width"] + "-surface*" + dict["surface"] + "_"
    return output


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


def setup_db():
    conn = create_connection("waypoints.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS airports
                 (lat text, long text, magvar text, name text, navaidname text, navaidcountry text, frequencies text, runways text)''')
    c.close()
    # Frequencies column schema: type:freq,type:freq
    # Runways column schema: name,length,width,surface


def insert_airport(lat, long, magvar, name, navaidname, navaidcountry, frequencies, runways):
    conn = create_connection("waypoints.db")
    sql = "INSERT INTO airports(lat,long,magvar,name,navaidname,navaidcountry,frequencies,runways) " \
          "VALUES ({},{},{},{},{},{},{},{})".format(lat, long, magvar, "'" + name + "'", "'" + navaidname.replace("'","") + "'", "'" + navaidcountry + "'", "'" + frequencies + "'", "'" + runways + "'")
    #print(sql)
    c = conn.cursor()
    c.execute(sql)
    conn.commit()
    c.close()


def move_airport_from_gpx_to_db():
    print("Migrating airports from gpx file to sqlite3 file...")
    count = 0
    for wpt in root:
        if count >= 1000:
            break
        type = wpt.find("d:type", ns).text
        if type == "AIRPORT":
            count += 1
            lat = wpt.get("lat")
            long = wpt.get("lon")
            name = wpt.find("d:name", ns).text
            if count % 100 == 0: print(str(count) + " Airport: " + name)
            #print("Found airport: " + name)
            extensions = wpt.find("d:extensions", ns)
            navaidname = extensions.find("n:name", navaid).text
            navaidcountry = extensions.find("n:country", navaid).text
            magvar = extensions.find("n:magvar", navaid).text
            frequencies_element = extensions.find("n:frequencies", navaid)
            runways_element = extensions.find("n:runways", navaid)
            frequencies = []
            runways = []

            if frequencies_element is not None:
                for frequency in frequencies_element:
                    freqtype = frequency.get("type")
                    freq = frequency.get("frequency")
                    frequencies.append({"type": freqtype, "freq": freq})

            if runways_element is not None:
                for runway in runways_element:
                    designation = runway.get("designation").replace("/","")
                    length = runway.get("length")
                    width = runway.get("width")
                    surface = runway.get("surface")
                    runways.append({"designation": designation, "length": length, "width": width, "surface": surface})

            runways_string = runway_dict_array_to_str(runways)
            freq_string = frequuency_dict_array_to_str(frequencies)
            #print("Inserting airport into database...")
            insert_airport(lat, long, magvar, name, navaidname, navaidcountry, freq_string, runways_string)


tree = ET.parse("file0TZYyc.gpx")
ns = {'d': "http://www.topografix.com/GPX/1/1"}
navaid = {"n": "http://navaid.com/GPX/NAVAID/1/0"}
root = tree.getroot()
setup_db()
move_airport_from_gpx_to_db()
