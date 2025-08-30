// Global variables
let jsonData = null;
let currentImageIndex = 0;
let processedImages = [];
let originalCanvas, descrambledCanvas;
let originalCtx, descrambledCtx;

// DOM elements
const jsonInput = document.getElementById("jsonInput");
const parseJsonBtn = document.getElementById("parseJsonBtn");
const clearJsonBtn = document.getElementById("clearJsonBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const processAllBtn = document.getElementById("processAllBtn");
const downloadZipBtn = document.getElementById("downloadZipBtn");
const resetBtn = document.getElementById("resetBtn");
const previewBtn = document.getElementById("previewBtn");
const downloadCurrentBtn = document.getElementById("downloadCurrentBtn");

// Info grid
const seriesTitleEl = document.getElementById("seriesTitle");
const chapterTitleEl = document.getElementById("chapterTitle");
const totalPagesEl = document.getElementById("totalPages");
const imageDimensionsEl = document.getElementById("imageDimensions");

// Initialize canvases
function initCanvases() {
  originalCanvas = document.getElementById("originalCanvas");
  descrambledCanvas = document.getElementById("descrambledCanvas");
  originalCtx = originalCanvas.getContext("2d");
  descrambledCtx = descrambledCanvas.getContext("2d");
}

// Event listeners
parseJsonBtn.addEventListener("click", parseJSON);
clearJsonBtn.addEventListener("click", clearJSON);
loadSampleBtn.addEventListener("click", loadSampleJSON);
processAllBtn.addEventListener("click", processAllImages);
downloadZipBtn.addEventListener("click", downloadZIP);
resetBtn.addEventListener("click", resetApplication);
previewBtn.addEventListener("click", previewCurrentImage);
downloadCurrentBtn.addEventListener("click", downloadCurrentImage);

// Initialize
initCanvases();

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((tab) => (tab.style.display = "none"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).style.display = "block";
  });
});

// Fetch JSON + fallback
document.getElementById("fetchJsonBtn").addEventListener("click", async () => {
  const url = document.getElementById("chapterLink").value.trim();
  if (!url) return alert("Please enter a link");

  try {
    const res = await fetch("/fetch-json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    if (data.error) {
      alert("Error: " + data.error);

      // 🔀 Switch to manual JSON input tab
      const jsonTabBtn = document.querySelector(".tab-btn[data-tab='jsonTab']");
      if (jsonTabBtn) jsonTabBtn.click();

      return;
    }

    // Directly parse JSON and update UI
    jsonData = data;

    const pages = jsonData.readableProduct?.pageStructure?.pages || [];
    const imagePages = pages.filter((page) => page.type === "main" && page.src);

    if (imagePages.length === 0) {
      showStatus("No image pages found in JSON. Paste manually.", "error");

      // 🔀 Auto-switch to JSON Input tab
      const jsonTabBtn = document.querySelector(".tab-btn[data-tab='jsonTab']");
      if (jsonTabBtn) jsonTabBtn.click();

      return;
    }

    // Update info grid
    document.getElementById("totalPages").textContent = imagePages.length;
    document.getElementById(
      "imageDimensions"
    ).textContent = `${imagePages[0].width}x${imagePages[0].height}`;
    document.getElementById("seriesTitle").textContent =
      jsonData.readableProduct?.series?.title || "N/A";
    document.getElementById("chapterTitle").textContent =
      jsonData.readableProduct?.title || "N/A";

    document.getElementById("chapterInfo").style.display = "grid";
    document.getElementById("processingInfo").style.display = "grid";
    document.getElementById("remainingCount").textContent = imagePages.length;

    processAllBtn.disabled = false;
    previewBtn.disabled = false;

    showStatus(
      `JSON fetched and parsed successfully! Found ${imagePages.length} images.`,
      "success"
    );
  } catch (err) {
    alert("Failed to fetch JSON: " + err);

    // 🔀 On network/other failure, switch to JSON input too
    const jsonTabBtn = document.querySelector(".tab-btn[data-tab='json']");
    if (jsonTabBtn) jsonTabBtn.click();
  }
});

// Parse JSON function
function parseJSON() {
  try {
    const jsonText = jsonInput.value.trim();
    if (!jsonText) {
      showStatus("Please enter JSON content", "error");
      return;
    }

    jsonData = JSON.parse(jsonText);

    // Extract image information
    const pages = jsonData.readableProduct?.pageStructure?.pages || [];
    const imagePages = pages.filter((page) => page.type === "main" && page.src);

    if (imagePages.length === 0) {
      showStatus("No image pages found in JSON", "error");
      return;
    }

    // Display information
    document.getElementById("totalPages").textContent = imagePages.length;
    document.getElementById(
      "imageDimensions"
    ).textContent = `${imagePages[0].width}x${imagePages[0].height}`;
    document.getElementById("seriesTitle").textContent =
      jsonData.readableProduct?.series?.title || "N/A";
    document.getElementById("chapterTitle").textContent =
      jsonData.readableProduct?.title || "N/A";

    document.getElementById("chapterInfo").style.display = "grid";
    document.getElementById("processingInfo").style.display = "grid";
    document.getElementById("remainingCount").textContent = imagePages.length;

    processAllBtn.disabled = false;
    previewBtn.disabled = false;

    showStatus(
      `JSON parsed successfully! Found ${imagePages.length} images.`,
      "success"
    );
  } catch (error) {
    showStatus(`Error parsing JSON: ${error.message}`, "error");
  }
}

