<?php
require 'config.php';

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$apiKey = GEMINI_API_KEY;
if ($apiKey === '') {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured. Please add GEMINI_API_KEY to .env file.']);
    exit;
}

$rawBody = file_get_contents('php://input');
if (strlen($rawBody) > 20000) {
    http_response_code(413);
    echo json_encode(['error' => 'Request too large']);
    exit;
}

$input = json_decode($rawBody, true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body']);
    exit;
}

$userMessage = trim($input['message'] ?? '');
if ($userMessage === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit;
}

// Conversation history (array of {role, text} objects from frontend)
$history = $input['history'] ?? [];

// ── System Prompt ── tells Gemini who it is ──────────────────────────────
$systemPrompt = "You are Akarshit's AI Assistant — a smart, friendly chatbot embedded on Akarshit Gupta's personal portfolio website.

About Akarshit Gupta:
- Full-Stack Web Developer & AI Creator based in India
- Specializes in: HTML5, CSS3, JavaScript, PHP, React, AI integrations, UI/UX Design
- Services offered: Website Design, Landing Pages, Portfolio Sites, E-commerce, AI Chatbots, Branding
- Pricing: Starts from ₹5,000. Custom quotes based on project scope.
- Contact: hello@akarshitgupta.com | WhatsApp available on the site
- Response time: Within 24 hours
- Works remotely with clients worldwide
- Has built premium dark-themed portfolios, AI-powered tools, and e-commerce platforms
- Community: Runs a free developer community via join.html page

Your behavior:
- Be helpful, professional, and friendly
- Answer questions about Akarshit's skills, services, pricing, and work
- Encourage visitors to use the contact form or WhatsApp to get a quote
- If asked about unrelated topics (e.g., politics, personal advice), politely redirect to portfolio topics
- Keep answers concise (2-4 sentences max unless a detailed list is needed)
- Use emojis sparingly to keep it professional
- If someone wants to hire Akarshit, direct them to the contact section or WhatsApp

Current user message: ";

// ── Build contents array with history ────────────────────────────────────
$contents = [];

// Add conversation history
if (!empty($history) && is_array($history)) {
    foreach ($history as $turn) {
        $role = ($turn['role'] === 'user') ? 'user' : 'model';
        $text = trim($turn['text'] ?? '');
        if ($text !== '') {
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $text]]
            ];
        }
    }
}

// Add current user message (with system prompt prepended to first message if no history)
$messageText = empty($contents)
    ? $systemPrompt . $userMessage
    : $userMessage;

$contents[] = [
    'role' => 'user',
    'parts' => [['text' => $messageText]]
];

// ── Call Gemini API ───────────────────────────────────────────────────────
$geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . urlencode($apiKey);

$payload = [
    'contents' => $contents,
    'generationConfig' => [
        'maxOutputTokens' => 600,
        'temperature'     => 0.75,
        'topP'            => 0.9,
    ]
];

$ch = curl_init($geminiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(502);
    echo json_encode(['error' => 'Connection failed: ' . $curlError]);
    exit;
}

$result = json_decode($response, true);

if ($httpCode !== 200) {
    $errMsg = $result['error']['message'] ?? ('API error: HTTP ' . $httpCode);
    // Try fallback model if 404
    if ($httpCode === 404) {
        $fallbackUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' . urlencode($apiKey);
        $ch2 = curl_init($fallbackUrl);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch2, CURLOPT_TIMEOUT, 30);
        $response = curl_exec($ch2);
        $httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);
        $result = json_decode($response, true);
    }
    if ($httpCode !== 200) {
        http_response_code(502);
        echo json_encode(['error' => $errMsg]);
        exit;
    }
}

$replyText = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;

if ($replyText === null) {
    http_response_code(502);
    echo json_encode(['error' => 'No response from AI. Please try again.']);
    exit;
}

echo json_encode(['reply' => trim($replyText)]);
