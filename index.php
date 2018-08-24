<?php

function request($url, $method, $headers, $data) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $result = curl_exec($ch);
    if(!$result) {
        return false;
    }
    return $result;
    curl_close($ch);
}

$apiUrl = 'http://localhost:3000';

$uri = $_SERVER['REQUEST_URI'];
$verb = $_SERVER['REQUEST_METHOD'];

$body = json_decode(file_get_contents('php://input'), true);

if(strpos($uri, '/api') === 0) {
    $path = $apiUrl . substr($uri, 4);
    echo request($path, $verb, getallheaders(), json_encode($body));
} else {
    echo request($apiUrl . '/lost', 'get', array(), null);
}

?>
