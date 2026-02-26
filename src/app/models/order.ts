export interface Order {
    id: string;
    customer: string;
    items: number;
    total: number;
    status: 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
    payment: 'PENDING' | 'SUCCESS' | 'FAILED';
    date: string;
}

export interface OrdersResponse {
    results: Order[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
