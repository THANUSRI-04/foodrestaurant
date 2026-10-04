from flask import Blueprint, jsonify, request
from datetime import datetime
try:
    from backend.services.firebase_service import firebase_service
except ImportError:
    from services.firebase_service import firebase_service

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/calculate', methods=['POST'])
def calculate_order():
    """
    Validate item prices against database and compute trusted order totals on backend.
    """
    body = request.get_json() or {}
    items = body.get('items', [])
    promo_code = (body.get('promoCode') or '').strip().upper()
    
    if not items:
        return jsonify({"success": False, "message": "No items provided"}), 400
        
    db_foods = firebase_service.get('foods') or {}
    
    subtotal = 0.0
    verified_items = []
    
    for item in items:
        food_id = item.get('id')
        qty = int(item.get('quantity', 1))
        if qty <= 0:
            continue
            
        food_data = db_foods.get(food_id)
        if not food_data:
            # Fallback to submitted price if item exists in local cart
            price = float(item.get('price', 0))
            name = item.get('name', 'Unknown Item')
        else:
            price = float(food_data.get('price', 0))
            name = food_data.get('name')
            
        line_total = price * qty
        subtotal += line_total
        verified_items.append({
            "id": food_id,
            "name": name,
            "price": price,
            "quantity": qty,
            "lineTotal": line_total
        })
        
    # Calculate discount
    discount = 0.0
    discount_pct = 0
    if promo_code:
        offers = firebase_service.get('offers') or {}
        for offer in offers.values():
            if offer.get('promoCode', '').upper() == promo_code and offer.get('active', True):
                min_amt = float(offer.get('minOrderAmount', 0))
                if subtotal >= min_amt:
                    discount_pct = float(offer.get('discountPercentage', 0))
                    discount = round((subtotal * discount_pct) / 100, 2)
                break
                
    delivery_charge = 0.0 if subtotal >= 500 else 40.0
    total = round(subtotal - discount + delivery_charge, 2)
    
    return jsonify({
        "success": True,
        "calculation": {
            "items": verified_items,
            "subtotal": round(subtotal, 2),
            "discount": discount,
            "discountPercentage": discount_pct,
            "deliveryCharge": delivery_charge,
            "total": total
        }
    }), 200

@orders_bp.route('/<order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    """Update order status endpoint"""
    body = request.get_json() or {}
    new_status = body.get('status')
    
    allowed_statuses = [
        'Pending', 'Confirmed', 'Preparing', 
        'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'
    ]
    
    if new_status not in allowed_statuses:
        return jsonify({
            "success": False, 
            "message": f"Invalid status. Must be one of: {', '.join(allowed_statuses)}"
        }), 400
        
    ok = firebase_service.update(f'orders/{order_id}', {
        "orderStatus": new_status,
        "updatedAt": datetime.utcnow().isoformat() + "Z"
    })
    
    if ok:
        return jsonify({"success": True, "message": f"Order {order_id} updated to {new_status}"}), 200
    return jsonify({"success": False, "message": "Failed to update order"}), 500
