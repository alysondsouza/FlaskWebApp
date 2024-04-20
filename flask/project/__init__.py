#!/usr/bin/python3
# -*- coding: utf-8 -*-

from flask import Flask, jsonify, render_template, request, send_from_directory
import psycopg2
import psycopg2.extras
from flask_cors import CORS
import os

DB_NAME = 'mydatabase'
DB_USER = 'postgres'
DB_HOST = '192.168.1.1'
DB_PASSWORD = '123456'

allowed_origins = [
    "https://example.com",
    "http://localhost:5000",  # For local development only
    "http://127.0.0.1:5000",  # For local development only
]

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": allowed_origins}})


def get_db_connection():
    conn = psycopg2.connect(database=DB_NAME, user=DB_USER, host=DB_HOST, password=DB_PASSWORD)
    return conn

@app.route('/img/<filename>')
def custom_static(filename):
    image_folder = os.path.join(app.static_folder, 'img')
    return send_from_directory(image_folder, filename)

@app.route('/')
def root():
    return render_template('index.html')

@app.route('/cities.json')
def cities():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cursor.execute("SELECT id, city, country, population FROM cities")
            cities_list = cursor.fetchall()
            return jsonify([dict(city) for city in cities_list])
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/add_city', methods=['POST'])
def add_city():
    data = request.json
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO cities (city, country, population) VALUES (%s, %s, %s) RETURNING id",
                           (data['city'], data['country'], data['population']))
            new_id = cursor.fetchone()[0]
            conn.commit()
            return jsonify({"id": new_id, "city": data['city'], "country": data['country'], "population": data['population']}), 201
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/search_city', methods=['GET'])
def search_city():
    search_query = request.args.get('query', '').lower()
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cursor.execute("SELECT id, city, country, population FROM cities WHERE LOWER(city) LIKE %s", ('%'+search_query+'%',))
            cities_list = cursor.fetchall()
            return jsonify([dict(city) for city in cities_list])
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/test')
def test():
    return 'test'