<?php
/**
 * Real SA:MP / CR:MP online counter
 * Server: 185.207.214.14:7785
 * Usage: GET online.php  -> {"online":12,"max":100,"hostname":"..."}
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

$ip = '185.207.214.14';
$port = 7785;
$timeout = 2.5;

function samp_query($ip, $port, $opcode = 'i', $timeout = 2.5) {
    $sock = @fsockopen('udp://' . $ip, $port, $errno, $errstr, $timeout);
    if (!$sock) return null;
    stream_set_timeout($sock, (int)$timeout, (int)(($timeout - (int)$timeout) * 1e6));

    $packet = 'SAMP';
    foreach (explode('.', $ip) as $o) $packet .= chr((int)$o);
    $packet .= chr($port & 0xFF) . chr(($port >> 8) & 0xFF);
    $packet .= $opcode;

    fwrite($sock, $packet);
    $data = fread($sock, 4096);
    fclose($sock);
    if ($data === false || strlen($data) < 11) return null;
    return $data;
}

function read_uint16($data, &$o) {
    $v = ord($data[$o]) | (ord($data[$o + 1]) << 8);
    $o += 2;
    return $v;
}
function read_uint32($data, &$o) {
    $v = ord($data[$o]) | (ord($data[$o + 1]) << 8) | (ord($data[$o + 2]) << 16) | (ord($data[$o + 3]) << 24);
    $o += 4;
    return $v;
}
function read_string($data, &$o) {
    $len = read_uint32($data, $o);
    if ($len < 0 || $len > 400 || $o + $len > strlen($data)) return '';
    $s = substr($data, $o, $len);
    $o += $len;
    // try cp1251 -> utf8
    if (function_exists('mb_convert_encoding')) {
        $u = @mb_convert_encoding($s, 'UTF-8', 'Windows-1251');
        if ($u !== false) return $u;
    }
    return $s;
}

$data = samp_query($ip, $port, 'i', $timeout);
if ($data === null) {
    http_response_code(503);
    echo json_encode(['online' => null, 'max' => null, 'error' => 'server_unreachable', 'ip' => $ip, 'port' => $port], JSON_UNESCAPED_UNICODE);
    exit;
}

$o = 11; // skip SAMP + ip + port + opcode
if (strlen($data) <= $o + 5) {
    http_response_code(502);
    echo json_encode(['error' => 'bad_response']);
    exit;
}
$password = ord($data[$o]); $o++;
$players = read_uint16($data, $o);
$maxplayers = read_uint16($data, $o);
$hostname = read_string($data, $o);
$gamemode = read_string($data, $o);
$language = read_string($data, $o);

echo json_encode([
    'online' => $players,
    'max' => $maxplayers,
    'hostname' => $hostname,
    'gamemode' => $gamemode,
    'language' => $language,
    'ip' => $ip,
    'port' => $port
], JSON_UNESCAPED_UNICODE);
