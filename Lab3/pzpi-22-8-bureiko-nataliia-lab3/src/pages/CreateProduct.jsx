import { useState, useRef } from "react"
import { createProduct } from "../services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

export function CreateProduct() {
    const navigate = useNavigate()
    const { t } = useLanguage()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [ingredients, setIngredients] = useState("")
    const [manufacture, setManufacture] = useState("")
    const [price, setPrice] = useState("")
    const [file, setFile] = useState()

    const MAX_FILE_SIZE = 15000000

    const inputFile = useRef(null)

    const formatPrice = (value) => {
        if (!value) return "";
        
        const numValue = parseFloat(value);
        return numValue.toFixed(2);
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        if (value === "" || !isNaN(value)) {
            setPrice(value);
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        let submitObject = {
            name: name,
            description: description,
            ingredients: ingredients,
            manufacturer: manufacture,
            price: parseFloat(price).toFixed(2),
            file: file
        };

        try {
            await createProduct(submitObject);
            alert(t('productCreated'));
            navigate("/catalog");
        } catch (error) {
            console.error("Error creating product:", error);
            alert(t('productCreateError'));
        }
    }

    function handleFileUpload(e) {
        const file = e.target.files[0]
        const fileExtention = file.name.substring(file.name.lastIndexOf("."))
        if (fileExtention != ".jpg" && fileExtention != ".png" && fileExtention != ".jpeg") {
            alert("Files must be jpg, jpeg or png")
            inputFile.current.value = ""
            inputFile.current.type = "file"
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            alert("File size exceeds the limit (15 Mb)")
            inputFile.current.value = ""
            inputFile.current.type = "file"
            return
        }

        setFile(file)
    }

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">{t('createNewProduct')}</h1>

                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6">
                            <div>
                                <Label className="text-sm font-semibold block mb-2" htmlFor="name">
                                    {t('productName')}
                                </Label>
                                <Input
                                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    name="name"
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    required
                    name="description"
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
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    maxLength={300}
                    name="ingredients"
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
                    value={manufacture}
                    onChange={(e) => setManufacture(e.target.value)}
                    maxLength={100}
                    name="manufacturer"
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
                    value={price}
                                        onChange={handlePriceChange}
                                        onBlur={() => setPrice(formatPrice(price))}
                    min={0}
                    step="0.01"
                    name="price"
                                        className="w-full text-sm pl-7"
                                        placeholder="0.00"
                />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₴</span>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-semibold block mb-2" htmlFor="file">
                                    {t('productImage')}
                                </Label>
                                <Input
                                    id="file"
                    type="file"
                    onChange={handleFileUpload}
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

                        <div className="flex justify-end space-x-4 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/catalog")}
                                className="px-6"
                            >
                                {t('cancel')}
                            </Button>
                            <Button type="submit" className="px-6">
                                {t('createProduct')}
                            </Button>
                        </div>
        </form>
                </Card>
            </div>
        </div>
    );
}