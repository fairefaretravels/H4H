<?php
header('Content-Type: application/json');

$files = scandir(__DIR__);
$tracks = [];

foreach($files as $file){

    if(is_file(__DIR__ . "/" . $file)){

        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        if(in_array($ext, [
            'mp3',
            'wav',
            'm4a',
            'ogg',
            'aac',
            'flac'
        ])){

            $tracks[] = [
                "name"=>$file,
                "url"=>$file
            ];

        }
    }
}

echo json_encode($tracks, JSON_PRETTY_PRINT);
?>
