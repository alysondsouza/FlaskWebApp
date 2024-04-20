#!/usr/bin/python3
# -*- coding: utf-8 -*-

from flask import Flask, jsonify, send_from_directory, request
import psycopg2
from flask_cors import CORS

DB_NAME = 'mydatabase'
DB_USER = 'postgres'
DB_HOST = '192.168.1.10'
DB_PASSWORD = '123456'
FLASK_PORT = 5000

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
        con = psycopg2.connect(database=DB_NAME, user=DB_USER, host=DB_HOST, password=DB_PASSWORD)
        cur = con.cursor()
        cur.execute("SELECT id, city, country, population FROM cities")
        rows = cur.fetchall()
        cities_list = [{"id": row[0], "city": row[1], "country": row[2], "population": row[3]} for row in rows]
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
        con = psycopg2.connect(database=DB_NAME, user=DB_USER, host=DB_HOST, password=DB_PASSWORD)
        cur = con.cursor()
        cur.execute("INSERT INTO cities (city, country, population) VALUES (%s, %s, %s) RETURNING id", (data['city'], data['country'], data['population']))
        new_id = cur.fetchone()[0]
        con.commit()
        return jsonify({"id": new_id, "city": data['city'], "country": data['country'], "population": data['population']}), 201
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
        con = psycopg2.connect(database=DB_NAME, user=DB_USER, host=DB_HOST, password=DB_PASSWORD)
        cur = con.cursor()
        cur.execute("SELECT id, city, country, population FROM cities WHERE LOWER(city) LIKE %s", ('%'+search_query+'%',))
        rows = cur.fetchall()
        cities_list = [{"id": row[0], "city": row[1], "country": row[2], "population": row[3]} for row in rows]
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
    app.run(host='0.0.0.0', port=FLASK_PORT)
