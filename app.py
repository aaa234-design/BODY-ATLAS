from flask import Flask, jsonify, render_template, request
import sqlite3
from pathlib import Path

app = Flask(__name__)
DB_PATH = Path(__file__).with_name("body_atlas.db")

ORGANS = [
 {"id":"heart","name":"Heart","system":"Circulatory","emoji":"❤️","location":"Chest, slightly left of center","function":"Pumps blood through the lungs and around the body, delivering oxygen and nutrients.","facts":["Has four chambers: two atria and two ventricles.","The sinoatrial node helps set the heartbeat.","Valves keep blood moving in one direction."],"weight":"About 250–350 g in an adult","quiz":"How many chambers does the human heart have?","options":["2","3","4","5"],"answer":2},
 {"id":"brain","name":"Brain","system":"Nervous","emoji":"🧠","location":"Inside the skull","function":"Coordinates thought, memory, emotions, movement, sensation and many automatic body functions.","facts":["The cerebrum is the largest major region.","The cerebellum helps coordinate balance and movement.","The brainstem controls vital functions such as breathing."],"weight":"About 1.3–1.4 kg in an adult","quiz":"Which region helps coordinate balance?","options":["Cerebellum","Stomach","Liver","Kidney"],"answer":0},
 {"id":"lungs","name":"Lungs","system":"Respiratory","emoji":"🫁","location":"Inside the chest, on either side of the heart","function":"Exchange gases: oxygen enters the blood and carbon dioxide leaves it.","facts":["The right lung has three lobes; the left has two.","Tiny air sacs called alveoli are the main gas-exchange sites.","The diaphragm helps draw air into the lungs."],"weight":"Varies with body size","quiz":"Where does most gas exchange occur?","options":["Bronchi","Alveoli","Trachea","Diaphragm"],"answer":1},
 {"id":"liver","name":"Liver","system":"Digestive","emoji":"🟤","location":"Upper right abdomen, below the diaphragm","function":"Processes nutrients, produces bile, stores energy and helps break down many substances.","facts":["It produces bile to help digest fats.","It stores glucose as glycogen.","It can regenerate a portion of its tissue after injury."],"weight":"About 1.4–1.8 kg in an adult","quiz":"What digestive fluid does the liver produce?","options":["Saliva","Insulin","Bile","Gastric acid"],"answer":2},
 {"id":"stomach","name":"Stomach","system":"Digestive","emoji":"🟠","location":"Upper left abdomen, below the diaphragm","function":"Stores food temporarily and mixes it with acid and enzymes to begin digestion.","facts":["Muscular walls churn food into a semi-liquid mixture.","Hydrochloric acid helps denature proteins and kill many microbes.","The stomach lining is protected by mucus."],"weight":"Not usually described by a fixed weight","quiz":"What is one main role of the stomach?","options":["Pump blood","Mix food with gastric juice","Filter urine","Exchange gases"],"answer":1},
 {"id":"kidneys","name":"Kidneys","system":"Urinary","emoji":"🫘","location":"Back of the upper abdomen, one on each side of the spine","function":"Filter blood, remove wastes into urine and help regulate fluid, salts and blood pressure.","facts":["Nephrons are the microscopic functional units.","Most people have two kidneys.","Kidneys help activate vitamin D."],"weight":"About 120–170 g each in many adults","quiz":"What is the functional unit of the kidney?","options":["Neuron","Alveolus","Nephron","Villus"],"answer":2},
 {"id":"intestines","name":"Small Intestine","system":"Digestive","emoji":"〰️","location":"Central and lower abdomen","function":"Completes much of digestion and absorbs most nutrients into the blood and lymph.","facts":["Its lining has folds, villi and microvilli to increase surface area.","It has three sections: duodenum, jejunum and ileum.","It is several metres long in adults."],"weight":"Varies; length is more commonly described","quiz":"Which structure increases nutrient-absorption surface area?","options":["Villi","Valves","Alveoli","Neurons"],"answer":0},
 {"id":"skin","name":"Skin","system":"Integumentary","emoji":"🖐️","location":"Covers the outside of the body","function":"Acts as a protective barrier, helps regulate temperature and contains sensory receptors.","facts":["It is the body's largest organ by surface area.","It has epidermis, dermis and underlying subcutaneous tissue.","Sweat helps cool the body."],"weight":"Varies widely with body size","quiz":"Which skin layer is the outermost?","options":["Dermis","Epidermis","Hypodermis","Muscle"],"answer":1}
]

def connect():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    with connect() as con:
        con.execute("""CREATE TABLE IF NOT EXISTS organs (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, system TEXT NOT NULL,
            location TEXT NOT NULL, function TEXT NOT NULL, facts TEXT NOT NULL
        )""")
        count = con.execute("SELECT COUNT(*) FROM organs").fetchone()[0]
        if count == 0:
            import json
            con.executemany("INSERT INTO organs VALUES (?,?,?,?,?,?)", [
                (o["id"],o["name"],o["system"],o["location"],o["function"],json.dumps(o["facts"]))
                for o in ORGANS
            ])

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/organs")
def get_organs():
    system = request.args.get("system", "All")
    q = request.args.get("q", "").strip().lower()
    data = ORGANS
    if system != "All":
        data = [o for o in data if o["system"] == system]
    if q:
        data = [o for o in data if q in " ".join([o["name"],o["system"],o["location"],o["function"]]).lower()]
    return jsonify(data)

@app.get("/api/organs/<organ_id>")
def get_organ(organ_id):
    organ = next((o for o in ORGANS if o["id"] == organ_id), None)
    if not organ:
        return jsonify({"error":"Organ not found"}), 404
    return jsonify(organ)

@app.get("/api/systems")
def get_systems():
    return jsonify(sorted(set(o["system"] for o in ORGANS)))

@app.get("/api/quiz")
def get_quiz():
    return jsonify([{"id":o["id"],"question":o["quiz"],"options":o["options"],"answer":o["answer"],"organ":o["name"]} for o in ORGANS])

@app.post("/api/quiz/check")
def check_quiz():
    payload = request.get_json(silent=True) or {}
    organ = next((o for o in ORGANS if o["id"] == payload.get("id")), None)
    if not organ:
        return jsonify({"error":"Unknown question"}), 404
    correct = payload.get("choice") == organ["answer"]
    return jsonify({"correct":correct,"correct_index":organ["answer"],"explanation":organ["function"]})

@app.get("/health")
def health():
    return jsonify({"status":"ok","app":"Body Atlas"})

init_db()

if __name__ == "__main__":
    app.run(debug=True)
