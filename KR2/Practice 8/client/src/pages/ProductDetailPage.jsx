import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";

import "./ProductDetailPage.css";

import api from "../api/apiClient";

import CreateProductModal from "../components/ProductModal";


function ProductDetailPage() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);

    async function fetchProduct() {
        try {
            const response = await api.get(`/api/products/${id}`);
            setProduct(response.data);
            console.log(response.data);
        } catch (error) {
            console.log(error.response.data.error);
        }
    }

    async function onSubmitUpdate(data) {
        try {
            const response = await api.put(`/api/products/${id}`, {
                title: data.title, category: data.category, description: data.description, price: data.price
            });
            setProduct(response.data);
            console.log(response.data);
            setModalIsOpen(false);
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
        fetchProduct();
    }, [id]);
    return (
        <>
            <div className="ProductDetailCard">
                {product && (
                    <div>
                        <p>Название: {product.title}</p>
                        <p>Категория: {product.category}</p>
                        <p>Описание: {product.description}</p>
                        <p>Цена: {product.price}</p>
                    </div>
                )}
            </div>
            <button type="button" onClick={() => setModalIsOpen(true)}>Редактировать</button>
            {modalIsOpen && <CreateProductModal 
                onClose={() => setModalIsOpen(false)} 
                onSubmit={onSubmitUpdate}
                initialData={{ 
                    title: product.title, 
                    category: product.category,
                    description: product.description,
                    price: product.price
                }}
            />}

        </>
    )
}
export default ProductDetailPage