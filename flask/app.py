from project import app

app_port = 5000

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=app_port)
