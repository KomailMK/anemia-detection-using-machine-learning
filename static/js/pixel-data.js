document.addEventListener("DOMContentLoaded", () => {
  const pixelDataForm = document.getElementById("pixelDataForm")
  const uploadArea = document.getElementById("uploadArea")
  const imageUpload = document.getElementById("imageUpload")
  const imagePreview = document.getElementById("imagePreview")
  const previewImg = document.getElementById("previewImg")
  const removeImage = document.getElementById("removeImage")
  const resultsSection = document.getElementById("results")
  const cellAnalysis = document.getElementById("cellAnalysis")

  // Keep the drag and drop functionality for UI consistency, but make it optional
  if (uploadArea) {
    ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, preventDefaults, false)
    })

    function preventDefaults(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    ;["dragenter", "dragover"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, highlight, false)
    })
    ;["dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, unhighlight, false)
    })

    function highlight() {
      uploadArea.classList.add("highlight")
    }

    function unhighlight() {
      uploadArea.classList.remove("highlight")
    }

    uploadArea.addEventListener("drop", handleDrop, false)

    function handleDrop(e) {
      const dt = e.dataTransfer
      const files = dt.files

      if (files.length) {
        handleFiles(files)
      }
    }
  }

  // Handle file selection
  if (imageUpload) {
    imageUpload.addEventListener("change", function () {
      if (this.files.length) {
        handleFiles(this.files)
      }
    })
  }

  function handleFiles(files) {
    const file = files[0]

    if (!file.type.match("image.*")) {
      alert("Please select an image file")
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      previewImg.src = e.target.result
      uploadArea.style.display = "none"
      imagePreview.style.display = "block"
    }

    reader.readAsDataURL(file)
  }

  // Remove image
  if (removeImage) {
    removeImage.addEventListener("click", () => {
      previewImg.src = "#"
      imageUpload.value = ""
      imagePreview.style.display = "none"
      uploadArea.style.display = "flex"
    })
  }

  // Form submission
  if (pixelDataForm) {
    pixelDataForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Validate form inputs
      const gender = document.getElementById("gender").value
      const redPixel = document.getElementById("red_pixel").value
      const greenPixel = document.getElementById("green_pixel").value
      const bluePixel = document.getElementById("blue_pixel").value
      const hemoglobin = document.getElementById("hemoglobin").value

      // Basic validation
      if (!gender || !redPixel || !greenPixel || !bluePixel || !hemoglobin) {
        alert("Please fill in all required fields")
        return
      }

      // Show loading state
      const predictionValue = document.getElementById("prediction-value")
      const predictionText = document.getElementById("prediction-text")
      const predictionDescription = document.getElementById("prediction-description")
      const confidenceLevel = document.getElementById("confidence-level")
      const confidenceValue = document.getElementById("confidence-value")
      
      // Cell analysis elements
      const rbcMorphology = document.getElementById("rbc-morphology")
      const cellSize = document.getElementById("cell-size")
      const hemoglobinDist = document.getElementById("hemoglobin-dist")
      const cellCount = document.getElementById("cell-count")
      
      // Show loading state
      predictionValue.textContent = "..."
      predictionText.textContent = "Analyzing Data..."
      predictionDescription.textContent = "Processing your pixel data..."
      
      rbcMorphology.textContent = "Analyzing..."
      cellSize.textContent = "Analyzing..."
      hemoglobinDist.textContent = "Analyzing..."
      cellCount.textContent = "Analyzing..."
      
      // Show results section
      resultsSection.style.display = "block"
      cellAnalysis.style.display = "block"
      
      // Scroll to results
      setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: "smooth" })
      }, 300)

      // For debugging
      console.log("Sending data:", {
        gender: parseInt(gender),
        red_pixel: parseFloat(redPixel),
        green_pixel: parseFloat(greenPixel),
        blue_pixel: parseFloat(bluePixel),
        hemoglobin: parseFloat(hemoglobin)
      })

      // Use FormData for compatibility with the server
      const formData = new FormData()
      formData.append('gender', gender)
      formData.append('red_pixel', redPixel)
      formData.append('green_pixel', greenPixel)
      formData.append('blue_pixel', bluePixel)
      formData.append('hemoglobin', hemoglobin)
      
      // Add a dummy file if image upload is empty to avoid the "No image uploaded" error
      if (!imageUpload.files.length) {
        // Create an empty blob as a placeholder
        const emptyBlob = new Blob([''], { type: 'image/png' })
        formData.append('imageUpload', emptyBlob, 'placeholder.png')
      } else {
        formData.append('imageUpload', imageUpload.files[0])
      }

      // Call API endpoint
      fetch('/api/predict/pixel-data', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok && response.status !== 500) {  // Allow 500 errors to be processed
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then(result => {
        console.log("API Response:", result) // Debug: Log the response
        
        // Handle fallback or error cases
        let hasAnemia = false
        let confidence = 75 // Default value
        let details = "Analysis complete."
        let cellAnalysisData = {
          'rbc_morphology': '-',
          'cell_size': '-',
          'hemoglobin_dist': '-',
          'cell_count': '-'
        }
        
        // Check if we have a prediction
        if (result.prediction) {
          hasAnemia = result.prediction === "Yes"
          
          // Get confidence
          if (typeof result.confidence === 'number') {
            confidence = result.confidence
          } else if (result.confidence !== undefined) {
            confidence = parseInt(result.confidence) || 75
          }
          
          // Get details
          if (result.details) {
            details = result.details
          }
          
          // Get cell analysis
          if (result.cell_analysis) {
            cellAnalysisData = result.cell_analysis
          }
        } else if (result.error) {
          // Handle error case but still show some results
          details = `Error: ${result.error}. Using best-guess analysis.`
          hasAnemia = parseFloat(hemoglobin) < 12.0 // Simple fallback logic
        }
        
        // Update UI elements
        predictionValue.textContent = hasAnemia ? "A+" : "A-"
        predictionValue.style.color = hasAnemia ? "var(--danger)" : "var(--success)"
        document.querySelector(".indicator-circle").style.borderColor = hasAnemia ? "var(--danger)" : "var(--success)"
        document.querySelector(".indicator-circle").style.boxShadow = 
          `0 0 20px ${hasAnemia ? "rgba(255, 51, 102, 0.5)" : "rgba(0, 255, 136, 0.5)"}`
        
        predictionText.textContent = hasAnemia ? "Anemia Detected" : "No Anemia Detected"
        predictionDescription.textContent = details
        
        // Update cell analysis
        rbcMorphology.textContent = cellAnalysisData.rbc_morphology || "-"
        cellSize.textContent = cellAnalysisData.cell_size || "-"
        hemoglobinDist.textContent = cellAnalysisData.hemoglobin_dist || "-"
        cellCount.textContent = cellAnalysisData.cell_count || "-"
        
        // Animate confidence bar
        confidenceLevel.style.width = `${confidence}%`
        confidenceValue.textContent = `${confidence}%`
        
        // Change color based on result
        confidenceLevel.style.background = hasAnemia
          ? "linear-gradient(90deg, #ff3366, #ff6699)"
          : "linear-gradient(90deg, #00cc66, #00ff88)"
          
        // Show fallback notice if applicable
        if (result.fallback) {
          predictionDescription.textContent += " (Using fallback prediction as model is not available)"
        }
      })
      .catch(error => {
        console.error('Error:', error)
        
        // Even on error, show some results based on hemoglobin level
        const hasAnemia = parseFloat(hemoglobin) < 12.0 // Simple fallback logic
        const confidence = 60 // Lower confidence for error fallback
        
        predictionValue.textContent = hasAnemia ? "A+" : "A-"
        predictionValue.style.color = hasAnemia ? "var(--danger)" : "var(--success)"
        document.querySelector(".indicator-circle").style.borderColor = hasAnemia ? "var(--danger)" : "var(--success)"
        document.querySelector(".indicator-circle").style.boxShadow = 
          `0 0 20px ${hasAnemia ? "rgba(255, 51, 102, 0.5)" : "rgba(0, 255, 136, 0.5)"}`
        
        predictionText.textContent = hasAnemia ? "Anemia Detected" : "No Anemia Detected"
        predictionDescription.textContent = `Error during prediction. Using basic analysis based on hemoglobin level (${hemoglobin} g/dL).`
        
        // Update cell analysis with generic values
        rbcMorphology.textContent = hasAnemia ? "Likely Abnormal" : "Likely Normal"
        cellSize.textContent = hasAnemia ? "Possible Variation" : "Likely Uniform"
        hemoglobinDist.textContent = hasAnemia ? "Possibly Uneven" : "Likely Even"
        cellCount.textContent = hasAnemia ? "Possibly Low" : "Likely Normal"
        
        // Animate confidence bar
        confidenceLevel.style.width = `${confidence}%`
        confidenceValue.textContent = `${confidence}%`
        
        // Change color based on result
        confidenceLevel.style.background = hasAnemia
          ? "linear-gradient(90deg, #ff3366, #ff6699)"
          : "linear-gradient(90deg, #00cc66, #00ff88)"
      })
    })
  }
})