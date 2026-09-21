"""
Standards Sahayak — Root Server Launcher
Runs the production server located in 'new P for sih'.
"""
import os
import sys

base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "new P for sih")
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

os.chdir(base_dir)

from app import app, vector_store, CURATED_STANDARDS, KNOWLEDGE_GRAPH, API_KEY

if __name__ == "__main__":
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    port = int(os.environ.get("FLASK_PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1")

    print("\n" + "="*65)
    print(" Standards Sahayak — AI Standards Intelligence Engine Ready")
    print(f"   Indexed Standards  : {len(vector_store.standards_df):,}")
    print(f"   Curated Canonical  : {len(CURATED_STANDARDS)}")
    print(f"   Graph Edges        : {len(KNOWLEDGE_GRAPH.get('relationships', []))}")
    print(f"   Server running at  : http://localhost:{port}")
    print("="*65 + "\n")

    app.run(host=host, port=port, debug=debug)
