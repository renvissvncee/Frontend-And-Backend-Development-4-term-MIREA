import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import "./UserDetailPage.css";

import api from "../api/apiClient";

import CreateUserModal from "../components/UserModal";

function UserDetailPage() {
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    async function fetchUser() {
        try {
            const response = await api.get(`/api/users/${id}`);
            setUser(response.data);
            console.log(response.data);
        } catch (error) {
            console.log(error.response?.data?.error);
        }
    }

    async function onSubmitUpdate(data) {
        try {
            const response = await api.put(`/api/users/${id}`, {
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                role: data.role
            });

            setUser(response.data);
            setModalIsOpen(false);
            console.log(response.data);

        } catch (error) {
            if (error.response) {
                console.log(error.response.data.error);
            } else {
                console.log("Ошибка запроса:", error.message);
            }
        }
    }

    useEffect(() => {
        fetchUser();
    }, [id]);

    return (
        <>
            <div className="UserDetailCard">
                {user && (
                    <div>
                        <p>ID: {user.id}</p>
                        <p>Email: {user.email}</p>
                        <p>Имя: {user.first_name}</p>
                        <p>Фамилия: {user.last_name}</p>
                        <p>Роль: {user.role}</p>
                    </div>
                )}
            </div>

            <button type="button" onClick={() => setModalIsOpen(true)}>
                Редактировать
            </button>

            {modalIsOpen && user && (
                <CreateUserModal
                    onClose={() => setModalIsOpen(false)}
                    onSubmit={onSubmitUpdate}
                    initialData={{
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        role: user.role
                    }}
                />
            )}
        </>
    );
}

export default UserDetailPage;