import { useParams } from "react-router-dom";
import BookDetailPage from "./BookDetailsPage.jsx.tsx";

const BookDetailPageWrapper = () => {
    const { bookKey } = useParams<{ bookKey: string }>();

    if (!bookKey) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Book not found</p>
            </div>
        );
    }

    // Reconstruct the full book key path
    const fullBookKey = `/works/${bookKey}`;

    return <BookDetailPage bookKey={fullBookKey} />;
};

export default BookDetailPageWrapper;