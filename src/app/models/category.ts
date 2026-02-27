export interface Category {
    id: string;
    name: string;
}

export interface CategoriesResponse {
    results: Category[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
