import { useState } from "react"
import api from "../api/apiClient";
import { useNavigate } from "react-router-dom"

function RegisterPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");

    async function handleRegister(e) {
        e.preventDefault();
        try {
            const response = await api.post("/api/auth/register", {
                email: email,
                first_name: firstName,
                last_name: lastName,
                password: password
            });
            alert("Успешная регистрация!");
            navigate("/login");
        } catch (error) {
            console.log(error.response.data);
            alert(error.response.data.error);
        }
    }
    return (
        <>
            <form onSubmit={handleRegister}>
                <input placeholder="Введите почту" 
                    value={email} onChange={e => setEmail(e.target.value)}></input>
                <input placeholder="Введите имя" 
                    value={firstName} onChange={e => setFirstName(e.target.value)}></input>
                <input placeholder="Введите фамилию"
                    value={lastName} onChange={e => setLastName(e.target.value)}></input>
                <br></br>
                <br></br>
                <input placeholder="Введите пароль" type="password"
                    value={password} onChange={e => setPassword(e.target.value)}></input>
                <br></br>
                <br></br>
                <button type="submit" onClick={handleRegister}>Зарегистрироваться</button>
            </form>
        </>
    )
}
export default RegisterPage