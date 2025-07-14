import {useState} from "react";
import {SearchIcon} from "lucide-react";

const Home= () => {
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    // const [books, setBooks] = useState([]);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if(!search.trim()) {
            setError("Please enter a valid search");
            return;
        }
        setLoading(true);

        try {
            // const searchResults = await searchBooks(search)
            // setBooks(searchResults)
            setError(null)
        } catch (error) {
            console.log(error)
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Error loading the book...");
            }
        } finally{
            setLoading(false)
        }

        setSearch("")
    };

    return (
        <>
            <div className="content-center text-center">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search for a book..."
                        className=" px-4 py-3 text-base border-gray-50 rounded-full w-64 mr-3 outline-none focus:outline-none focus:ring-2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        onClick={() => setSearch("")}
                        type="submit"
                        disabled={loading || !search.trim()}
                        className="px-6 py-3 text-base bg-red-400 text-white border-none rounded-full cursor-pointer transition-colors duration-300 hover:bg-red-500 disabled:bg-gray-900"
                    >
                        <SearchIcon className="w-5 h-5 text-white" />
                    </button>
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                </form>

                <div>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))} */}
                            {/* Placeholder for empty state */}
                            {!loading && (
                                <p className="text-gray-500 text-center col-span-full">
                                    {search ? "No results found" : ""}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Home;