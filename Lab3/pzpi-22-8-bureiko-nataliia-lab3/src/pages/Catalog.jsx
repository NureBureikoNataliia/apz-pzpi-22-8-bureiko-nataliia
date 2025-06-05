import { getProducts } from "../services/api";
import { useState, useEffect } from "react";
import { ProductCard } from "../components/forms/ProductCard";
import { ConsultantProductCard } from "../components/forms/ConsultantProductCard";

export function Catalog() {
    const [products, setProducts] = useState([]);
    const isConsultant = sessionStorage.getItem("Consultant") !== null;

    useEffect(() => {
        async function loadAllProducts() {
            const data = await getProducts();
            setProducts(data);
        }

        loadAllProducts();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Catalog</h1>
            <div className="space-y-6 max-w-4xl mx-auto">
                {products.map((product) => (
                    <div className="max-w-md mx-auto">
                        {isConsultant ? (
                            <ConsultantProductCard key={product._id} product={product} />
                        ) : (
                            <ProductCard key={product._id} product={product} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}