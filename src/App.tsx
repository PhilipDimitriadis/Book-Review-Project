import './App.css'
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout.tsx";
import {Route, Routes} from "react-router-dom";

function App() {

  return (
    <>
        <Layout>
            <Routes>
                <Route path="/" element={<Home/>} />
            </Routes>
        </Layout>
    </>
  )
}

export default App;