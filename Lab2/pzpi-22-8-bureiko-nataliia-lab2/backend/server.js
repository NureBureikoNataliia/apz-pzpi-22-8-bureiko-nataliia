const connect = require("./connect");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer();
const { getShowcaseProduct, setShowcaseProduct } = require("./showcaseProduct");
const verifyToken = require("./authMiddleware");
const { getSurveyCompleted } = require("./surveyState");
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const path = require('path');

// Підключення до всіх маршрутів
const products = require("./routes/productRoutes");
const employees = require("./routes/employeeRoutes");
const surveys = require("./routes/surveyRoutes");
const questions = require("./routes/questionRoutes");
const answers = require("./routes/answerRoutes");
const categories = require("./routes/categoryRoutes");
const priorities = require("./routes/priorityRoutes");
const awsRoutes = require("./routes/awsRoutes");
const clients = require("./routes/clientRoutes")
const resultRoutes = require("./routes/resultRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();
const PORT = 3000;

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "uk"],
    backend: {
      loadPath: path.join(__dirname, "/locales/{{lng}}/translation.json"),
    },
  });

// Використання middleware
app.use(middleware.handle(i18next));
app.use(cors());
app.use(express.json());
app.use(upload.any());

// Маршрути для всіх колекцій
app.use(products);
app.use(employees);
app.use(surveys);
app.use(questions);
app.use(answers);
app.use(categories);
app.use(priorities);
app.use(awsRoutes);
app.use(clients);
app.use(resultRoutes);
app.use(statsRoutes);

//Отримати статус опитування
app.get("/completed-surveys", (req, res) => {
  const status = getSurveyCompleted();
  res.json(status); 
});

// Отримати поточний ID головного продукту
app.get("/showcase", (req, res) => {
  res.json({ showcaseProductId: getShowcaseProduct() });
});

// Встановити новий головний продукт
app.post("/showcase", verifyToken, (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: req.t("missingProductId") });
  }

  setShowcaseProduct(productId);
  res.json({ message: req.t("showcaseUpdated"), productId });
});


app.listen(PORT, () => {
  connect.connectToServer();
  console.log("Server is running");
});
