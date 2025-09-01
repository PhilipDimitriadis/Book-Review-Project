import './css/App.css'
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout.tsx";
import {Route, Routes} from "react-router-dom";
import BookDetailWrapper from "./pages/BookDetailWrapper.tsx";

function App() {

  return (
    <>
        <Layout>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/book/:bookKey" element={<BookDetailWrapper/>}/>
            </Routes>
        </Layout>
    </>
  )
}

export default App;
