from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/people', methods=['GET'])
def get_people():
    from_line = request.args.get('from', default=0, type=int)
    to_line = request.args.get('to', default=None, type=int)

    if to_line is None or to_line < from_line:
        to_line = float('inf')

    try:
        people = get_people_in_range(from_line, to_line)
        people.sort(key=lambda p: p['lastName'])

        return jsonify({
            'count': 500000,
            'data': people
        })

    except Exception as e:
        return str(e), 500


def get_people_in_range(from_line, to_line):
    people = []
    file_path = '/data/data.csv'

    with open(file_path, newline='') as f:
        f.readline() # skip header
        line_number = 0

        while line := f.readline():
            line_number += 1

            if line_number < from_line:
                continue
            if line_number > to_line:
                break

            values = line.split(',')
            person = {
                'id': values[0],
                'name': values[1],
                'lastName': values[2],
                'birthday': values[3],
                'email': values[4],
            }

            people.append(person)
    
    return people