// Clear JSON function
function clearJSON() {
  jsonInput.value = "";
  jsonData = null;
  document.getElementById("chapterInfo").style.display = "none";
  document.getElementById("processingInfo").style.display = "none";
  processAllBtn.disabled = true;
  previewBtn.disabled = true;
  downloadZipBtn.disabled = true;
  downloadCurrentBtn.disabled = true;
  hideStatus();
}

// Load sample JSON function
function loadSampleJSON() {
  const sampleJSON = {
    readableProduct: {
      title: "Sample Chapter",
      series: {
        title: "Sample Series",
      },
      pageStructure: {
        pages: [
          { type: "other" },
          {
            src: "https://example.com/image1.jpg",
            width: 1125,
            height: 1600,
            type: "main",
          },
          {
            src: "https://example.com/image2.jpg",
            width: 1125,
            height: 1600,
            type: "main",
          },
        ],
      },
    },
  };

  jsonInput.value = JSON.stringify(sampleJSON, null, 2);
  showStatus('Sample JSON loaded. Click "Parse JSON" to continue.', "info");
}

// Process all images function
async function processAllImages() {
  if (!jsonData) {
    showStatus("Please parse JSON first", "error");
    return;
  }

  const pages = jsonData.readableProduct.pageStructure.pages;
  const imagePages = pages.filter((page) => page.type === "main" && page.src);

  if (imagePages.length === 0) {
    showStatus("No images to process", "error");
    return;
  }

  processAllBtn.disabled = true;
  downloadZipBtn.disabled = true;
  processedImages = [];
  currentImageIndex = 0;

  // Show progress
  document.getElementById("progressContainer").style.display = "block";
  updateProgress(0, imagePages.length);

  try {
    for (let i = 0; i < imagePages.length; i++) {
      const page = imagePages[i];
      currentImageIndex = i;

      updateProgress(i + 1, imagePages.length);
      document.getElementById("currentImage").textContent = `Page ${i + 1}`;
      document.getElementById("processedCount").textContent = i + 1;
      document.getElementById("remainingCount").textContent =
        imagePages.length - i - 1;

      showStatus(
        `Processing image ${i + 1}/${imagePages.length}: ${page.src}`,
        "info"
      );

      try {
        const processedImage = await processImage(
          page.src,
          page.width,
          page.height
        );
        if (processedImage) {
          processedImages.push({
            data: processedImage,
            filename: `page_${String(i + 1).padStart(2, "0")}.png`,
          });
        }
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
        showStatus(
          `Error processing image ${i + 1}: ${error.message}`,
          "error"
        );
      }
    }

    showStatus(
      `All images processed successfully! ${processedImages.length} images ready for download.`,
      "success"
    );
    downloadZipBtn.disabled = false;
  } catch (error) {
    showStatus(`Error during processing: ${error.message}`, "error");
  } finally {
    processAllBtn.disabled = false;
  }
}

