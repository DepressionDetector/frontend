import { Routes, Route } from "react-router-dom";
import Chatbox from "../Pages/Chatbox.tsx";

const Routerset = () => {

    return (
        <Routes>
            <Route path="/" element={<Chatbox />} />
        </Routes>
    );
};

export default Routerset;
