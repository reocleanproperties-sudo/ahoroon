export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
  isFlashSale?: boolean;
  discount?: number;
  images: string[];
  unit?: 'gm' | 'kg' | 'ml' | 'l' | 'pcs';
  size?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem extends Product {
  cartQuantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
