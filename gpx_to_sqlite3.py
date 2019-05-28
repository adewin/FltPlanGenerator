import sqlite3
import xml.etree.ElementTree as ET
from xml.etree import ElementTree


def dontuse():
    conn = sqlite3.connect("waypoints.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE waypoints
                 (lat text, long text, magvar text, name text, type text, navaidname text, navaidstate text, navaidcountry text, freqtype text, freq text, freqname text)''')

tree = ET.parse("file0TZYyc.gpx")
ns = {'d': "http://www.topografix.com/GPX/1/1"}
navaid = {"n": "http://navaid.com/GPX/NAVAID/1/0"}
root = tree.getroot()

for wpt in root:
    lat = wpt.get("lat")
    long = wpt.get("lon")
    magvar = wpt.find("d:magvar", ns).text
    name = wpt.find("d:name", ns).text
    type = wpt.find("d:type", ns).text
    extensions = wpt.find("d:extensions", ns)
    navaidname = extensions.find("n:name", navaid).text
    navaidstate = extensions.find("n:state", navaid).text
    navaidcountry = extensions.find("n:country", navaid).text
    freqtype =

    print("Latitude: " + lat)
    print("Longitude: " + long)
    print("Magnetic Variation: " + magvar)
    print("Name: " + name)
    print("Type: " + type)
    print("Navaid Name: " + navaidname)
