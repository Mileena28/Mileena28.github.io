<?php
require_once 'PHPMailer/src/PHPMailer.php';
require_once 'PHPMailer/src/SMTP.php';
require_once 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$smtp_username = 'mileenarayne@mileenarayne.com';
$smtp_password = 'cpje lxgl tryt yqfd';
$to_email = 'mileenarayne@mileenarayne.com';

$name = trim(htmlspecialchars($_POST['name'] ?? ''));
$email = trim(htmlspecialchars($_POST['email'] ?? ''));
$category = trim(htmlspecialchars($_POST['category'] ?? ''));
$message = trim(htmlspecialchars($_POST['message'] ?? ''));

if (empty($name) || empty($email) || empty($category) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

$spam_words = ['viagra', 'casino', 'lottery', 'winner', 'urgent', 'click here', 'make money'];
$check_text = strtolower($message . ' ' . $name);
foreach ($spam_words as $word) {
    if (strpos($check_text, $word) !== false) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Message flagged as spam']);
        exit;
    }
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $smtp_username;
    $mail->Password = $smtp_password;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->setFrom($smtp_username, 'Website Contact Form');
    $mail->addAddress($to_email, 'Mileena Rayne');
    $mail->addReplyTo($email, $name);
    
    $mail->isHTML(false);
    $mail->Subject = "New Contact: " . ucfirst($category);
    
    $email_body = "New message from your website:\n\n";
    $email_body .= "Name: {$name}\n";
    $email_body .= "Email: {$email}\n";
    $email_body .= "Category: {$category}\n";
    $email_body .= "Time: " . date('Y-m-d H:i:s T') . "\n\n";
    $email_body .= "Message:\n{$message}\n\n";
    $email_body .= "---\n";
    $email_body .= "Sent from: {$_SERVER['HTTP_HOST']}\n";
    $email_body .= "IP: {$_SERVER['REMOTE_ADDR']}\n";
    
    $mail->Body = $email_body;
    $mail->send();
    
    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send message']);
}
?>
