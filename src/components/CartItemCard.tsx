import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  description?: string;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartItemCardProps {
  item: CartItem & { product: Product };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const { product, quantity, productId } = item;
  const subtotal = product.price * quantity;
  const isLowStock = product.stock < 5;
  const canIncrease = quantity < product.stock;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <p className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</p>
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  Low Stock
                </Badge>
              )}
            </div>
          </div>
          
          {/* Quantity controls */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateQuantity(productId, quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <div className="w-16 text-center">
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 0;
                  if (newQuantity > 0) {
                    onUpdateQuantity(productId, newQuantity);
                  }
                }}
                className="w-full text-center border rounded px-2 py-1 text-sm"
                min="1"
                max={product.stock}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {product.stock} available
              </p>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateQuantity(productId, quantity + 1)}
              disabled={!canIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Subtotal and remove button */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-right">
            <p className="font-semibold text-lg">₹{subtotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              ₹{product.price.toLocaleString()} × {quantity}
            </p>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(productId)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
}