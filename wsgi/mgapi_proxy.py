#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from urllib.parse import parse_qs
from urllib.request import urlopen

from http.client import responses

# import requests


def application(environ, start_response):
    params = parse_qs(environ['QUERY_STRING'])

    params_str = ''
    for key, value in params.items():
        if key != 'operation' and key != 'API_KEY':
            params_str += '&' + key + '=' + value[0]

    url = 'http://servizos.meteogalicia.es/apiv3/' + params['operation'][0] \
        + '?API_KEY=' + params['API_KEY'][0] \
        + params_str

    with urlopen(url) as response:
        output = response.read()
        code = response.getcode()
        status = str(code) + ' ' + responses[code]

    # response = requests.get(url)
    # output = response.content
    # code = response.status_code
    # status = str(code) + ' ' + responses[code]

    headers = [('Content-Type', 'application/json; charset=utf-8'),
               ('Content-Length', str(len(output)))]

    start_response(status, headers)

    return [output]
