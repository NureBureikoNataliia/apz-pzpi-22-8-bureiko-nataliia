import axios from "axios";

const URL = "http://localhost:3000";

// Products
export async function getProducts() {
  const response = await axios.get(`${URL}/products`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function getProduct(id) {
  const response = await axios.get(`${URL}/products/${id}`);

  const product = response.data;
  const data = await getImage(product.imageId);
  product.image = data;
  return product;
}

export async function createProduct(product) {
  const data = await createImage(product.file);

  console.log(product);
  const imageId = product.file.name;

  product.imageId = imageId;

  const response = await axios.post(`${URL}/products`, product);
  return response;
}

export async function updateProduct(id, product) {
  let updatedProduct = { ...product };

  if (product.file) {
    const imageId = await createImage(product.file);
    updatedProduct.imageId = imageId;
  } else {
    const existingProduct = await getProduct(id);
    updatedProduct.imageId = existingProduct.imageId;
  }

  delete updatedProduct.file;

  const response = await axios.put(`${URL}/products/${id}`, updatedProduct);
  return response;
}

export async function deleteProduct(id) {
  const response = await axios.delete(`${URL}/products/${id}`);
  return response;
}

// Employees (formerly Admins)
export async function getEmployees() {
    const response = await axios.get(`${URL}/employees`);
    if (response.status === 200) {
        return response.data;
    } else {
        return;
    }
}

export async function getEmployee(id) {
    const response = await axios.get(`${URL}/employees/${id}`);
    if (response.status === 200) {
        return response.data;
    } else {
        return;
    }
}

export async function updateEmployee(id, employee) {
    const response = await axios.put(`${URL}/employees/${id}`, employee);
    return response;
}

export async function deleteEmployee(id) {
    const response = await axios.delete(`${URL}/employees/${id}`);
    return response;
}

// Create new employee (administrators and consultants)
export async function createEmployee(employee) {
    const response = await axios.post(`${URL}/employees`, employee)
    return response
}

// Employee authentication
export async function verifyEmployee(employee) {
    console.log("Sending data to /employees/login:", employee);

    const response = await axios.post(`${URL}/employees/login`, employee)

    if(response.data.success) {
        return {
            token: response.data.token,
            admin: response.data.admin, // boolean from database (true = administrator, false = consultant)
            user: response.data.user // optional: user details
        }
    } else {
        return null
    }
}

// Get employees by role (optional helper functions)
export async function getAdministrators() {
    const response = await axios.get(`${URL}/employees?admin=true`);
    if (response.status === 200) {
        return response.data;
    } else {
        return;
    }
}

export async function getConsultants() {
    const response = await axios.get(`${URL}/employees?admin=false`);
    if (response.status === 200) {
        return response.data;
    } else {
        return;
    }
}


// Surveys
export async function getSurveys() {
  const response = await axios.get(`${URL}/surveys`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function getSurvey(id) {
  const response = await axios.get(`${URL}/surveys/${id}`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function createSurvey(survey) {
  const response = await axios.post(`${URL}/surveys`, survey);
  return response;
}

export async function updateSurvey(id, survey) {
  const response = await axios.put(`${URL}/surveys/${id}`, survey);
  return response;
}

export async function deleteSurvey(id) {
  const response = await axios.delete(`${URL}/surveys/${id}`);
  return response;
}

// Questions
export async function getQuestions() {
  const response = await axios.get(`${URL}/questions`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function getQuestion(id) {
  const response = await axios.get(`${URL}/questions/${id}`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function createQuestion(question) {
  const response = await axios.post(`${URL}/questions`, question);
  return response;
}

export async function updateQuestion(id, question) {
  const response = await axios.put(`${URL}/questions/${id}`, question);
  return response;
}

export async function deleteQuestion(id) {
  const response = await axios.delete(`${URL}/questions/${id}`);
  return response;
}

// Answers
export async function getAnswers() {
  const response = await axios.get(`${URL}/answers`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function getAnswer(id) {
  const response = await axios.get(`${URL}/answers/${id}`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function createAnswer(answer) {
  const response = await axios.post(`${URL}/answers`, answer);
  return response;
}

export async function updateAnswer(id, answer) {
  const response = await axios.put(`${URL}/answers/${id}`, answer);
  return response;
}

export async function deleteAnswer(id) {
  const response = await axios.delete(`${URL}/answers/${id}`);
  return response;
}

// Categories
export async function getCategories() {
  const response = await axios.get(`${URL}/categories`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function getCategory(id) {
  const response = await axios.get(`${URL}/categories/${id}`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function createCategory(category) {
  const response = await axios.post(`${URL}/categories`, category);
  return response;
}

export async function updateCategory(id, category) {
  const response = await axios.put(`${URL}/categories/${id}`, category);
  return response;
}

export async function deleteCategory(id) {
  const response = await axios.delete(`${URL}/categories/${id}`);
  return response;
}

// Priorities
export async function getPriorities() {
  const response = await axios.get(`${URL}/priorities`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function getPriority(id) {
  const response = await axios.get(`${URL}/priorities/${id}`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function createPriority(priority) {
  const response = await axios.post(`${URL}/priorities`, priority);
  return response;
}

export async function updatePriority(id, priority) {
  const response = await axios.put(`${URL}/priorities/${id}`, priority);
  return response;
}

export async function deletePriority(id) {
  const response = await axios.delete(`${URL}/priorities/${id}`);
  return response;
}

export async function createImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axios.post(`${URL}/images`, formData, {
    headers: {
      "Cobtent-Type": "multipart/form-data",
    },
  });

  return response;
}

// Get all clients
export async function getClients() {
  const response = await axios.get(`${URL}/clients`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

// Get a client by ID
export async function getClient(id) {
  const response = await axios.get(`${URL}/clients/${id}`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

// Create a new client
export async function createClient(client) {
  const response = await axios.post(`${URL}/clients`, client);
  return response;
}

// Update a client
export async function updateClient(id, client) {
  const response = await axios.put(`${URL}/clients/${id}`, client);
  return response;
}

export async function getImage(id) {
  const response = await axios.get(`${URL}/images/${id}`);
  return response;
}

// Statistics
export async function getStatistics() {
  const response = await axios.get(`${URL}/statistics`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function getCompletedSurveys() {
  const response = await axios.get(`${URL}/completed-surveys`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}
