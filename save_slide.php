<?php
// Path to the JSON file
$jsonFilePath = 'slides.json';

// Check if the JSON file exists
if (file_exists($jsonFilePath)) {
    // Read the current contents of the JSON file
    $jsonContents = file_get_contents($jsonFilePath);
    // Decode the JSON data into a PHP array
    $slidesArray = json_decode($jsonContents, true);
    
    // Ensure the file was properly decoded as an array
    if (!is_array($slidesArray)) {
        $slidesArray = array(); // Reset to an empty array if decoding failed
    }
} else {
    // If the file doesn't exist, start with an empty array
    $slidesArray = array();
}

// Get the new slide data from the POST request
$newSlideData = json_decode(file_get_contents('php://input'), true);

// Check if the new slide data is valid
if (is_array($newSlideData) && isset($newSlideData['fileName']) && isset($newSlideData['cameraPosition']) && isset($newSlideData['markerPosition']) && isset($newSlideData['description'])) {
    // Append the new slide data to the array
    $slidesArray[] = $newSlideData;
    
    // Encode the array back into JSON with pretty print
    $newJsonContents = json_encode($slidesArray, JSON_PRETTY_PRINT);
    
    // Write the updated JSON back to the file
    if (file_put_contents($jsonFilePath, $newJsonContents)) {
        echo "Slide stored successfully.";
    } else {
        echo "Failed to store slide.";
    }
} else {
    // Handle error: Invalid input data
    echo "Invalid slide data.";
}
?>
