#!/usr/bin/python3
# -*- coding: utf-8 -*-

from flask import Flask, jsonify, send_from_directory, request
import os
import psycopg2
from flask_cors import CORS

# FLASK (static):5000
#
# app = Flask(__name__, static_folder='static')
# CORS(app)
#
# @app.route('/')
# def index():
#     return app.send_static_file('index.html')

app = Flask(__name__)
CORS(app)

@app.route('/')
def root():
    return send_from_directory('/var/www/html', 'index.html')

@app.route('/styles.css')
def styles():
    return send_from_directory('/var/www/html', 'styles.css')

@app.route('/script.js')
def script():
    return send_from_directory('/var/www/html', 'script.js')

@app.route('/img/<filename>')
def custom_static(filename):
    return send_from_directory('/var/www/html/img/', filename)

@app.route('/cities.json')
def cities():
    con = None
    try:
        con = psycopg2.connect(database='mydatabase', user='postgres', host='192.168.1.10', password='123456')
        cur = con.cursor()
        cur.execute("SELECT id, name, country, population FROM cities")
        rows = cur.fetchall()
        cities_list = [{"id": row[0], "name": row[1], "country": row[2], "population": row[3]} for row in rows]
        return jsonify(cities_list)
    except psycopg2.DatabaseError as e:
        app.logger.error('Database error: %s', e)
        return jsonify(error=str(e)), 500
    except Exception as e:
        app.logger.error('General error: %s', e)
        return jsonify(error=str(e)), 500
    finally:
        if con:
            con.close()

@app.route('/add_city', methods=['POST'])
def add_city():
    data = request.json
    con = None
    try:
        con = psycopg2.connect(database='mydatabase', user='postgres', host='192.168.1.10', password='123456')
        cur = con.cursor()
        # Assuming there is an auto-incrementing ID
        cur.execute("INSERT INTO cities (name, country, population) VALUES (%s, %s, %s) RETURNING id", (data['name'], data['country'], data['population']))
        new_id = cur.fetchone()[0]
        con.commit()
        return jsonify({"id": new_id, "name": data['name'], "country": data['country'], "population": data['population']}), 201
    except psycopg2.DatabaseError as e:
        app.logger.error('Database error: %s', e)
        con.rollback()
        return jsonify(error=str(e)), 500
    except Exception as e:
        app.logger.error('General error: %s', e)
        con.rollback()
        return jsonify(error=str(e)), 500
    finally:
        if con:
            con.close()

@app.route('/search_city', methods=['GET'])
def search_city():
    search_query = request.args.get('query', '').lower()
    con = None
    try:
        con = psycopg2.connect(database='mydatabase', user='postgres', password='123456', host='192.168.1.10')
        cur = con.cursor()
        cur.execute("SELECT id, name, country, population FROM cities WHERE LOWER(name) LIKE %s", ('%'+search_query+'%',))
        rows = cur.fetchall()
        cities_list = [{"id": row[0], "name": row[1], "country": row[2], "population": row[3]} for row in rows]
        return jsonify(cities_list)
    except psycopg2.DatabaseError as e:
        app.logger.error('Database error: %s', e)
        return jsonify(error=str(e)), 500
    finally:
        if con:
            con.close()


@app.route('/test')
def test():
    return 'test'

if __name__ == '__main__':
#   app.run(host='0.0.0.0')
    app.run(host='0.0.0.0', port=8000)  # Apache
