<?php
// Set the content type to JSON
header('Content-Type: application/json');

// Set headers to prevent caching
header('Cache-Control: no-cache, must-revalidate'); // HTTP 1.1
header('Pragma: no-cache'); // HTTP 1.0
header('Expires: 0'); // Proxies

// Path to the slides.json file
$slidesFile = '../slides.json'; // Adjust the path if needed

// Log the path being accessed (for debugging)
error_log('Fetching slides.json from: ' . realpath($slidesFile)); // Logs the actual path used

// Check if the file exists and is readable
if (file_exists($slidesFile) && is_readable($slidesFile)) {
    // Read the JSON data from the file
    $jsonData = file_get_contents($slidesFile);
    
    // Send the JSON data as the response
    echo $jsonData;
} else {
    // Log the error if the file cannot be found or read
    error_log('Failed to load slides.json from: ' . realpath($slidesFile));

    // Return an error response
    echo json_encode(['error' => 'Unable to load slides.json']);
}
?>
