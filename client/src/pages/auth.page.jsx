import "../assets/css/auth.css";
import { useState } from "react";
import Login from "../components/login.component.jsx";
import Register from "../components/register.component.jsx";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);

    const toggleComponent = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div>
            {
                isLogin ? (
                    <Login onSwitch={ toggleComponent } />
                ) : (
                    <Register onSwitch={ toggleComponent } />
                )
            }
        </div>
    );
};