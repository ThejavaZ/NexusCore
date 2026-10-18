<?php

namespace App\Services;

use App\Models\Repair;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailApiService
{
    private $apiKey;

    private $fromEmail;

    private $fromName;

    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.resend.api_key');
        $this->fromEmail = config('services.resend.from_email');
        $this->fromName = config('services.resend.from_name', 'NexusCore');
        $this->baseUrl = 'https://api.resend.com';
    }

    public function sendEmail(
        string $to,
        string $subject,
        string $htmlContent,
        ?string $textContent = null,
        array $attachments = []
    ): array {
        try {
            if (empty($this->apiKey)) {
                throw new Exception('API key de Resend no configurada');
            }

            $payload = [
                'from' => "{$this->fromName} <{$this->fromEmail}>",
                'to' => [$to],
                'subject' => $subject,
                'html' => $htmlContent,
            ];

            if ($textContent) {
                $payload['text'] = $textContent;
            }
            if (! empty($attachments)) {
                $payload['attachments'] = $this->formatAttachments($attachments);
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/emails", $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Correo enviado exitosamente',
                    'email_id' => $response->json()['id'] ?? null,
                ];
            }

            return [
                'success' => false,
                'message' => 'Error al enviar el correo',
                'error' => $response->json(),
            ];

        } catch (Exception $e) {
            Log::error('Error enviando correo: '.$e->getMessage());

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    // =============================================
    // REPARACIONES
    // =============================================

    /**
     * Correo de confirmación cuando se registra una nueva reparación.
     */
    public function sendRegistrationEmail(Repair $repair): array
    {
        $estimatedCost = $repair->estimated_cost
            ? '$'.number_format((float) $repair->estimated_cost, 2)
            : 'Por determinar';

        $estimatedDelivery = $repair->estimated_delivery
            ? $repair->estimated_delivery->format('d/m/Y')
            : 'Por determinar';

        $html = "
        <!DOCTYPE html>
        <html>
        <body style='margin:0; padding:0; font-family: Arial, sans-serif; background:#f3f4f6;'>
            <div style='max-width:600px; margin:0 auto; padding:20px;'>

                <!-- Header -->
                <div style='background:#4F46E5; color:white; padding:30px; text-align:center; border-radius:8px 8px 0 0;'>
                    <div style='font-size:40px; margin-bottom:8px;'>🔧</div>
                    <h1 style='margin:0; font-size:22px;'>Reparación Registrada</h1>
                    <p style='margin:6px 0 0; opacity:0.85; font-size:15px;'>Hemos recibido tu equipo correctamente</p>
                </div>

                <!-- Body -->
                <div style='background:white; padding:30px;'>
                    <p style='font-size:16px; color:#374151;'>Hola <strong>{$repair->customer_name}</strong>,</p>
                    <p style='color:#6B7280;'>Tu solicitud de reparación ha sido registrada en nuestro sistema. A continuación encontrarás el resumen:</p>

                    <!-- Número de reparación destacado -->
                    <div style='background:#EEF2FF; border-left:4px solid #4F46E5; padding:16px; margin:20px 0; border-radius:0 6px 6px 0;'>
                        <p style='margin:0; color:#4F46E5; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.08em;'>Número de reparación</p>
                        <p style='margin:6px 0 0; color:#1E1B4B; font-size:28px; font-weight:bold; letter-spacing:0.1em;'>{$repair->repair_number}</p>
                    </div>

                    <!-- Detalles del equipo -->
                    <h3 style='color:#374151; font-size:13px; text-transform:uppercase; letter-spacing:0.05em; margin:24px 0 12px;'>📱 Detalle del equipo</h3>
                    <table style='width:100%; border-collapse:collapse;'>
                        <tr style='border-bottom:1px solid #F3F4F6;'>
                            <td style='padding:10px 0; color:#9CA3AF; font-size:13px; width:40%;'>Tipo de dispositivo</td>
                            <td style='padding:10px 0; color:#111827; font-size:14px; font-weight:600;'>{$repair->device_type}</td>
                        </tr>
                        <tr style='border-bottom:1px solid #F3F4F6;'>
                            <td style='padding:10px 0; color:#9CA3AF; font-size:13px;'>Marca / Modelo</td>
                            <td style='padding:10px 0; color:#111827; font-size:14px; font-weight:600;'>{$repair->brand} {$repair->model}</td>
                        </tr>
                        <tr style='border-bottom:1px solid #F3F4F6;'>
                            <td style='padding:10px 0; color:#9CA3AF; font-size:13px;'>Problema reportado</td>
                            <td style='padding:10px 0; color:#111827; font-size:14px;'>{$repair->issue_description}</td>
                        </tr>
                        <tr style='border-bottom:1px solid #F3F4F6;'>
                            <td style='padding:10px 0; color:#9CA3AF; font-size:13px;'>Costo estimado</td>
                            <td style='padding:10px 0; color:#111827; font-size:14px; font-weight:600;'>{$estimatedCost}</td>
                        </tr>
                        <tr>
                            <td style='padding:10px 0; color:#9CA3AF; font-size:13px;'>Entrega estimada</td>
                            <td style='padding:10px 0; color:#111827; font-size:14px; font-weight:600;'>{$estimatedDelivery}</td>
                        </tr>
                    </table>

                    <p style='color:#6B7280; font-size:13px; margin-top:24px;'>
                        Te notificaremos por correo cada vez que el estado de tu reparación cambie.<br>
                        Si tienes preguntas, no dudes en contactarnos.
                    </p>
                </div>

                <!-- Footer -->
                <div style='background:#F9FAFB; padding:20px; text-align:center; border-radius:0 0 8px 8px; border-top:1px solid #E5E7EB;'>
                    <p style='margin:0; color:#9CA3AF; font-size:12px;'>{$this->fromName} &mdash; Todos los derechos reservados</p>
                </div>

            </div>
        </body>
        </html>";

        return $this->sendEmail(
            $repair->customer_email,
            "Reparación {$repair->repair_number} registrada — {$this->fromName}",
            $html
        );
    }

    /**
     * Correo de notificación cuando el estado de una reparación cambia.
     */
    public function sendStatusChangeEmail(Repair $repair, string $previousStatus, string $newStatus): array
    {
        $statusConfig = [
            'pending' => ['label' => 'Pendiente',     'color' => '#D97706', 'bg' => '#FFFBEB', 'icon' => '⏳'],
            'diagnosed' => ['label' => 'Diagnosticada', 'color' => '#2563EB', 'bg' => '#EFF6FF', 'icon' => '🔍'],
            'approved' => ['label' => 'Aprobada',      'color' => '#7C3AED', 'bg' => '#F5F3FF', 'icon' => '✅'],
            'in_progress' => ['label' => 'En Progreso',   'color' => '#EA580C', 'bg' => '#FFF7ED', 'icon' => '🔧'],
            'completed' => ['label' => 'Completada',    'color' => '#16A34A', 'bg' => '#F0FDF4', 'icon' => '🎉'],
            'delivered' => ['label' => 'Entregada',     'color' => '#374151', 'bg' => '#F9FAFB', 'icon' => '📦'],
            'cancelled' => ['label' => 'Cancelada',     'color' => '#DC2626', 'bg' => '#FEF2F2', 'icon' => '❌'],
        ];

        $prev = $statusConfig[$previousStatus] ?? ['label' => $previousStatus, 'color' => '#6B7280', 'bg' => '#F9FAFB', 'icon' => '•'];
        $current = $statusConfig[$newStatus] ?? ['label' => $newStatus,      'color' => '#6B7280', 'bg' => '#F9FAFB', 'icon' => '•'];

        $finalCostRow = $repair->final_cost
            ? "<tr><td style='padding:10px 0; color:#9CA3AF; font-size:13px;'>Costo final</td><td style='padding:10px 0; color:#111827; font-size:14px; font-weight:700;'>\$".number_format((float) $repair->final_cost, 2).'</td></tr>'
            : '';

        $html = "
        <!DOCTYPE html>
        <html>
        <body style='margin:0; padding:0; font-family: Arial, sans-serif; background:#f3f4f6;'>
            <div style='max-width:600px; margin:0 auto; padding:20px;'>

                <!-- Header con color dinámico según el nuevo estado -->
                <div style='background:{$current['color']}; color:white; padding:30px; text-align:center; border-radius:8px 8px 0 0;'>
                    <div style='font-size:40px; margin-bottom:8px;'>{$current['icon']}</div>
                    <h1 style='margin:0; font-size:22px;'>Estado Actualizado</h1>
                    <p style='margin:6px 0 0; opacity:0.85; font-size:15px;'>Tu reparación ha cambiado de estado</p>
                </div>

                <!-- Body -->
                <div style='background:white; padding:30px;'>
                    <p style='font-size:16px; color:#374151;'>Hola <strong>{$repair->customer_name}</strong>,</p>
                    <p style='color:#6B7280;'>Te informamos que el estado de tu reparación <strong>{$repair->repair_number}</strong> ha sido actualizado.</p>

                    <!-- Visualización del cambio de estado -->
                    <div style='background:#F9FAFB; border-radius:8px; padding:20px; margin:20px 0; text-align:center;'>
                        <div style='display:inline-block; margin-right:8px; vertical-align:middle;'>
                            <p style='margin:0 0 4px; font-size:11px; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.05em;'>Antes</p>
                            <span style='display:inline-block; padding:6px 14px; background:{$prev['bg']}; color:{$prev['color']}; border-radius:999px; font-size:13px; font-weight:600;'>
                                {$prev['icon']} {$prev['label']}
                            </span>
                        </div>
                        <span style='display:inline-block; vertical-align:middle; font-size:20px; color:#9CA3AF; margin:0 8px;'>→</span>
                        <div style='display:inline-block; margin-left:8px; vertical-align:middle;'>
                            <p style='margin:0 0 4px; font-size:11px; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.05em;'>Ahora</p>
                            <span style='display:inline-block; padding:6px 14px; background:{$current['bg']}; color:{$current['color']}; border-radius:999px; font-size:13px; font-weight:700; border:1px solid {$current['color']};'>
                                {$current['icon']} {$current['label']}
                            </span>
                        </div>
                    </div>

                    <!-- Detalles del equipo -->
                    <h3 style='color:#374151; font-size:13px; text-transform:uppercase; letter-spacing:0.05em; margin:24px 0 12px;'>📱 Tu equipo</h3>
                    <table style='width:100%; border-collapse:collapse;'>
                        <tr style='border-bottom:1px solid #F3F4F6;'>
                            <td style='padding:10px 0; color:#9CA3AF; font-size:13px; width:40%;'>Dispositivo</td>
                            <td style='padding:10px 0; color:#111827; font-size:14px; font-weight:600;'>{$repair->device_type} — {$repair->brand} {$repair->model}</td>
                        </tr>
                        <tr style='border-bottom:1px solid #F3F4F6;'>
                            <td style='padding:10px 0; color:#9CA3AF; font-size:13px;'>Número de reparación</td>
                            <td style='padding:10px 0; color:#111827; font-size:14px; font-weight:700; letter-spacing:0.05em;'>{$repair->repair_number}</td>
                        </tr>
                        {$finalCostRow}
                    </table>

                    <p style='color:#6B7280; font-size:13px; margin-top:24px;'>
                        Si tienes alguna pregunta sobre este cambio, no dudes en contactarnos respondiendo este correo.
                    </p>
                </div>

                <!-- Footer -->
                <div style='background:#F9FAFB; padding:20px; text-align:center; border-radius:0 0 8px 8px; border-top:1px solid #E5E7EB;'>
                    <p style='margin:0; color:#9CA3AF; font-size:12px;'>{$this->fromName} &mdash; Todos los derechos reservados</p>
                </div>

            </div>
        </body>
        </html>";

        return $this->sendEmail(
            $repair->customer_email,
            "{$current['icon']} Tu reparación {$repair->repair_number} ahora está: {$current['label']}",
            $html
        );
    }

    // =============================================
    // EXISTENTES (sin cambios)
    // =============================================

    public function sendWelcomeEmail(string $to, string $userName): array
    {
        $html = "
        <!DOCTYPE html>
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <div style='background: #4F46E5; color: white; padding: 30px; text-align: center;'>
                    <h1>¡Bienvenido a NexusCore!</h1>
                </div>
                <div style='padding: 30px; background: #f9fafb;'>
                    <h2>Hola {$userName},</h2>
                    <p>Gracias por registrarte. Estamos emocionados de tenerte con nosotros.</p>
                    <a href='".config('app.url')."' style='display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;'>Explorar tienda</a>
                </div>
            </div>
        </body>
        </html>";

        return $this->sendEmail($to, '¡Bienvenido a NexusCore!', $html);
    }

    public function sendOrderConfirmation(string $to, array $orderData): array
    {
        $itemsHtml = '';
        foreach ($orderData['items'] ?? [] as $item) {
            $itemsHtml .= "<tr><td>{$item['name']}</td><td>{$item['quantity']}</td><td>\${$item['price']}</td></tr>";
        }

        $html = "
        <!DOCTYPE html>
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto;'>
                <div style='background: #10B981; color: white; padding: 30px; text-align: center;'>
                    <h1>✓ Orden Confirmada</h1>
                    <p>Orden #{$orderData['order_number']}</p>
                </div>
                <div style='padding: 30px;'>
                    <h2>¡Gracias por tu compra!</h2>
                    <table style='width: 100%; border-collapse: collapse;'>
                        <thead>
                            <tr style='background: #f3f4f6;'>
                                <th style='padding: 12px; text-align: left;'>Producto</th>
                                <th style='padding: 12px; text-align: left;'>Cantidad</th>
                                <th style='padding: 12px; text-align: left;'>Precio</th>
                            </tr>
                        </thead>
                        <tbody>{$itemsHtml}</tbody>
                    </table>
                    <p style='font-size: 20px; font-weight: bold; text-align: right;'>Total: \${$orderData['total']}</p>
                </div>
            </div>
        </body>
        </html>";

        return $this->sendEmail($to, "Confirmación de Orden #{$orderData['order_number']}", $html);
    }

    public function sendInvoiceEmail(string $to, array $invoiceData, ?string $pdfPath = null): array
    {
        $attachments = [];
        if ($pdfPath && file_exists($pdfPath)) {
            $attachments[] = ['path' => $pdfPath, 'filename' => 'factura_'.$invoiceData['invoice_number'].'.pdf'];
        }

        $html = "
        <!DOCTYPE html>
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto;'>
                <div style='background: #6366F1; color: white; padding: 30px; text-align: center;'>
                    <h1>📄 Tu Factura</h1>
                    <p>Factura #{$invoiceData['invoice_number']}</p>
                </div>
                <div style='padding: 30px;'>
                    <p>Tu factura está adjunta a este correo.</p>
                    <div style='background: white; padding: 20px; border: 1px solid #ddd;'>
                        <p><strong>Número:</strong> {$invoiceData['invoice_number']}</p>
                        <p><strong>Fecha:</strong> {$invoiceData['date']}</p>
                        <p><strong>Total:</strong> \${$invoiceData['total']}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>";

        return $this->sendEmail($to, "Factura #{$invoiceData['invoice_number']}", $html, null, $attachments);
    }

    private function formatAttachments(array $attachments): array
    {
        $formatted = [];
        foreach ($attachments as $attachment) {
            if (isset($attachment['path']) && file_exists($attachment['path'])) {
                $formatted[] = [
                    'filename' => $attachment['filename'] ?? basename($attachment['path']),
                    'content' => base64_encode(file_get_contents($attachment['path'])),
                ];
            }
        }

        return $formatted;
    }
}
