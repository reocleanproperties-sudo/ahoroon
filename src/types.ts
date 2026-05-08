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
  unit?: string;
  size?: number;
  moq?: number;
  step?: number;
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

export interface Order {
  id?: string;
  items: CartItem[];
  total: number;
  customerName: string;
  phoneNumber: string;
  address: string;
  paymentMethod: 'COD';
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  createdAt: any;
}

export interface AppUser {
  id: string;
  name?: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  createdAt: any;
}

export interface ManualInvoice {
  id: string;
  invoiceNo: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: {
    name: string;
    price: number;
    quantity: number;
    unit: string;
  }[];
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: any;
}
