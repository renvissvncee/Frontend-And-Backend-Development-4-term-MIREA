import { useState } from "react"
import api from "../api/apiClient";
import { setTokens } from "../utils/tokenStorage";
import { useNavigate } from "react-router-dom"


function LoginPage() {
    const navigate = useNavigate()

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profile, setProfile] = useState(undefined);

    async function handleClick(e) {
        e.preventDefault();
        try {
            const response = await api.post("/api/auth/login", {
                login: login,
                password: password
            });
            setTokens(response.data.accessToken, response.data.refreshToken)
            setIsAuthenticated(true);
            console.log(response.data);
        } catch (err) {
            alert(err.response.data.error);
            setIsAuthenticated(false);
            setProfile(undefined);
        }
    }

    async function getProfile() {
        try {
            let accessToken = localStorage.getItem("accessToken");
            const response = await api.get("/api/auth/me");
            setProfile(response.data);
        } catch (err) {
            console.log(err.response.data);
        }
    }

    return (
        <>
            <div>
                <form onSubmit={handleClick}>
                    <input placeholder="Введите логин" value={login}
                        onChange={e => setLogin(e.target.value)}
                    ></input>
                    <input placeholder="Введите пароль" value={password}
                        onChange={e => setPassword(e.target.value)}
                    ></input>
                    <button type="submit">Нажмите</button>
                </form>
            </div>
            {isAuthenticated && (
                <div>
                    <div>
                        <button type="button" onClick={getProfile}>Получить профиль</button>
                    </div>
                    {profile && (
                        <div>
                            <p>ID: {profile.id}</p>
                            <p>Email: {profile.email}</p>
                            <p>Имя: {profile.first_name}</p>
                            <p>Фамилия: {profile.last_name}</p>
                        </div>
                    )}
                    <div>
                        <br></br>
                        <button type="button" onClick={() => navigate("/products")}>Перейти к товарам</button>
                    </div>
                </div>
            )}
        </>
    )
}
export default LoginPage