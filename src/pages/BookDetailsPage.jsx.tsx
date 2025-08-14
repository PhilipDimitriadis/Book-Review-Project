import { useState, useEffect } from "react";
import { ArrowLeft, Star, Heart, BookOpen, User, Calendar, Globe, ThumbsUp, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BookDetail {
    key: string;
    title: string;
    authors: Array<{ name: string; key: string }>;
    description?: string | { value: string };
    covers?: number[];
    first_publish_date?: string;
    subjects?: string[];
    publishers?: string[];
    isbn_10?: string[];
    isbn_13?: string[];
    number_of_pages?: number;
    languages?: Array<{ key: string }>;
    [key: string]: any;
}

interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    helpful: number;
}

interface BookDetailPageProps {
    bookKey: string; // This would come from router params
}

const BookDetailPage = ({ bookKey }: BookDetailPageProps) => {
    const navigate = useNavigate();
    const [book, setBook] = useState<BookDetail | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState("");
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [userHasReviewed, setUserHasReviewed] = useState(false);

    useEffect(() => {
        fetchBookDetails();
        fetchReviews();
    }, [bookKey]);

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

    const fetchReviews = async () => {
        try {
            // This would be your own API endpoint for reviews
            // For now, we'll use mock data
            const mockReviews: Review[] = [
                {
                    id: "1",
                    userId: "user1",
                    userName: "Sarah Johnson",
                    rating: 5,
                    comment: "Absolutely captivating! One of the best books I've read this year. The character development is exceptional.",
                    date: "2024-01-15",
                    helpful: 12
                },
                {
                    id: "2",
                    userId: "user2",
                    userName: "Mike Chen",
                    rating: 4,
                    comment: "Great read overall. The plot moves at a good pace, though some parts felt a bit slow. Would recommend!",
                    date: "2024-01-10",
                    helpful: 8
                },
                {
                    id: "3",
                    userId: "user3",
                    userName: "Emma Wilson",
                    rating: 5,
                    comment: "This book completely changed my perspective. Beautifully written with incredible depth.",
                    date: "2024-01-05",
                    helpful: 15
                }
            ];
            setReviews(mockReviews);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async () => {
        if (userRating === 0 || userReview.trim() === "") {
            alert("Please provide both a rating and review comment");
            return;
        }

        try {
            const newReview: Review = {
                id: Date.now().toString(),
                userId: "current_user", // This would come from your auth system
                userName: "You", // This would come from your auth system
                rating: userRating,
                comment: userReview,
                date: new Date().toISOString().split('T')[0],
                helpful: 0
            };

            // backend API
            // await submitReviewToAPI(bookKey, newReview);

            setReviews([newReview, ...reviews]);
            setUserRating(0);
            setUserReview("");
            setIsWritingReview(false);
            setUserHasReviewed(true);
        } catch (error) {
            alert("Failed to submit review. Please try again.");
        }
    };

    const markReviewHelpful = async (reviewId: string) => {
        try {
            // Here you would call your backend API
            // await markReviewHelpfulAPI(reviewId);

            setReviews(reviews.map(review =>
                review.id === reviewId
                    ? { ...review, helpful: review.helpful + 1 }
                    : review
            ));
        } catch (error) {
            console.error("Failed to mark review as helpful:", error);
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
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
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
                                            <User className="h-4 w-4 text-gray-500" />
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
                                            <span className="text-gray-600">({reviews.length} reviews)</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                            Add to Reading List
                                        </button>
                                        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                            <Heart className="h-4 w-4" />
                                            Favorite
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-4">Description</h2>
                                <p className="text-gray-700 leading-relaxed">{getBookDescription()}</p>
                            </div>

                            {book.subjects && book.subjects.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-3">Subjects</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {book.subjects.slice(0, 10).map((subject, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-4">Reviews</h2>

                            {!userHasReviewed && !isWritingReview ? (
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
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                        >
                                            Submit Review
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
                                                <span className="font-semibold text-sm">{review.userName}</span>
                                                <span className="text-xs text-gray-500">{review.date}</span>
                                            </div>
                                            <div className="mb-2">
                                                {renderStars(review.rating)}
                                            </div>
                                            <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>{review.helpful} found this helpful</span>
                                                <button
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                    onClick={() => markReviewHelpful(review.id)}
                                                >
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