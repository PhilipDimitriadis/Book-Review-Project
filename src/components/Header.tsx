import {Link} from "react-router";
import {AuthButton} from "./AuthButton";

const Header = () => {

    return (
        <header className="bg-gray-900 p-4">
            <div className="container mx-auto flex items-center justify-between">

                <div className="text-white text-xl font-bold">
                    <Link to="/" className="">
                        Book Review
                    </Link>
                </div>

                <div className="text-white text-m font-bold">
                    <Link
                        to="/reviews"
                        className=""
                    >
                        My Reviews
                    </Link>
                    <AuthButton/>
                </div>

            </div>
        </header>
    )
}

export default Header;