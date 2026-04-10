import { useState } from "react";
import api from "../api/apiClient";
import "./CreateProductModal.css";

function CreateProductModal({ onClose, onSubmit, initialData, mode }) {

    const [ title, setTitle ] = useState(initialData?.title ?? '');
    const [ category, setCategory ] = useState(initialData?.category ?? '');
    const [ description, setDescription ] = useState(initialData?.description ?? '');
    const [ price, setPrice ] = useState(initialData?.price ?? 0);


    const handleSubmit = (e) => {
            e.preventDefault();
            const updatedData = {
                title: title,      
                category: category,
                description: description,
                price: price
            };
            onSubmit(updatedData);
        }
        
    if (mode === "update") {
    }
    return(
        <>
            <div className="modal-overlay-custom" onClick={onClose}></div>
            <div className="modal-container-custom">
                <form className="modal-form-custom" onSubmit={handleSubmit}>
                    <input className="modal-input-custom" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input className="modal-input-custom" placeholder="Категория" value={category} onChange={(e) => setCategory(e.target.value)} />
                    <input className="modal-input-custom" placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <input className="modal-input-custom" placeholder="Цена" value={price} onChange={(e) => setPrice(e.target.value)} />
                    <button className="modal-button-custom" type="submit">Подтвердить</button>
                    <button className="modal-button-custom" type="button" onClick={onClose}>Отмена</button>
                </form>
            </div>
        </>
    )
}

export default CreateProductModal;