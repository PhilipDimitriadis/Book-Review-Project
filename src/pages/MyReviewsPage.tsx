import { useState, useEffect } from "react";
import { Star, BookOpen, Calendar, Edit3, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

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

const MyReviewsPage = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser, accessToken } = useAuth();

    useEffect(() => {
        if (currentUser) {
            fetchUserReviews();
        }
    }, [currentUser]);

    const fetchUserReviews = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/reviews/user/${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            } else {
                throw new Error('Failed to fetch reviews');
            }
        } catch (err) {
            console.error('Error fetching user reviews:', err);
            setError('Failed to load your reviews');
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                setReviews(reviews.filter(review => review.id !== reviewId));
            } else {
                throw new Error('Failed to delete review');
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Failed to delete review. Please try again.');
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
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

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to view your reviews</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
                    <p className="text-gray-600 mt-2">
                        Welcome back, {currentUser.username}! Here are all your book reviews.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {reviews.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h2>
                        <p className="text-gray-600 mb-6">
                            You haven't written any book reviews yet. Start exploring and sharing your thoughts!
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Browse Books
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">
                                    Your Reviews ({reviews.length})
                                </h2>
                                <div className="text-sm text-gray-500">
                                    Average rating: {
                                    (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                                } stars
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {review.book_title}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                by {review.book_author}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <button
                                                onClick={() => alert('Edit functionality coming soon!')}
                                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="Edit review"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteReview(review.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete review"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        {renderStars(review.rating)}
                                        <span className="text-sm font-medium">{review.rating}/5</span>
                                    </div>

                                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                                        {review.review_text}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>Reviewed {formatDate(review.created_at)}</span>
                                        </div>
                                        {review.updated_at !== review.created_at && (
                                            <span>Edited {formatDate(review.updated_at)}</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => window.location.href = `/book${review.book_id}`}
                                        className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        View Book Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReviewsPage;