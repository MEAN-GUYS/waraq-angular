export interface Review {
    id: string;
    user: string;
    book: string;
    rating: number;
    comment?: string;
}

export interface ReviewsResponse {
    results: Review[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
