import './css/App.css'
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout.tsx";
import {Route, Routes} from "react-router-dom";
import BookDetailWrapper from "./pages/BookDetailWrapper.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import {AuthProvider} from "./context/AuthProvider.tsx";
import MyReviewsPage from "./pages/MyReviewsPage.tsx";

function App() {

  return (
    <>
        <AuthProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/book/:bookKey" element={<BookDetailWrapper/>}/>
                    <Route path="login" element={<LoginPage/>} />
                    <Route path="/reviews" element={<MyReviewsPage/>} />

                </Routes>
            </Layout>
        </AuthProvider>
    </>
  )
}

export default App;
