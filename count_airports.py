import sqlite3
import xml.etree.ElementTree as ET


def count_airports():
    print("Migrating airports from gpx file to sqlite3 file...")
    count = 0
    for wpt in root:
        type = wpt.find("d:type", ns).text
        if type == "AIRPORT":
            count += 1
    return count

tree = ET.parse("file0TZYyc.gpx")
ns = {'d': "http://www.topografix.com/GPX/1/1"}
navaid = {"n": "http://navaid.com/GPX/NAVAID/1/0"}
root = tree.getroot()
airports = count_airports()
print(airports)