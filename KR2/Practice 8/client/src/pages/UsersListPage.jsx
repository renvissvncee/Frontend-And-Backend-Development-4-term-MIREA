import { useState } from "react"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/apiClient";

import UserCard from "../components/UserCard";
import "./UsersListPage.css";

function UsersListPage() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    async function getUsers() {
        try {
            const response = await api.get("/api/users");
            setUsers(response.data);
            console.log(response.data);
        } catch (error) {
            alert(error.response.data.error)
        }
    }
    async function refreshUsers() {
        await getUsers(); 
    }

    async function handleDelete(id) {
        try {
            const response = await api.delete(`/api/users/${id}`);
            refreshUsers();
        } catch (error) {
            if (error.response) {
                // Ошибка от сервера
                console.log(error.response.data.error);
            } else {
                // Сетевая ошибка или ошибка запроса
                console.log('Ошибка запроса:', error.message);
            }
        }
    }


    useEffect(() => {
        getUsers();
    }, []);

    return (
        <>
            <div className="UsersList">
                {users?.map(user => (
                    <div key={user.id} className="userCard">
                        <UserCard 
                            user={user} 
                            onClick={() => navigate(`/admin-panel/users/${user.id}`)}
                        />
                        <button className="blockButton" type="button" onClick={() => handleDelete(user.id)}>
                            Заблокировать пользователя
                        </button>
                    </div>
                ))}
            </div>
        </>
    )
}

export default UsersListPage