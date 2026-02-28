export interface Author {
    id: string;
    name: string;
    bio?: string;
}

export interface TopAuthor {
    id: string;
    name: string;
    bio?: string;
    totalSold: number;
}

export interface AuthorsResponse {
    results: Author[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
