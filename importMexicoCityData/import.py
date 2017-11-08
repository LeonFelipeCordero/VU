import csv
import json
import urllib.parse
import requests
from pprint import pprint
from urllib.request import Request, urlopen
from socket import *

incidents_type_in_data = ['VIOLACION',
                          'ROBO A NEGOCIO C.V.',
                          'ROBO A CASA HABITACION C.V.',
                          'HOMICIDIO DOLOSO',
                          'LESIONES POR ARMA DE FUEGO',
                          'ROBO DE VEHICULO AUTOMOTOR C.V.',
                          'ROBO A TRANSEUNTE S.V.',
                          'ROBO A REPARTIDOR C.V.',
                          'ROBO DE VEHICULO AUTOMOTOR S.V.',
                          'ROBO A CUENTAHABIENTE C.V.',
                          'ROBO A BORDO DE TAXI C.V.',
                          'ROBO A BORDO DE MICROBUS C.V.',
                          'ROBO A REPARTIDOR S.V.',
                          'ROBO A TRANSPORTISTA C.V.',
                          'ROBO A TRANSEUNTE C.V.',
                          'ROBO A BORDO DE METRO C.V.',
                          'ROBO A TRANSPORTISTA S.V.',
                          'ROBO A BORDO DE METRO S.V.',
                          'ROBO A BORDO DE MICROBUS S.V.']

incidents_type = ["Rape",
                  "Establishment Thievery",
                  "House Thievery",
                  "Murder",
                  "Shooting",
                  "Thievery"]


def resolver_incident_type(incident_in_data):
    if incident_in_data == incidents_type_in_data[0]:
        return incidents_type[0]
    elif incident_in_data == incidents_type_in_data[1]:
        return incidents_type[1]
    elif incident_in_data == incidents_type_in_data[2]:
        return incidents_type[2]
    elif incident_in_data == incidents_type_in_data[3]:
        return incidents_type[3]
    elif incident_in_data == incidents_type_in_data[4]:
        return incidents_type[4]
    else:
        return incidents_type[5]

s = socket(AF_INET, SOCK_STREAM)
s.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)

with open('data.csv') as csv_file:
    reader = csv.reader(csv_file, delimiter=',')
    flag = 0
    for row in reader:
        if flag > 0:
            body = {
                'lat': row[6],
                'lng': row[7],
                'title': row[1],
                'description': 'No Description',
                'incident': resolver_incident_type(row[1]),
                'date': """%sT%s:00.000Z""" % (row[2], row[3])
            }
            headers = {
                'Authorization': 'Basic U2FmZUNpdHk6U2FmZUNpdHk=',
                'Content-Type': 'application/json',
                'Connection': 'close'}
            response = requests.put('http://localhost:8081/save-incident',
                                    data=json.dumps(body),
                                    headers=headers)
            pprint(flag)

            response.close()
        flag += 1
