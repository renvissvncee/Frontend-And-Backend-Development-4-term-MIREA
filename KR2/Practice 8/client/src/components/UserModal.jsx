import { useState } from "react";
import "./UserModal.css";

function UserModal({ onClose, onSubmit, initialData }) {
    const [email, setEmail] = useState(initialData?.email ?? "");
    const [firstName, setFirstName] = useState(initialData?.first_name ?? "");
    const [lastName, setLastName] = useState(initialData?.last_name ?? "");
    const [role, setRole] = useState(initialData?.role ?? "user");

    function handleSubmit(e) {
        e.preventDefault();

        const updatedData = {
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: role
        };

        onSubmit(updatedData);
    }

    return (
        <>
            <div className="modal-overlay-user" onClick={onClose}></div>

            <div className="modal-container-user">
                <form className="modal-form-user" onSubmit={handleSubmit}>
                    <input
                        className="modal-input-user"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="modal-input-user"
                        placeholder="Имя"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <input
                        className="modal-input-user"
                        placeholder="Фамилия"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />

                    <select
                        className="modal-input-user"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="user">user</option>
                        <option value="seller">seller</option>
                        <option value="admin">admin</option>
                    </select>

                    <button className="modal-button-user" type="submit">
                        Подтвердить
                    </button>

                    <button
                        className="modal-button-user cancel"
                        type="button"
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                </form>
            </div>
        </>
    );
}

export default UserModal;