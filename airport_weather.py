import requests, json
airport = input("Airport: ").upper()
request = requests.get("http://avwx.rest/api/metar/%s?options=&format=json&onfail=cache" % (airport))
response = json.loads(request.content)

print(response)
print("Altimeter: " + str(response["altimeter"]["value"]))
print("Dewpoint: " + str(response["dewpoint"]["value"]) + "° C")
print("Windspeed: " + str(response["wind_speed"]["value"]) + "kts")
print("Wind Direction: " + str(response["wind_direction"]["value"]) + "°")
print("Flight Rules: " + response["flight_rules"])