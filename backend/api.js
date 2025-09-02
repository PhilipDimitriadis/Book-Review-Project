const LOCAL_API_URL = process.env.REACT_APP_LOCAL_API_URL || 'http://localhost:5000/api';
const EXTERNAL_API_URL = process.env.REACT_APP_EXTERNAL_API_URL || 'https://openlibrary.org';

const apiRequest = async (url, options = {}) => {
    const config = {
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

export const booksAPI = {
    getAll: () => apiRequest(`${EXTERNAL_API_URL}/books`),

    getById: (id) => apiRequest(`${EXTERNAL_API_URL}/books/${id}`),

    search: (query) => apiRequest(`${EXTERNAL_API_URL}/search?q=${encodeURIComponent(query)}`),

    getWithReviews: async (bookId) => {
        try {
            const book = await apiRequest(`${EXTERNAL_API_URL}/books/${bookId}`);

            const [reviews, stats] = await Promise.all([
                apiRequest(`${LOCAL_API_URL}/reviews/book/${bookId}`),
                apiRequest(`${LOCAL_API_URL}/books/${bookId}/stats`)
            ]);

            return {
                ...book,
                reviews,
                stats
            };
        } catch (error) {
            console.error('Error fetching book with reviews:', error);
            throw error;
        }
    }
};

export const usersAPI = {
    getAll: () => apiRequest(`${LOCAL_API_URL}/users`),

    getById: (id) => apiRequest(`${LOCAL_API_URL}/users/${id}`),

    register: (userData) => apiRequest(`${LOCAL_API_URL}/users`, {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    login: (credentials) => apiRequest(`${LOCAL_API_URL}/users/login`, {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),

    update: (id, userData) => apiRequest(`${LOCAL_API_URL}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    }),

    delete: (id) => apiRequest(`${LOCAL_API_URL}/users/${id}`, {
        method: 'DELETE',
    }),
};

export const reviewsAPI = {
    getAll: () => apiRequest(`${LOCAL_API_URL}/reviews`),

    getByBookId: (bookId) => apiRequest(`${LOCAL_API_URL}/reviews/book/${bookId}`),

    getByUserId: (userId) => apiRequest(`${LOCAL_API_URL}/reviews/user/${userId}`),

    create: (reviewData) => apiRequest(`${LOCAL_API_URL}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
    }),

    update: (id, reviewData) => apiRequest(`${LOCAL_API_URL}/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reviewData),
    }),

    delete: (id) => apiRequest(`${LOCAL_API_URL}/reviews/${id}`, {
        method: 'DELETE',
    }),
};

export const statsAPI = {
    getBookStats: (bookId) => apiRequest(`${LOCAL_API_URL}/books/${bookId}/stats`),
};

export const favoritesAPI = {
    getUserFavorites: (userId) => apiRequest(`${LOCAL_API_URL}/favorites/${userId}`),

    add: (favoriteData) => apiRequest(`${LOCAL_API_URL}/favorites`, {
        method: 'POST',
        body: JSON.stringify(favoriteData),
    }),

    remove: (userId, bookId) => apiRequest(`${LOCAL_API_URL}/favorites/${userId}/${bookId}`, {
        method: 'DELETE',
    }),
};

export const healthCheck = () => apiRequest(`${LOCAL_API_URL}/health`);