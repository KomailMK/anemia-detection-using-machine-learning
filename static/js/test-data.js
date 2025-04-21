document.addEventListener("DOMContentLoaded", () => {
  const testDataForm = document.getElementById("testDataForm")
  const resultsSection = document.getElementById("results")

  if (testDataForm) {
    testDataForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form values
      const gender = document.getElementById("gender").value
      const age = document.getElementById("age").value
      const hemoglobin = Number.parseFloat(document.getElementById("hemoglobin").value)
      const rbc = Number.parseFloat(document.getElementById("rbc").value)
      const pcv = Number.parseFloat(document.getElementById("pcv").value)
      const mcv = Number.parseFloat(document.getElementById("mcv").value)
      const mch = Number.parseFloat(document.getElementById("mch").value)
      const mchc = Number.parseFloat(document.getElementById("mchc").value)

      // Prepare data for API call
      const data = {
        gender: parseInt(gender),
        age: parseInt(age),
        hemoglobin: hemoglobin,
        rbc: rbc,
        pcv: pcv,
        mcv: mcv,
        mch: mch,
        mchc: mchc
      }

      // Show loading state
      const predictionValue = document.getElementById("prediction-value")
      const predictionText = document.getElementById("prediction-text")
      const predictionDescription = document.getElementById("prediction-description")
      const confidenceLevel = document.getElementById("confidence-level")
      const confidenceValue = document.getElementById("confidence-value")
      
      predictionValue.textContent = "..."
      predictionText.textContent = "Analyzing..."
      predictionDescription.textContent = "Processing your test data..."
      
      // Show results section
      resultsSection.style.display = "block"
      
      // Scroll to results
      setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: "smooth" })
      }, 300)

      // Call API endpoint
      fetch('/api/predict/test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then(result => {
        console.log("API Response:", result) // Debug: Log the response
        
        // Check for error in response
        if (result.error) {
          throw new Error(result.error)
        }
        
        // Update UI with results
        const hasAnemia = result.prediction === 1
        
        // Ensure confidence is a number
        let confidence = 75 // Default value
        if (typeof result.confidence === 'number') {
          confidence = result.confidence
        } else if (result.confidence !== undefined) {
          confidence = parseInt(result.confidence) || 75
        }
        
        // Update UI elements
        predictionValue.textContent = hasAnemia ? "A+" : "A-"
        predictionValue.style.color = hasAnemia ? "var(--danger)" : "var(--success)"
        document.querySelector(".indicator-circle").style.borderColor = hasAnemia ? "var(--danger)" : "var(--success)"
        document.querySelector(".indicator-circle").style.boxShadow = 
          `0 0 20px ${hasAnemia ? "rgba(255, 51, 102, 0.5)" : "rgba(0, 255, 136, 0.5)"}`
        
        predictionText.textContent = hasAnemia ? "Anemia Detected" : "No Anemia Detected"
        predictionDescription.textContent = result.details || "Analysis complete."
        
        // Animate confidence bar
        confidenceLevel.style.width = `${confidence}%`
        confidenceValue.textContent = `${confidence}%`
        
        // Change color based on result
        confidenceLevel.style.background = hasAnemia
          ? "linear-gradient(90deg, #ff3366, #ff6699)"
          : "linear-gradient(90deg, #00cc66, #00ff88)"
      })
      .catch(error => {
        console.error('Error:', error)
        predictionText.textContent = "Error"
        predictionDescription.textContent = "An error occurred during prediction. Please try again."
        
        // Reset confidence
        confidenceLevel.style.width = "0%"
        confidenceValue.textContent = "0%"
      })
    })
  }
})