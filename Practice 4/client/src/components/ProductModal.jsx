import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        if (!open) return;
        setTitle(initialProduct?.title ?? "");
        setPrice(initialProduct?.price != null ? String(initialProduct.price) : "");
        setPrice(initialProduct?.category ?? "");
        setPrice(initialProduct?.description ?? "");
        setPrice(initialProduct?.amount != null ? String(initialProduct.amount) : "");
    }, [open, initialProduct]);

    if (!open) return null;

    const heading = mode === "edit" ? "Редактирование товара" : "Создание товара";

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        const parsedPrice = Number(price);
        const trimmedCategory = category.trim();
        const trimmedDescription = description.trim();
        const parsedAmount = Number(amount);

        if (!trimmedTitle) {
            alert("Введите название");
            return;
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            alert("Введите корректную цену (больше 0)");
            return;
        }

        if (!trimmedCategory) {
            alert("Введите категорию");
            return;
        }

        if (!trimmedDescription) {
            alert("Введите описание товара");
            return;
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            alert("Введите корректное количество товаров (больше 0)");
            return;
        }

        onSubmit({
            id: initialProduct?.id,
            title: trimmedTitle,
            price: parsedPrice,
            category: trimmedCategory,
            description: trimmedDescription,
            amount: parsedAmount
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div 
                className="modal" 
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog" 
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__heading">{heading}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название
                        <input
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Например, Пистолет"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        Цена
                        <input
                            className="input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Например, 1000"
                            inputMode="numeric"
                        />
                    </label>

                    <label className="label">
                        Категория
                        <input
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Например, нижнее белье"
                            inputMode="numeric"
                        />
                    </label>

                    <label className="label">
                        Описание товара
                        <input
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Например, удобный"
                            inputMode="numeric"
                        />
                    </label>

                    <label className="label">
                        Количество на складе
                        <input
                            className="input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Например, 300"
                            inputMode="numeric"
                        />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}