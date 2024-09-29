from flask import Flask

app = Flask(__name__)

@app.route('/generate_report',methods=['POST'])
def generate_report():
    return 'Report generated'

if __name__ == '__main__':
    app.run(port=8000,debug=True)