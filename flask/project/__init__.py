#!/usr/bin/python3
# -*- coding: utf-8 -*-

from flask import Flask, jsonify, render_template, request, send_from_directory
import psycopg2
import psycopg2.extras
from flask_cors import CORS
import os

DB_NAME = 'mydatabase'
DB_USER = 'postgres'
DB_HOST = '192.168.1.89'
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

@app.route('/create_city', methods=['POST'])
def create_city():
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

@app.route('/read_city', methods=['GET'])
def read_city():
    search_query = request.args.get('query', '').lower()
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cursor.execute("SELECT id, city as name, country, population FROM cities WHERE LOWER(city) LIKE %s", ('%'+search_query+'%',))
            cities_list = cursor.fetchall()
            return jsonify([dict(city) for city in cities_list])
    except Exception as e:
        app.logger.error('Database error: %s', str(e))
        return jsonify(error=str(e)), 500
    
@app.route('/update_city', methods=['PATCH'])
def update_city():
    data = request.json
    city_id = data.get('id')
    if not city_id:
        return jsonify({"error": "City ID is required"}), 400
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE cities 
                SET city=%s, country=%s, population=%s 
                WHERE id=%s RETURNING *;
                """, (data['city'], data['country'], data['population'], city_id))
            updated_city = cursor.fetchone()
            conn.commit()
            if updated_city:
                return jsonify({
                    "id": updated_city['id'], 
                    "city": updated_city['city'], 
                    "country": updated_city['country'], 
                    "population": updated_city['population']
                }), 200            
            else:
                return jsonify({"error": "City not updated"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/delete_city', methods=['DELETE'])
def delete_city():
    city_id = request.args.get('id')
    if not city_id:
        return jsonify({"error": "City ID is required"}), 400
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cursor.execute("DELETE FROM cities WHERE id = %s RETURNING *;", (city_id,))
            deleted_city = cursor.fetchone()
            conn.commit()
            if deleted_city:
                return jsonify({
                    "id": deleted_city['id'], 
                    "city": deleted_city['city'], 
                    "country": deleted_city['country'], 
                    "population": deleted_city['population']
                }), 200
            else:
                return jsonify({"error": "City not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test')
def test():
    return 'test'