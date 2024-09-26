<?php
$directory = 'object_files/';  // Directory where your .obj files are located
$files = array();

// Check if the directory exists
if (is_dir($directory)) {
    // Open the directory
    if ($dir = opendir($directory)) {
        // Loop through each file in the directory
        while (($file = readdir($dir)) !== false) {
            // Only add .obj files
            if (pathinfo($file, PATHINFO_EXTENSION) == 'obj') {
                $files[] = $file;
            }
        }
        closedir($dir);
    }
}

// Return the list of files as JSON
header('Content-Type: application/json');
echo json_encode($files);
?>
