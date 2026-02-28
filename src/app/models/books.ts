export interface Book {
    name:string,
    description : string,
    cover: string,
    price: number,
    stock:number,
    id:string,
    author?: any,
    category?: any
    averageRating?: number,
    reviewCount?: number
}

export interface BooksResponse {
    results: Book[],
    page: number,
    limit: number,
    totalPages: number,
    totalResults: number
}

export interface BooksParams {
    name?: string,
    minPrice?:number,
    maxPrice?:number,
    sortBy?:string, 
    limit?:number
    page?:number
}
