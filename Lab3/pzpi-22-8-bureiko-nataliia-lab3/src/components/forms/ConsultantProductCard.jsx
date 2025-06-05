import { useState, useEffect } from "react";
import { getImage } from "../../services/api";

export function ConsultantProductCard({ product }) {
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
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <img
          src={productImage}
          alt={product.name}
          className="rounded-lg w-full md:w-48 h-auto object-cover"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-3">{product.description}</p>
          <div className="space-y-2">
            <p className="text-gray-700"><span className="font-medium">Ingredients:</span> {product.ingredients}</p>
            <p className="text-gray-700"><span className="font-medium">Manufacturer:</span> {product.manufacturer}</p>
            <p className="text-gray-700"><span className="font-medium">Price:</span> ${product.price}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 