import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service.js";

export default function Register({ onSwitch }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateRegister() {
        return (emailPattern.test(email) && password === confirmPassword && password.length >= 8 && confirmPassword.length >= 8);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);

        try {
            await authService.register(email, password, confirmPassword);

            navigate("/login");
        } catch (err) {
            setError(err.error);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Register</h2>

                {
                    (error) && (
                        <div className="error-message">
                            { error }
                        </div>
                    )
                }

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={ email }
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={ password }
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="********"
                            value={ confirmPassword }
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={ !validateRegister() }>
                        Sign up
                    </button>
                </form>

                <div className="divider">Or</div>

                <button onClick={onSwitch} className="btn-secondary">
                    Sign in
                </button>
            </div>
        </div>
    );
}