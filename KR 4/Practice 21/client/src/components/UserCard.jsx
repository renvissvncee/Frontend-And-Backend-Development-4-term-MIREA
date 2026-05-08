import "./UserCard.css";

function UserCard({ user, onClick }) {


    return (
        <div className="userCard" onClick={onClick}>
            <p>{user.id}</p>
            <p>{user.email}</p>
            <p>{user.first_name}</p>
            <p>{user.last_name}</p>
            <p>{user.role}</p>
        </div>
    );
}

export default UserCard;