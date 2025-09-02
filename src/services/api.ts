const BASE_URL = import.meta.env.VITE_API_BASE || 'https://openlibrary.org';
const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000/api';

export const searchBooks = async (query: string) => {
    try {
        const response = await fetch(`${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=20`);

        if (!response.ok) {
            throw new Error("HTTP error!")
        }
        const data = await response.json();
        return data.docs || [];
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Generic API request function for local MySQL API
const apiRequest = async (url: string, options: RequestInit = {}) => {
    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Reviews API functions (for your MySQL database)
export const reviewsAPI = {
    // Get reviews for a specific book (using external book ID)
    getByBookId: (bookId: string) => apiRequest(`${LOCAL_API_URL}/reviews/book/${encodeURIComponent(bookId)}`),

    // Get reviews by user
    getByUserId: (userId: number) => apiRequest(`${LOCAL_API_URL}/reviews/user/${userId}`),

    // Create new review
    create: (reviewData: any) => apiRequest(`${LOCAL_API_URL}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
    }),

    // Update review
    update: (id: number, reviewData: any) => apiRequest(`${LOCAL_API_URL}/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reviewData),
    }),

    // Delete review
    delete: (id: number) => apiRequest(`${LOCAL_API_URL}/reviews/${id}`, {
        method: 'DELETE',
    }),
};

// Book Statistics API functions (for your MySQL database)
export const statsAPI = {
    // Get book statistics (rating, review count, etc.)
    getBookStats: (bookId: string) => apiRequest(`${LOCAL_API_URL}/books/${encodeURIComponent(bookId)}/stats`),
};

// Users API functions (for your MySQL database)
export const usersAPI = {
    // Get user by ID
    getById: (id: number) => apiRequest(`${LOCAL_API_URL}/users/${id}`),

    // Create new user (registration)
    create: (userData: any) => apiRequest(`${LOCAL_API_URL}/users`, {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    // User login
    login: (credentials: any) => apiRequest(`${LOCAL_API_URL}/users/login`, {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
};

// Health check for local server
export const healthCheck = () => apiRequest(`${LOCAL_API_URL}/health`);