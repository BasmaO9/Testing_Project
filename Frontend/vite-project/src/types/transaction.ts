export interface Category {
    _id: string;
    category: string;
    category_img: string;
  }
  
  export interface Transaction {
    _id: string;
    type: 'income' | 'expense';
    category: Category;
    amount: number;
    date: string;
    description?: string;
    userId: string;
  }
  
  export interface TransactionFilters {
    date?: string;
    category?: string;
  }
  
  