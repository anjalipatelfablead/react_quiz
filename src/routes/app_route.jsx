// routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserRoutes from "./user_route";
import QuizRoutes from "./quiz_route";

const AppRoutes = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <Routes>
            {UserRoutes({ user })}
            {QuizRoutes()}

            {/* Default Route */}
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
    );
};

export default AppRoutes;