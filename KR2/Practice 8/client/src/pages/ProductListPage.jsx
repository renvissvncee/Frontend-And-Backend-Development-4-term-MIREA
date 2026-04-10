import api from "../api/apiClient";

import { useState } from "react"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import CreateProductModal from "../components/ProductModal";
import "./ProductListPage.css";

function ProductListPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState(undefined);

    const [modalIsOpen, setModalIsOpen] = useState(false);


    async function getProducts() {
        try {
            const response = await api.get("/api/products");
            setProducts(response.data);
            console.log(response.data);
        } catch (error) {
            alert(error.response.data.error)
        }
    }
    async function refreshProducts() {
        await getProducts(); 
    }

    useEffect(() => {
        getProducts();
    }, []);

    async function onSubmitCreate(data) {
        try {
            const response = await api.post("/api/products", {
                title: data.title,
                category: data.category,
                description: data.description,
                price: data.price
            });
            refreshProducts();
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

    async function handleDelete(id) {
        try {
            const response = await api.delete(`/api/products/${id}`);
            refreshProducts();
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
    


    return (
        <div className="container">
            <h1 className="title">Товары</h1>
            <div className="productsList">
                {products?.map(product => (
                    <div key={product.id} className="productItem">
                        <ProductCard 
                            product={product} 
                            onClick={() => navigate(`/products/${product.id}`)}
                        />
                        <button className="deleteButton" type="button" onClick={() => handleDelete(product.id)}>
                            Удалить товар
                        </button>
                    </div>
                ))}
            </div>
            {products &&
                <button className="addButton" type="button" onClick={() => setModalIsOpen(true)}>
                    Добавить товар
                </button>
            }
            {modalIsOpen && <CreateProductModal 
                onClose={() => setModalIsOpen(false)} 
                onSubmit={onSubmitCreate}
                initialData={undefined}
            />}
        </div>
    )
}

export default ProductListPage