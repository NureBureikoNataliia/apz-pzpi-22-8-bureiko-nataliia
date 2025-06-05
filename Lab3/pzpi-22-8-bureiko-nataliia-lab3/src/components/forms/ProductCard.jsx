import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getImage } from "../../services/api";

export function ProductCard({ product }) {
  const [productImage, setProductImage] = useState(null);

  useEffect(() => {
    async function loadProductImage() {
      try {
        if (product.imageId) {
          const imageResponse = await getImage(product.imageId);
          setProductImage(imageResponse.data);
        }
      } catch (error) {
        console.error("Error loading product image:", error);
      }
    }

    loadProductImage();
  }, [product.imageId]);

  return (
    <Link to={`/editproduct/${product._id}`}>
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={productImage}
        alt={product.name}
        style={{
          borderRadius: "15px",
          width: "200px",
          height: "auto",
          marginRight: "20px",
        }}
      />
      <div>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>Ingredients: {product.ingredients}</p>
        <p>Manufacturer: {product.manufacturer}</p>
        <p>Price: ${product.price}</p>
      </div>
    </div>
    </Link>
  );
}
