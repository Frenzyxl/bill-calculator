from flask import Flask, request, jsonify
from flask_cors import CORS
from asteval import Interpreter

app = Flask(__name__)
CORS(app)
safe_eval = Interpreter()

@app.route('/calculate', methods=['POST'])
def calculate():
    print("Origin:", request.headers.get("Origin"))
    data = request.json
    formula = data.get("formula")
    variables = data.get("variables", {})

    safe_eval.symtable.clear()
    for var, val in variables.items():
        safe_eval.symtable[var] = val

    try:
        result = safe_eval.eval(formula)  # <-- this is the key fix
        print("Evaluated result:", result)
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
