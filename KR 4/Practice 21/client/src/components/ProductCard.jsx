import "./ProductCard.css";

function ProductCard({ product, onClick }) {


    return (
        <div className="productCard" onClick={onClick}>
            <p>{product.id}</p>
            <p>{product.title} - {product.price}</p>
        </div>
    );
}

export default ProductCard;