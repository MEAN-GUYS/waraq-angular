export interface OrderItem {
  book: string;
  name: string;
  cover: string;
  price: number;
  quantity: number;
}

export interface OrderAddress {
  street: string;
  city: string;
  country: string;
}

export interface Order {
  id: string;
  user: string;
  items: OrderItem[];
  address: OrderAddress;
  shippingStatus: 'processing' | 'out for delivery' | 'delivered';
  paymentMethod: 'COD';
  paymentStatus: 'pending' | 'success';
  totalPrice: number;
  createdAt?: string;
}