// Process individual image function
async function processImage(imageUrl, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      try {
        // Set canvas dimensions
        originalCanvas.width = width;
        originalCanvas.height = height;
        descrambledCanvas.width = width;
        descrambledCanvas.height = height;

        // Show canvases
        originalCanvas.style.display = "inline-block";
        descrambledCanvas.style.display = "inline-block";

        // Draw original image
        originalCtx.drawImage(img, 0, 0, width, height);

        // Perform descrambling
        performColumnMajorDescrambling(img, width, height);

        // Get processed image data
        const processedData = descrambledCanvas.toDataURL("image/png", 1.0);
        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = function () {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}

function floorToMultiple(value, multiple) {
  return Math.floor(value / multiple) * multiple;
}

function performColumnMajorDescrambling(
  originalImage,
  canvasWidth,
  canvasHeight
) {
  const cols = 4;
  const rows = 4;

  // Compute tile size rounded down to nearest multiple of 8
  const tileWidth = Math.floor(originalImage.width / cols / 8) * 8;
  const tileHeight = Math.floor(originalImage.height / rows / 8) * 8;

  // Compute remainders (pixels untouched)
  const remainderX = originalImage.width - tileWidth * cols;
  const remainderY = originalImage.height - tileHeight * rows;

  // Clear canvas
  descrambledCtx.fillStyle = "white";
  descrambledCtx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Copy the remainder strips from the original image (right and bottom edges)
  if (remainderX > 0) {
    descrambledCtx.drawImage(
      originalImage,
      tileWidth * cols,
      0,
      remainderX,
      originalImage.height,
      tileWidth * cols,
      0,
      remainderX,
      canvasHeight
    );
  }

  if (remainderY > 0) {
    descrambledCtx.drawImage(
      originalImage,
      0,
      tileHeight * rows,
      originalImage.width,
      remainderY,
      0,
      tileHeight * rows,
      canvasWidth,
      remainderY
    );
  }

  // Column-major mapping for full tiles only
  const mapping = [
    { src: [0, 0], dst: [0, 0] },
    { src: [0, 1], dst: [1, 0] },
    { src: [0, 2], dst: [2, 0] },
    { src: [0, 3], dst: [3, 0] },
    { src: [1, 0], dst: [0, 1] },
    { src: [1, 1], dst: [1, 1] },
    { src: [1, 2], dst: [2, 1] },
    { src: [1, 3], dst: [3, 1] },
    { src: [2, 0], dst: [0, 2] },
    { src: [2, 1], dst: [1, 2] },
    { src: [2, 2], dst: [2, 2] },
    { src: [2, 3], dst: [3, 2] },
    { src: [3, 0], dst: [0, 3] },
    { src: [3, 1], dst: [1, 3] },
    { src: [3, 2], dst: [2, 3] },
    { src: [3, 3], dst: [3, 3] },
  ];

  const destTileWidth = tileWidth;
  const destTileHeight = tileHeight;

  for (let map of mapping) {
    const [srcCol, srcRow] = map.src;
    const [dstCol, dstRow] = map.dst;

    descrambledCtx.drawImage(
      originalImage,
      srcCol * tileWidth,
      srcRow * tileHeight,
      tileWidth,
      tileHeight,
      dstCol * destTileWidth,
      dstRow * destTileHeight,
      destTileWidth,
      destTileHeight
    );
  }
}

// Preview current image function
function previewCurrentImage() {
  if (!jsonData || processedImages.length === 0) {
    showStatus("No processed images to preview", "error");
    return;
  }

  const currentImage = processedImages[currentImageIndex];
  if (currentImage) {
    // Convert data URL to canvas for preview
    const img = new Image();
    img.onload = function () {
      descrambledCanvas.width = img.width;
      descrambledCanvas.height = img.height;
      descrambledCtx.drawImage(img, 0, 0);
      descrambledCanvas.style.display = "inline-block";
      originalCanvas.style.display = "none";

      downloadCurrentBtn.disabled = false;
      showStatus(`Previewing ${currentImage.filename}`, "success");
    };
    img.src = currentImage.data;
  }
}

// Download current image function
function downloadCurrentImage() {
  if (!jsonData || processedImages.length === 0) {
    showStatus("No processed images to download", "error");
    return;
  }

  const currentImage = processedImages[currentImageIndex];
  if (currentImage) {
    const link = document.createElement("a");
    link.download = currentImage.filename;
    link.href = currentImage.data;
    link.click();
    showStatus(`Downloaded ${currentImage.filename}`, "success");
  }
}

// Download ZIP function
async function downloadZIP() {
  if (processedImages.length === 0) {
    showStatus("No processed images to download", "error");
    return;
  }

  try {
    showStatus("Creating ZIP file...", "info");

    const zip = new JSZip();

    // Add each processed image to the ZIP
    for (const image of processedImages) {
      // Convert data URL to blob
      const response = await fetch(image.data);
      const blob = await response.blob();

      // Add to ZIP
      zip.file(image.filename, blob);
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Download ZIP
    const link = document.createElement("a");
    link.download = "descrambled_images.zip";
    link.href = URL.createObjectURL(zipBlob);
    link.click();

    showStatus(
      `ZIP downloaded successfully with ${processedImages.length} images!`,
      "success"
    );
  } catch (error) {
    showStatus(`Error creating ZIP: ${error.message}`, "error");
  }
}

// Update progress function
function updateProgress(current, total) {
  const percentage = Math.round((current / total) * 100);
  document.getElementById("progressFill").style.width = percentage + "%";
  document.getElementById(
    "progressText"
  ).textContent = `${percentage}% Complete (${current}/${total})`;
}

// Reset application function
function resetApplication() {
  clearJSON();
  processedImages = [];
  currentImageIndex = 0;
  document.getElementById("progressContainer").style.display = "none";
  originalCanvas.style.display = "none";
  descrambledCanvas.style.display = "none";
  hideStatus();
}

// Show status function
function showStatus(message, type = "info") {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = "block";
}

// Hide status function
function hideStatus() {
  document.getElementById("status").style.display = "none";
}

// Load sample JSON on page load
window.addEventListener("load", () => {
  showStatus(
    'Welcome! Click "Load Sample" to see an example or paste your own JSON.',
    "info"
  );
});
