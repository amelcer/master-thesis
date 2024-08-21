from flask import Flask, request, jsonify
import csv

app = Flask(__name__)

@app.route('/people', methods=['GET'])
def get_people():
    from_line = request.args.get('from', default=0, type=int)
    to_line = request.args.get('to', default=None, type=int)

    if to_line is None or to_line < from_line:
        to_line = float('inf') 

    people = []
    file_path = '/data/data.csv'

    try:
        with open(file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            headers = reader.fieldnames

            for line_number, row in enumerate(reader, start=1):
                if line_number < from_line:  
                    continue
                if line_number > to_line:
                    break

                person = {
                    'id': row[headers[0]],
                    'name': row[headers[1]],
                    'lastName': row[headers[2]],
                    'birthday': row[headers[3]],
                    'email': row[headers[4]],
                }
                people.append(person)

        people.sort(key=lambda p: p['lastName'])

        return jsonify({
            'count': 500000,
            'data': people
        })

    except Exception as e:
        return str(e), 500
