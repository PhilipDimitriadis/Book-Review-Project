const BASE_URL = import.meta.env.VITE_API_BASE || 'https://openlibrary.org';

export const searchBooks = async (query: string) => {

    try {
        const response = await fetch(`${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=20`);

        if (!response.ok) {
            throw new Error("HTTP error!")
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}