from flask import Flask, render_template, request, jsonify
from scraper import get_episode_json

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/fetch-json", methods=["POST"])
def fetch_json():
    try:
        data = request.get_json(force=True)
        url = data.get("url")
        if not url:
            return jsonify({"error": "No URL provided"}), 400

        # Fetch the episode JSON using your scraper
        episode_json = get_episode_json(url)
        return jsonify(episode_json)

    except ValueError:
        return jsonify({"error": "Invalid JSON in request"}), 400
    except Exception as e:
        # Catch-all for other errors
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Use host 0.0.0.0 for local network access if needed
    app.run(debug=True, host="127.0.0.1", port=8000)