const BookCover = ({book}: any) => {
    return (
        <>
            <div className="border rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                <p className="text-gray-600">by {book.author_name?.[0] || 'Unknown Author'}</p>
                <p className="text-sm text-gray-500 mt-2">
                    Published: {book.first_publish_year || 'Unknown'}
                </p>
            </div>
        </>
    )
}

export default BookCover;