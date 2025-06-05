import { getProduct, updateProduct, deleteProduct } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useLanguage } from "../context/LanguageContext";

export function EditProduct() {
    const [productImage, setProductImage] = useState(null);
    const [product, setProduct] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const { t } = useLanguage();

    let params = useParams();
    let id = params.id;
    let navigate = useNavigate();
    const MAX_FILE_SIZE = 15000000;
    const inputFile = useRef(null);

    useEffect(() => {
        async function loadProduct() {
            let data = await getProduct(id);
            // Format price when loading product
            if (data.price) {
                data.price = parseFloat(data.price).toFixed(2);
            }
            setProduct(data);
        }
        loadProduct();
    }, [id]);

    const formatPrice = (value) => {
        if (!value) return "";
        const numValue = parseFloat(value);
        return numValue.toFixed(2);
    };

    async function handleDelete() {
        const confirmDelete = window.confirm(t('confirmDelete') + " product?");
        if (confirmDelete) {
            await deleteProduct(id);
            navigate("/catalog"); 
        }
    }

    async function handleSave(e) {
        e.preventDefault();
    
        let updatedProduct = {
            name: product.name,
            description: product.description,
            ingredients: product.ingredients,
            manufacturer: product.manufacturer, 
            price: parseFloat(product.price).toFixed(2), // Format price before sending
        };
    
        if (imageFile) {
            updatedProduct.file = imageFile; 
        }
    
        try {
            await updateProduct(id, updatedProduct); 
            alert(t('productUpdated'));
            navigate("/catalog");
        } catch (error) {
            console.error("Error updating product:", error);
            alert(t('productUpdateError'));
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        if (name === 'price') {
            // For price, allow only numbers or empty string
            if (value === "" || !isNaN(value)) {
                setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
            }
        } else {
        setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
        }
    }

    function handlePriceBlur() {
        setProduct((prevProduct) => ({
            ...prevProduct,
            price: formatPrice(prevProduct.price)
        }));
    }

    function handleImageChange(e) {
        const file = e.target.files[0];
        const fileExtention = file.name.substring(file.name.lastIndexOf("."));
        
        if (fileExtention !== ".jpg" && fileExtention !== ".png" && fileExtention !== ".jpeg") {
            alert("Files must be jpg, jpeg or png");
            inputFile.current.value = "";
            inputFile.current.type = "file";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert("File size exceeds the limit (15 Mb)");
            inputFile.current.value = "";
            inputFile.current.type = "file";
            return;
        }

        setImageFile(file); 

        const reader = new FileReader();
        reader.onload = () => {
            setProductImage(reader.result);
        };

        reader.readAsDataURL(file);     
    }

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">{t('editProduct')}</h1>

                <Card className="p-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid gap-6">
                            <div className="flex gap-6">
                                <div className="w-1/3">
                <img
                    src={productImage || product.image?.data}
                    alt={product.name}
                                        className="w-full h-auto rounded-lg shadow-md"
                                    />
                                    <div className="mt-4">
                                        <Label className="text-sm font-semibold block mb-2" htmlFor="file">
                                            {t('updateProductImage')}
                                        </Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            onChange={handleImageChange}
                                            ref={inputFile}
                                            name="file"
                                            className="w-full text-sm"
                                            accept="image/jpeg,image/png,image/jpg"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            {t('imageFormats')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                <div>
                                        <Label className="text-sm font-semibold block mb-2" htmlFor="name">
                                            {t('productName')}
                                        </Label>
                                        <Input
                                            id="name"
                        type="text"
                        name="name"
                        value={product.name || ""}
                        onChange={handleChange}
                                            className="w-full text-sm"
                                            placeholder={t('enterProductName')}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold block mb-2" htmlFor="description">
                                            {t('productDescription')}
                                        </Label>
                                        <Textarea
                                            id="description"
                        name="description"
                        value={product.description || ""}
                        onChange={handleChange}
                                            className="w-full text-sm min-h-[100px]"
                                            placeholder={t('enterProductDescription')}
                    />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold block mb-2" htmlFor="ingredients">
                                            {t('ingredients')}
                                        </Label>
                                        <Textarea
                                            id="ingredients"
                        name="ingredients"
                        value={product.ingredients || ""}
                        onChange={handleChange}
                                            className="w-full text-sm"
                                            placeholder={t('enterIngredients')}
                    />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold block mb-2" htmlFor="manufacturer">
                                            {t('manufacturer')}
                                        </Label>
                                        <Input
                                            id="manufacturer"
                        type="text"
                        name="manufacturer"
                        value={product.manufacturer || ""}
                        onChange={handleChange}
                                            className="w-full text-sm"
                                            placeholder={t('enterManufacturer')}
                    />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold block mb-2" htmlFor="price">
                                            {t('price')} (₴)
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="price"
                        type="number"
                        name="price"
                        value={product.price || ""}
                        onChange={handleChange}
                                                onBlur={handlePriceBlur}
                                                className="w-full text-sm pl-7"
                                                placeholder="0.00"
                                                min={0}
                                                step="0.01"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₴</span>
                                        </div>
                                    </div>
                                </div>
                </div>
            </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                className="px-6"
                            >
                                {t('deleteProduct')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/catalog")}
                                className="px-6"
                            >
                                {t('cancel')}
                            </Button>
                            <Button type="submit" className="px-6">
                                {t('saveChanges')}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
