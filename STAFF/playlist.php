<?php
header('Content-Type: application/json');

$allowed = array('mp3','wav','m4a','ogg','aac','flac');

$files = array();

foreach (scandir('.') as $file) {

    if ($file === '.' || $file === '..') continue;

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    if (in_array($ext, $allowed)) {
        $files[] = array(
            "name" => $file,
            "url" => $file
        );
    }
}

sort($files);

echo json_encode($files);
?>
