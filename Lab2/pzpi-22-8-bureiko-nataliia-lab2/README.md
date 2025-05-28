# REST API Специфікація

## Загальна інформація
- Base URL: `http://localhost:3000`
- Формат даних: JSON
- Автентифікація: JWT Token (потрібно передавати в заголовку `Authorization`)
- Обробка помилок: Стандартні HTTP коди стану
- Підтримка мов: Багатомовність через i18next

## 1. Продукти (Products)

### 1.1. Отримати всі продукти
```
GET /products
Authorization: Bearer {token}

Response 200:
[
  {
    "_id": string,
    "name": string,
    "description": string,
    "ingredients": string,
    "manufacturer": string,
    "price": number,
    "imageId": string
  }
]

Response 404: "Products not found"
```

### 1.2. Отримати продукт за ID
```
GET /products/:id
Authorization: Bearer {token}

Response 200:
{
  "_id": string,
  "name": string,
  "description": string,
  "ingredients": string,
  "manufacturer": string,
  "price": number,
  "imageId": string
}

Response 404: "Product not found"
```

### 1.3. Створити новий продукт
```
POST /products
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": string,
  "description": string,
  "ingredients": string,
  "manufacturer": string,
  "price": number,
  "imageId": string
}

Response 201:
{
  "acknowledged": boolean,
  "insertedId": string
}
```

### 1.4. Оновити продукт
```
PUT /products/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": string,
  "description": string,
  "ingredients": string,
  "manufacturer": string,
  "price": number,
  "imageId": string
}

Response 200:
{
  "acknowledged": boolean,
  "matchedCount": number,
  "modifiedCount": number
}

Response 404: "Product not found for update"
```

### 1.5. Видалити продукт
```
DELETE /products/:id
Authorization: Bearer {token}

Response 200:
{
  "acknowledged": boolean,
  "deletedCount": number
}

Response 404: "Product not found for deletion"
```

## 2. Опитування (Surveys)

### 2.1. Отримати всі опитування
```
GET /surveys
Authorization: Bearer {token}

Response 200:
[
  {
    "_id": string,
    "name": string,
    "description": string,
    "questions_amount": number,
    "actuality": string,
    "change_date": string (ISO date),
    "created_at": string (ISO date),
    "updated_at": string (ISO date),
    "admin": string (ObjectId),
    "questions": string[] (Array of ObjectIds)
  }
]

Response 404: "No surveys found"
```

### 2.2. Отримати опитування за ID
```
GET /surveys/:id
Authorization: Bearer {token}

Response 200:
{
  "_id": string,
  "name": string,
  "description": string,
  "questions_amount": number,
  "actuality": string,
  "change_date": string (ISO date),
  "created_at": string (ISO date),
  "updated_at": string (ISO date),
  "admin": string (ObjectId),
  "questions": string[] (Array of ObjectIds)
}

Response 404: "Survey not found"
```

### 2.3. Створити нове опитування
```
POST /surveys
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": string,
  "description": string,
  "questions_amount": number,
  "type": string,
  "change_date": string (ISO date),
  "admin": string (ObjectId),
  "questions": string[] (Array of ObjectIds)
}

Response 201:
{
  "acknowledged": boolean,
  "insertedId": string,
  "survey": {
    // Повний об'єкт опитування
  }
}
```

### 2.4. Оновити опитування
```
PUT /surveys/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": string,
  "description": string,
  "questions_amount": number,
  "type": string,
  "change_date": string (ISO date),
  "admin": string (ObjectId),
  "questions": string[] (Array of ObjectIds)
}

Response 200:
{
  "acknowledged": boolean,
  "matchedCount": number,
  "modifiedCount": number,
  "survey": {
    // Оновлений об'єкт опитування
  }
}

Response 404: "Survey not found for update"
```

### 2.5. Видалити опитування
```
DELETE /surveys/:id
Authorization: Bearer {token}

Response 200:
{
  "acknowledged": boolean,
  "deletedCount": number
}

Response 404: "Survey not found for deletion"
```
Робота з іншими колекціями, які не згадані тут, реалізована аналогічно до попередніх.

## 3. Головний продукт (Showcase)

### 3.1. Отримати ID головного продукту
```
GET /showcase
Authorization: Bearer {token}

Response 200:
{
  "showcaseProductId": string
}
```

### 3.2. Встановити головний продукт
```
POST /showcase
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "productId": string
}

Response 200:
{
  "message": string,
  "productId": string
}

Response 400: {"error": "Missing product ID"}
```

## 4. Статус опитувань

### 4.1. Отримати статус завершених опитувань
```
GET /completed-surveys

Response 200:
{
  // Статус опитувань
}
```

## Загальні особливості API:

### Коди відповідей:
- 200: Успішний запит
- 201: Успішне створення
- 400: Неправильний запит
- 401: Не авторизовано
- 404: Ресурс не знайдено
- 500: Внутрішня помилка сервера

### Заголовки:
```
Authorization: Bearer {token}
Content-Type: application/json
Accept-Language: uk|en (для багатомовності)
```

### Обробка помилок:
Всі ендпоінти повертають структуровані повідомлення про помилки:
```json
{
  "error": "Опис помилки"
}
```

### Пагінація:
Для ендпоінтів, що повертають списки, підтримується пагінація через query-параметри:
```
?page=1&limit=10
```

### Форматування дат:
- Всі дати передаються і повертаються в ISO 8601 форматі
- Підтримується автоматичне форматування дат через middleware
- Поля з датами: `change_date`, `created_at`, `updated_at`

### Безпека:
- Всі ендпоінти (крім отримання статусу опитувань) вимагають JWT автентифікацію
- Токен передається в заголовку `Authorization: Bearer {token}`
- Невалідний токен призводить до помилки 401
