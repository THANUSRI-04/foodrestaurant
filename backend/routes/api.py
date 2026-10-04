import json
import os
from datetime import datetime
from flask import Blueprint, jsonify, request
try:
    from backend.services.firebase_service import firebase_service
except ImportError:
    from services.firebase_service import firebase_service

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint required by specifications"""
    return jsonify({
        "status": "ok",
        "service": "Food in Forest API",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0"
    }), 200

@api_bp.route('/hotel', methods=['GET'])
def get_hotel_info():
    """Fetch hotel profile from Firebase"""
    hotels = firebase_service.get('hotels')
    if hotels:
        # Return first hotel or default
        hotel_data = next(iter(hotels.values())) if isinstance(hotels, dict) else hotels
        return jsonify({"success": True, "data": hotel_data}), 200
    return jsonify({"success": False, "message": "Hotel information not found"}), 404

@api_bp.route('/categories', methods=['GET'])
def get_categories():
    """Fetch all active categories"""
    categories = firebase_service.get('categories') or {}
    active_cats = [cat for cat in categories.values() if cat.get('active', True)]
    return jsonify({"success": True, "count": len(active_cats), "data": active_cats}), 200

@api_bp.route('/foods', methods=['GET'])
def get_foods():
    """Fetch foods with optional filtering"""
    category = request.args.get('category')
    veg_only = request.args.get('veg')
    featured = request.args.get('featured')
    
    foods = firebase_service.get('foods') or {}
    items = list(foods.values()) if isinstance(foods, dict) else []
    
    if category:
        items = [f for f in items if f.get('categoryId') == category or f.get('categorySlug') == category]
    if veg_only is not None:
        is_veg = veg_only.lower() in ('true', '1')
        items = [f for f in items if f.get('veg') == is_veg]
    if featured is not None:
        is_featured = featured.lower() in ('true', '1')
        items = [f for f in items if f.get('featured') == is_featured]
        
    return jsonify({"success": True, "count": len(items), "data": items}), 200

@api_bp.route('/offers/validate', methods=['POST'])
def validate_promo_code():
    """Validate customer promo code and calculate discount amount"""
    body = request.get_json() or {}
    promo_code = (body.get('code') or '').strip().upper()
    subtotal = float(body.get('subtotal', 0))
    
    if not promo_code:
        return jsonify({"valid": False, "message": "Please provide a promo code"}), 400
        
    offers = firebase_service.get('offers') or {}
    matched_offer = None
    
    for offer in offers.values():
        if offer.get('promoCode', '').upper() == promo_code and offer.get('active', True):
            matched_offer = offer
            break
            
    if not matched_offer:
        return jsonify({"valid": False, "message": "Invalid or expired promo code"}), 404
        
    min_amount = float(matched_offer.get('minOrderAmount', 0))
    if subtotal < min_amount:
        return jsonify({
            "valid": False, 
            "message": f"This code requires a minimum order of ₹{min_amount}"
        }), 400
        
    discount_pct = float(matched_offer.get('discountPercentage', 0))
    discount_amount = round((subtotal * discount_pct) / 100, 2)
    
    return jsonify({
        "valid": True,
        "promoCode": promo_code,
        "title": matched_offer.get('title'),
        "discountPercentage": discount_pct,
        "discountAmount": discount_amount,
        "message": f"Promo code applied: {discount_pct}% OFF!"
    }), 200

@api_bp.route('/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Compute dashboard analytics for orders, revenue, and foods"""
    orders = firebase_service.get('orders') or {}
    foods = firebase_service.get('foods') or {}
    users = firebase_service.get('users') or {}
    
    order_list = list(orders.values()) if isinstance(orders, dict) else []
    food_list = list(foods.values()) if isinstance(foods, dict) else []
    user_list = list(users.values()) if isinstance(users, dict) else []
    
    total_orders = len(order_list)
    pending_orders = sum(1 for o in order_list if o.get('orderStatus') in ['Pending', 'Confirmed', 'Preparing'])
    completed_orders = sum(1 for o in order_list if o.get('orderStatus') == 'Delivered')
    cancelled_orders = sum(1 for o in order_list if o.get('orderStatus') == 'Cancelled')
    
    total_revenue = sum(float(o.get('total', 0)) for o in order_list if o.get('orderStatus') != 'Cancelled')
    
    total_foods = len(food_list)
    active_foods = sum(1 for f in food_list if f.get('available', True))
    
    # Filter customers with role == 'user'
    total_customers = sum(1 for u in user_list if u.get('role', 'user') == 'user')
    
    return jsonify({
        "success": True,
        "analytics": {
            "totalOrders": total_orders,
            "pendingOrders": pending_orders,
            "completedOrders": completed_orders,
            "cancelledOrders": cancelled_orders,
            "totalRevenue": round(total_revenue, 2),
            "totalFoods": total_foods,
            "activeFoods": active_foods,
            "totalCustomers": total_customers
        }
    }), 200

@api_bp.route('/seed', methods=['POST'])
def seed_database():
    """Seed the database from seed-data.json"""
    seed_file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'firebase', 'seed-data.json')
    if not os.path.exists(seed_file_path):
        return jsonify({"success": False, "message": "seed-data.json not found"}), 404
        
    try:
        with open(seed_file_path, 'r', encoding='utf-8') as f:
            seed_data = json.load(f)
            
        success = True
        for key, val in seed_data.items():
            ok = firebase_service.set(key, val)
            if not ok:
                success = False
                
        if success:
            return jsonify({"success": True, "message": "Database seeded successfully with Food in Forest data!"}), 200
        else:
            return jsonify({"success": False, "message": "Some nodes could not be seeded. Check Firebase permissions."}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
