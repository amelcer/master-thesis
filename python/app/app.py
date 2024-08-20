from flask import Flask, request, jsonify
import csv

app = Flask(__name__)

@app.route('/people', methods=['GET'])
def get_people():
    from_line = request.args.get('from', default=0, type=int)
    to_line = request.args.get('to', type=int)

    if to_line is None:
        to_line = float('inf')  # Ustawia to_line na bardzo dużą liczbę, aby uwzględnić wszystkie linie do końca pliku

    if from_line > to_line:
        return jsonify({'message': "'from' value should be lower than 'to' value"}), 400

    people = []
    with open('/data/data.csv', 'r') as file:
        reader = csv.DictReader(file)
        for line_num, row in enumerate(reader):
            if line_num < from_line:
                continue
            if line_num > to_line:
                break
            people.append(row)
    
    people.sort(key=lambda x: x['lastName'])

    return jsonify({'count': 500000, 'data': people})

