import csv
import random
from pprint import pprint
from socket import *

import requests


def import_date():
    with open('data.csv') as csv_file:
        reader = csv.reader(csv_file, delimiter=',')
        flag = 0
        for row in reader:
            if flag > 0:
                body = {
                    'lat': get_random_lat(),
                    'lng': get_random_lng(),
                    'title': row[1],
                    'description': 'No Description',
                    'incident': resolver_incident_type(row[1]),
                    'date': get_random_date()  # """%sT%s:00.000Z""" % (row[2], row[3])
                }
                headers = {
                    'Authorization': 'Basic U2FmZUNpdHk6U2FmZUNpdHk=',
                    'Content-Type': 'application/json',
                    'Connection': 'close'}
                response = requests.post('http://localhost:8081/save-incident',
                                         json=body,
                                         headers=headers)
                pprint(flag)

                response.close()
            flag += 1


def get_random_lat():
    if random.randint(0, 1) == 0:
        return chihuahua_location[0] - (random.randint(1, 100) / 1000)
    else:
        return chihuahua_location[0] + (random.randint(1, 100) / 1000)


def get_random_lng():
    if random.randint(0, 1) == 0:
        return chihuahua_location[1] - (random.randint(1, 100) / 1000)
    else:
        return chihuahua_location[1] + (random.randint(1, 100) / 1000)


def get_random_date():
    string_date = '%s-%s-%sT%s:00'
    year = random.randint(2015, 2017)
    month = random.randint(1, 12)
    day = random.randint(1, 30)
    hour = random.randint(1, 24)
    return string_date % (str(year),
                          str(month) if month > 9 else '0%s' % month,
                          str(day) if day > 9 else '0%s' % day,
                          str(hour) if hour > 9 else '0%s' % hour)


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


chihuahua_location = [28.640033, -106.073761]

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

s = socket(AF_INET, SOCK_STREAM)
s.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)

import_date()
