import { useContext, useState} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth.context.jsx";

export default function Login({ onSwitch }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            console.error(err);
            setError(err.error);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Login</h2>

                {
                    error && (
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

                    <button type="submit" className="btn-primary">
                        Sign in
                    </button>
                </form>

                <div className="divider">Or</div>

                <button onClick={onSwitch} className="btn-secondary">
                    Sign up
                </button>
            </div>
        </div>
    );
}