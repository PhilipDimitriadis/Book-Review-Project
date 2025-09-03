import { useState, useEffect } from "react";
import { ArrowLeft, Star, BookOpen, Calendar, Globe, ThumbsUp, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { reviewsAPI, statsAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth.ts";

interface BookDetail {
    key: string;
    title: string;
    authors: Array<{ name: string; key: string }>;
    description?: string | { value: string };
    covers?: number[];
    first_publish_date?: string;
    publishers?: string[];
    isbn_10?: string[];
    isbn_13?: string[];
    number_of_pages?: number;
    languages?: Array<{ key: string }>;
    [key: string]: any;
}

interface Review {
    id: number;
    book_id: string;
    book_title: string;
    book_author: string;
    user_id: number;
    username: string;
    rating: number;
    review_text: string;
    created_at: string;
    updated_at: string;
}

interface BookStats {
    review_count: number;
    average_rating: number;
    five_stars: number;
    four_stars: number;
    three_stars: number;
    two_stars: number;
    one_stars: number;
}

interface CurrentUser {
    id: number;
    username: string;
    email: string;
}

interface BookDetailPageProps {
    bookKey: string;
}

const hashBookId = (bookKey) => {
    let hash = 0;
    if (bookKey.length === 0) return hash;
    for (let i = 0; i < bookKey.length; i++) {
        const char = bookKey.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
};

const BookDetailPage = ({ bookKey }: BookDetailPageProps) => {
    const navigate = useNavigate();
    const [book, setBook] = useState<BookDetail | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [bookStats, setBookStats] = useState<BookStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState("");
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [userHasReviewed, setUserHasReviewed] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [backendAvailable, setBackendAvailable] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    const { isAuthenticated, accessToken } = useAuth();

    useEffect(() => {
        fetchBookDetails();
        checkBackendAndFetchReviews();

        if (isAuthenticated && accessToken) {
            // Mock user - replace with actual API call
            setCurrentUser({
                id: 1,
                username: "demo_user",
                email: "demo@example.com"
            });
        } else {
            setCurrentUser(null);
        }
    }, [bookKey, isAuthenticated, accessToken]);

    const fetchBookDetails = async () => {
        try {
            const response = await fetch(`https://openlibrary.org${bookKey}.json`);
            if (!response.ok) throw new Error("Failed to fetch book details");
            const data = await response.json();
            setBook(data);
        } catch (err) {
            setError("Failed to load book details");
            console.error(err);
        }
    };

    const checkBackendAndFetchReviews = async () => {
        try {
            // Check if your backend is running
            const healthResponse = await fetch('http://localhost:5000/api/health');
            if (healthResponse.ok) {
                setBackendAvailable(true);
                await fetchReviewsFromDatabase();
            } else {
                console.log("Backend not available, using mock reviews");
                setBackendAvailable(false);
                setMockReviews();
            }
        } catch (err) {
            console.log("Backend not available, using mock reviews");
            setBackendAvailable(false);
            setMockReviews();
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewsFromDatabase = async () => {
        try {
            const bookId = hashBookId(bookKey);

            const [reviewsData, statsData] = await Promise.all([
                reviewsAPI.getByBookId(bookId),
                statsAPI.getBookStats(bookId)
            ]);

            setReviews(reviewsData);
            setBookStats(statsData);

            // Check if current user has already reviewed this book
            if (currentUser && isAuthenticated) {
                const userReviewExists = reviewsData.some(
                    (review: Review) => review.user_id === currentUser.id
                );
                setUserHasReviewed(userReviewExists);
            }

        } catch (err) {
            console.error("Failed to fetch reviews from database:", err);
            setMockReviews();
        }
    };

    const setMockReviews = () => {
        const mockReviews: Review[] = [
            {
                id: 1,
                book_id: bookKey,
                book_title: book?.title || 'Unknown',
                book_author: book?.authors?.[0]?.name || 'Unknown',
                user_id: 2,
                username: "Sarah Johnson",
                rating: 5,
                review_text: "Absolutely captivating! One of the best books I've read this year.",
                created_at: "2024-01-15T00:00:00Z",
                updated_at: "2024-01-15T00:00:00Z"
            },
            {
                id: 2,
                book_id: bookKey,
                book_title: book?.title || 'Unknown',
                book_author: book?.authors?.[0]?.name || 'Unknown',
                user_id: 3,
                username: "Mike Chen",
                rating: 4,
                review_text: "Great read overall. Would recommend!",
                created_at: "2024-01-10T00:00:00Z",
                updated_at: "2024-01-10T00:00:00Z"
            }
        ];

        setReviews(mockReviews);
        setBookStats({
            review_count: 2,
            average_rating: 4.5,
            five_stars: 1,
            four_stars: 1,
            three_stars: 0,
            two_stars: 0,
            one_stars: 0
        });
    };

    const submitReview = async () => {
        if (!isAuthenticated || !currentUser) {
            alert("Please log in to submit a review");
            return;
        }

        if (userRating === 0 || userReview.trim() === "") {
            alert("Please provide both a rating and review comment");
            return;
        }

        setSubmittingReview(true);

        try {
            if (backendAvailable) {
                const reviewData = {
                    book_id: hashBookId(bookKey),
                    book_title: book?.title || 'Unknown Title',
                    book_author: book?.authors?.[0]?.name || 'Unknown Author',
                    user_id: currentUser.id,
                    rating: userRating,
                    review_text: userReview.trim()
                };

                console.log('About to send review data:', JSON.stringify(reviewData, null, 2));

                const response = await fetch('http://localhost:5000/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(reviewData)
                });

                if (response.ok) {
                    await fetchReviewsFromDatabase();
                    alert("Review submitted successfully!");
                } else {
                    const error = await response.json();
                    alert(`Failed to submit review: ${error.error || 'Unknown error'}`);
                }
            } else {
                // Mock submission
                const newReview: Review = {
                    id: Date.now(),
                    book_id: bookKey,
                    user_id: currentUser.id,
                    username: currentUser.username,
                    rating: userRating,
                    review_text: userReview,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    book_title: book?.title || '',
                    book_author: book?.authors?.[0]?.name || ''
                };

                setReviews([newReview, ...reviews]);
                alert("Review submitted! (Demo mode)");
            }

            setUserRating(0);
            setUserReview("");
            setIsWritingReview(false);
            setUserHasReviewed(true);

        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const getBookDescription = () => {
        if (!book?.description) return "No description available.";
        if (typeof book.description === "string") return book.description;
        return book.description.value || "No description available.";
    };

    const getCoverUrl = () => {
        if (book?.covers && book.covers.length > 0) {
            return `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`;
        }
        return null;
    };

    const getAverageRating = () => {
        if (backendAvailable && bookStats) {
            // Check if average_rating exists and is a valid number
            const avgRating = bookStats.average_rating;
            if (avgRating !== null && avgRating !== undefined && typeof avgRating === 'number') {
                return avgRating.toFixed(1);
            }
        }
        if (reviews.length === 0) return "0.0";
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const getTotalReviews = () => {
        return backendAvailable ? (bookStats?.review_count || 0) : reviews.length;
    };

    const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-5 w-5 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
                        onClick={interactive && onRate ? () => onRate(star) : undefined}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || "Book not found"}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/*/!* Backend Status *!/*/}
            {/*<div className={`text-center py-2 text-sm ${backendAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>*/}
            {/*    {backendAvailable ? '✅ Connected to your database' : '⚠️ Demo mode - database not connected'}*/}
            {/*</div>*/}

            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to search
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0">
                                    {getCoverUrl() ? (
                                        <img
                                            src={getCoverUrl()!}
                                            alt={book.title}
                                            className="w-48 h-64 object-cover rounded-lg shadow-md mx-auto md:mx-0"
                                        />
                                    ) : (
                                        <div className="w-48 h-64 bg-gray-200 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                                            <BookOpen className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>

                                    {book.authors && book.authors.length > 0 && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-lg text-gray-600">
                                                {book.authors.map(author => author.name).join(', ')}
                                            </span>
                                        </div>
                                    )}

                                    {book.first_publish_date && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">First published: {book.first_publish_date}</span>
                                        </div>
                                    )}

                                    {book.number_of_pages && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <BookOpen className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">{book.number_of_pages} pages</span>
                                        </div>
                                    )}

                                    {book.publishers && book.publishers.length > 0 && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <Globe className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">Published by: {book.publishers[0]}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            {renderStars(Math.round(parseFloat(getAverageRating())))}
                                            <span className="text-lg font-semibold">{getAverageRating()}</span>
                                            <span className="text-gray-600">({getTotalReviews()} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-4">Description</h2>
                                <p className="text-gray-700 leading-relaxed">{getBookDescription()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-4">Reviews</h2>

                            {!isAuthenticated ? (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-700 text-sm">Please log in to write a review</p>
                                </div>
                            ) : !userHasReviewed && !isWritingReview ? (
                                <button
                                    onClick={() => setIsWritingReview(true)}
                                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors mb-6 flex items-center justify-center gap-2"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    Write a Review
                                </button>
                            ) : userHasReviewed ? (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-700 text-sm">✓ You have reviewed this book</p>
                                </div>
                            ) : (
                                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-semibold mb-3">Write Your Review</h3>
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium mb-2">Your Rating:</label>
                                        {renderStars(userRating, true, setUserRating)}
                                    </div>
                                    <textarea
                                        value={userReview}
                                        onChange={(e) => setUserReview(e.target.value)}
                                        placeholder="Share your thoughts about this book..."
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                                        rows={4}
                                    />
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={submitReview}
                                            disabled={submittingReview}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:bg-gray-400"
                                        >
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsWritingReview(false);
                                                setUserRating(0);
                                                setUserReview("");
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500 text-center">No reviews yet. Be the first to review!</p>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-sm">{review.username}</span>
                                                <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                                            </div>
                                            <div className="mb-2">
                                                {renderStars(review.rating)}
                                            </div>
                                            <p className="text-gray-700 text-sm mb-2">{review.review_text}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <button className="text-blue-600 hover:underline flex items-center gap-1">
                                                    <ThumbsUp className="h-3 w-3" />
                                                    Helpful
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;