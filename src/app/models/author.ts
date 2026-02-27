export interface Author {
    id: string;
    name: string;
    description?: string;
}

export interface AuthorsResponse {
    results: Author[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
