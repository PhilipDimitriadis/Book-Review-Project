import React from "react"
import Header from "./Header.tsx";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({children}:LayoutProps) => {
    return (
        <>
            <Header/>
            <div className="container mx-auto">
                {children}
            </div>

        </>
    )
}

export default Layout;
