export interface Book {
    name:string,
    description : string,
    cover: string,
    price: number,
    stock:number,
    id:string,
}

export interface BooksResponse {
    results: Book[],
    page: number,
    limit: number,
    totalPages: number,
    totalResults: number
}