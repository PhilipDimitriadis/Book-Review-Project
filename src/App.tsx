import './css/App.css'
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout.tsx";
import {Route, Routes} from "react-router-dom";
import BookDetailWrapper from "./pages/BookDetailWrapper.tsx";
import LoginPage from "./pages/LoginPage.tsx";

function App() {

  return (
    <>
        <Layout>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/book/:bookKey" element={<BookDetailWrapper/>}/>
                <Route path="login" element={<LoginPage/>} />

            </Routes>
        </Layout>
    </>
  )
}

export default App;
