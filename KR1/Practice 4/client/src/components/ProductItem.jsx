import React from "react";
export default function ProductItem({ product, onEdit, onDelete }) {
    return (
        <div className="productRow">
            <div className="productMain">
                <div className="productId">#{product.id}</div>
                <div className="productName">{product.title}</div>
                <div className="productAge">{product.price} рублей</div>
            </div>
            <div className="productActions">
                <button className="btn" onClick={() => onEdit(product)}>
                    Редактировать
                </button>
                <button className="btn btn--danger" onClick={() =>
                onDelete(product.id)}>
                    Удалить
                </button>
            </div>
        </div>
    );
}
