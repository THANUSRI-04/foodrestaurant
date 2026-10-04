import os
import sys

# Ensure project root and backend dir are in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    # Frontend directory path
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
    
    # Configure CORS for production (supports Vercel frontend and custom origins)
    allowed_origins_env = os.environ.get('ALLOWED_ORIGINS', '*').strip()
    if allowed_origins_env == '*' or not allowed_origins_env:
        CORS(app, resources={r"/api/*": {"origins": "*"}})
    else:
        allowed_origins = [orig.strip() for orig in allowed_origins_env.split(',') if orig.strip()]
        CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)
    
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'forest_wild_wood_secret_key_2026')
    
    # Register API Blueprints (support both root and backend invocation paths)
    try:
        from backend.routes.api import api_bp
        from backend.routes.orders import orders_bp
    except ImportError:
        from routes.api import api_bp
        from routes.orders import orders_bp
    
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    
    # Public frontend routes (serves static frontend if run as standalone server)
    @app.route('/')
    def serve_index():
        if os.path.exists(os.path.join(frontend_dir, 'index.html')):
            return send_from_directory(frontend_dir, 'index.html')
        return jsonify({"status": "ok", "service": "Food in Forest API", "version": "1.0.0"}), 200
        
    @app.route('/<path:filename>')
    def serve_frontend(filename):
        target_path = os.path.join(frontend_dir, filename)
        if os.path.exists(target_path) and not os.path.isdir(target_path):
            return send_from_directory(frontend_dir, filename)
        # Check if it corresponds to an HTML file without extension
        html_candidate = target_path + '.html'
        if os.path.exists(html_candidate):
            return send_from_directory(frontend_dir, filename + '.html')
        if os.path.exists(os.path.join(frontend_dir, 'index.html')):
            return send_from_directory(frontend_dir, 'index.html')
        return jsonify({"error": "Resource not found", "status": 404}), 404

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found", "status": 404}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error", "status": 500}), 500
        
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[Food in Forest] Backend server running on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)

