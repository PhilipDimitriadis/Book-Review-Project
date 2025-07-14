import {Link} from "react-router";

const Header = () => {
    return (
        <>
            <header>
                <div>
                    <nav>
                        <Link to="/" className="bg-blacl text-white hover:undeline">Home</Link>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Header;
