function sendFileToRender($fileUrl, $fileName) {
    $renderApiUrl = "https://your-render-service-url/upload"; // آدرس API سرویس Render

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $renderApiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'file' => curl_file_create($fileUrl, null, $fileName)
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    return $response;
}

function telegram_file_uploader_webhook() {
    $token = '7704392957:AAE0-vIrLNMxAk5bS725eSglcSFBCedLWrk';
    $logFile = plugin_dir_path(__FILE__) . 'telegram-log.txt';

    $requestBody = file_get_contents('php://input');
    $update = json_decode($requestBody, true);

    file_put_contents($logFile, json_encode($update, JSON_PRETTY_PRINT) . "\n", FILE_APPEND);

    if (isset($update['message']['document'])) {
        $chatId = $update['message']['chat']['id'];
        $fileId = $update['message']['document']['file_id'];
        $fileName = $update['message']['document']['file_name'];

        sendTelegramMessage($token, $chatId, 'فایل شما در حال ارسال به Render است، لطفاً صبر کنید...');

        $file = getTelegramFile($token, $fileId);
        if (isset($file['file_path'])) {
            $fileUrl = "https://api.telegram.org/file/bot$token/" . $file['file_path'];

            $response = sendFileToRender($fileUrl, $fileName);
            if ($response) {
                sendTelegramMessage($token, $chatId, 'فایل شما با موفقیت به Render آپلود شد.');
            } else {
                sendTelegramMessage($token, $chatId, 'مشکلی در آپلود فایل به Render وجود داشت.');
            }
        } else {
            sendTelegramMessage($token, $chatId, 'مشکلی در دریافت فایل از تلگرام وجود داشت.');
        }
    }
}
