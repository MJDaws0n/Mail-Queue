<?php
namespace MailQueue;

/**
 * MailQueue class to handle sending emails via a mail queue service.
 *
 * This class provides methods to set the recipient, subject, and HTML content
 * of the email, and to send the email using an external API.
 */
class MailQueue {
    private $apiUrl;
    private $apiKey;
    private $toEmail;
    private $toName;
    private $htmlContent;
    private $subject;

    /**
     * Constructor for the MailQueue class.
     *
     * @param string $apiKey The API key for the mail queue service
     * @param string $apiUrl The API url for the mail queue service
     */
    public function __construct($apiKey, $apiUrl){
        $this->apiKey = $apiKey;
        $this->$apiUrl = $apiUrl.'/send-email';
    }

    /**
     * Set the recipient email and name.
     *
     * @param string $email The recipient's email address
     * @param string $name The recipient's name
     */
    public function setRecipient($email, $name): void{
        $this->toEmail = $email;
        $this->toName = $name;
    }

    /**
     * Set the subject of the email.
     *
     * @param string $subject The subject of the email
     */
    public function setSubject($subject): void{
        $this->subject = $subject;
    }

    /**
     * Set the HTML content of the email.
     *
     * @param string $htmlContent The HTML content of the email
     */
    public function setHtmlContent($htmlContent){
        $this->htmlContent = $htmlContent;
    }

    /**
     * Send the email using the mail queue API.
     *
     * @return array The response from the mail queue API
     */
    public function send(): array{
        $curl = curl_init();
        $payload = json_encode([
            'toEmail' => $this->toEmail,
            'toName' => $this->toName,
            'html' => $this->htmlContent,
            'subject' => $this->subject,
        ]);

        curl_setopt_array($curl, [
            CURLOPT_URL => $this->apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'api-key: ' . $this->apiKey,
            ],
        ]);

        $response = curl_exec($curl);
        curl_close($curl);

        if($this->validate_json($response)){
            return json_decode($response, true);
        } else{
            die ('Mail queue error');
        }
    }

    /**
     * Validate if a string is a valid JSON.
     *
     * @param string $string The string to validate
     * @return bool True if valid JSON, false otherwise
     */
    private function validate_json($string): bool {
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }
}
