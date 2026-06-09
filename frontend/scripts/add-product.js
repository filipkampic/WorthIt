requireLogin();

renderNavAuth();
setupNavSearch();

const form = document.getElementById("add-product-form");
const imageUrlInput = document.getElementById("image-url");
const uploadArea = document.getElementById("upload-area");
const uploadPlaceholder = document.getElementById("upload-placeholder");
const uploadPreview = document.getElementById("upload-preview");

const nameInput = document.getElementById("product-name");
const categorySelect = document.getElementById("product-category");
const priceInput = document.getElementById("product-price");
const descInput = document.getElementById("product-description");
const descCount = document.getElementById("desc-count");

const previewName = document.getElementById("preview-name");
const previewPrice = document.getElementById("preview-price");
const previewCategory = document.getElementById("preview-category");
const previewCardImg = document.getElementById("preview-card-img");
const previewCardPlaceholder = document.getElementById("preview-card-placeholder");

const btnPublish = document.getElementById("btn-publish");
const btnText = document.getElementById("btn-publish-text");
const btnSpinner = document.getElementById("btn-spinner");
const globalError = document.getElementById("form-error-global");

nameInput.addEventListener("input", () => {
    previewName.textContent = nameInput.value.trim() || "Product Name";
});

categorySelect.addEventListener("change", () => {
    previewCategory.textContent = capitalize(categorySelect.value) || "Category";
});

priceInput.addEventListener("input", () => {
    const val = parseFloat(priceInput.value);
    previewPrice.textContent = isNaN(val) ? "€0.00" : `€${val.toFixed("")}`;
});

imageUrlInput.addEventListener("input", () => {
    updateImagePreview(imageUrlInput.value.trim());
});

descCount.addEventListener("input", () => {
    descCount.textContent = descInput.value.length;
});

function updateImagePreview(url) {
    if (!url) {
        uploadPreview.classList.add("hidden");
        uploadPlaceholder.classList.remove("hidden");
        previewCardImg.classList.add("hidden");
        previewCardPlaceholder.classList.remove("hidden");
        return;
    }
    const img = new Image();
    img.onload = () => {
        uploadPreview.src = url;
        uploadPreview.classList.remove("hidden");
        uploadPlaceholder.classList.add("hidden");
        previewCardImg.src = url;
        previewCardImg.classList.remove("hidden");
        previewCardPlaceholder.classList.add("hidden");
    };
    img.onerror = () => {
        uploadPreview.classList.add("hidden");
        uploadPlaceholder.classList.remove("hidden");
        previewCardImg.classList.add("hidden");
        previewCardPlaceholder.classList.remove("hidden");
    };
    img.src = url;
}


uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url) {
        imageUrlInput.value = url;
        updateImagePreview(url);
    }
});


function showError(inputEl, errorId, msg) {
    inputEl.classList.add("input-error");
    const el = document.getElementById(errorId);
    el.textContent = msg;
    el.classList.remove("hidden");
}

function clearError(inputEl, errorId) {
    inputEl.classList.remove("input-error");
    document.getElementById(errorId).classList.add("hidden");
}

function validateForm() {
    let valid = true;

    if (!nameInput.value.trim()) {
        showError(nameInput, "name-error", "Product name is required.");
        valid = false;
    } else {
        clearError(nameInput, "name-error");
    }

    if (!categorySelect.value) {
        showError(categorySelect, "category-error", "Please select a category.");
        valid = false;
    } else {
        clearError(categorySelect, "category-error");
    }

    const price = parseFloat(priceInput.value);
    if (!priceInput.value || isNaN(price) || price < 0) {
        showError(priceInput, "price-error", "Please enter a valid price.");
        valid = false;
    } else {
        clearError(priceInput, "price-error");
    }

    if (descInput.value.trim().length < 20) {
        showError(descInput, "description-error", "Description is required (min 20 characters).");
        valid = false;
    } else {
        clearError(descInput, "description-error");
    }

    const imgUrl = imageUrlInput.value.trim();
    if (imgUrl && !imgUrl.startsWith("http")) {
        showError(imageUrlInput, "image-url-error", "Please enter a valid image URL.");
        valid = false;
    } else {
        clearError(imageUrlInput, "image-url-error");
    }

    return valid;
}


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    globalError.classList.add("hidden");

    if (!validateForm()) return;

    btnText.textContent = "Publishing...";
    btnSpinner.classList.remove("hidden");
    btnPublish.disabled = true;

    const body = {
        name: nameInput.value.trim(),
        category: categorySelect.value,
        price: parseFloat(priceInput.value),
        image: imageUrlInput.value.trim(),
        description: descInput.value.trim(),
        userId: localStorage.getItem("userId"),
        username: localStorage.getItem("username")
    };

    const res = await post("/items", body);

    btnText.textContent = "Publish Product";
    btnSpinner.classList.add("hidden");
    btnPublish.disabled = false;

    if (res.error) {
        globalError.textContent = res.error;
        globalError.classList.remove("hidden");
        return;
    }

    window.location.href = `item.html?id=${res.id}`;
});
