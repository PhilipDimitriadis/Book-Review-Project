import {useState} from "react";
import {SearchIcon} from "lucide-react";
import {searchBooks} from "../services/api.ts";
import BookCover from "../components/BookCover.tsx";

interface Book {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    isbn?: string[];
    cover_i?: number;
    [key: string]: any;
}

const Home = () => {
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [books, setBooks] = useState<Book[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!search.trim()) return;
        if (loading) return;

        setLoading(true);
        setHasSearched(true);

        try {
            const searchResults = await searchBooks(search);
            console.log("Search results:", searchResults); // Debug log

            // Ensure searchResults is an array
            if (Array.isArray(searchResults)) {
                setBooks(searchResults);
                setError(null);
            } else {
                console.error("Search results is not an array:", searchResults);
                setBooks([]);
                setError("Invalid response format from search.");
            }
        } catch (error: any) {
            console.log("Search error:", error);
            setError("Failed to search books.");
            setBooks([]); // Clear books on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="h-115 flex items-center justify-center">
                <form onSubmit={handleSearch} className="w-full max-w-4xl px-4 flex items-center justify-center">
                    <input
                        type="text"
                        placeholder="Search for a book..."
                        className="px-4 py-3 text-base border-2 border-black rounded-full flex-none w-124 sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] mr-2 focus:outline-none focus:ring-2"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading || !search.trim()}
                        className="px-6 py-3 text-base w-20 text-gray-500 border-none rounded-full cursor-pointer duration-300 hover:bg-gray-600 disabled:bg-gray-900 disabled:cursor-not-allowed"
                    >
                        <SearchIcon className="h-5 text-white" />
                    </button>
                </form>
            </div>

            {error && (
                <div className="flex justify-center">
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                </div>
            )}

            <div className="px-4 max-w-6xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book: Book) => {
                            // Add safety check for book.id
                            if (!book || !book.id) {
                                console.warn("Invalid book object:", book);
                                return null;
                            }

                            // Temporary fallback while BookCover is empty
                            return (
                                <div key={book.id} className="border rounded-lg p-4 shadow-sm">
                                    <h3 className="font-semibold text-lg mb-2">
                                        {book.title || "Unknown Title"}
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        {book.author || "Unknown Author"}
                                    </p>
                                    {book.thumbnail && (
                                        <img
                                            src={book.thumbnail}
                                            alt={book.title || "Book cover"}
                                            className="w-full h-48 object-cover rounded"
                                        />
                                    )}
                                    <p className="text-sm text-gray-500 mt-2">
                                        {book.publishedDate || "Unknown Date"}
                                    </p>
                                </div>
                            );

                            // Uncomment this when your BookCover component is ready:
                            // return <BookCover key={book.id} book={book} />;
                        })}

                        {!loading && hasSearched && books.length === 0 && (
                            <p className="text-gray-500 text-center col-span-full py-8">
                                No results found
                            </p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;