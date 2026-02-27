export interface OrderItem {
  id: string;
  title: string;
  author: string;
  cover: string;
  price: number;
  quantity: number;
  rating?: number;
  review?: string;
  liked?: boolean | null;
}

export interface Order {
  id: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingNumber: string;
  estimatedDelivery: string;
  total: number;
  items: OrderItem[];
}