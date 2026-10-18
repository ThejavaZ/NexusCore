<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EmailApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected EmailApiService $emailService,
    ) {}

    public function sendWelcome(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
        ]);

        $result = $this->emailService->sendWelcomeEmail($data['email'], $data['name']);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function sendOrderConfirmation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'order_number' => 'required|string',
            'total' => 'required|numeric',
            'items' => 'required|array',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|integer',
            'items.*.price' => 'required|numeric',
        ]);

        $result = $this->emailService->sendOrderConfirmation($data['email'], $data);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    public function sendInvoice(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'invoice_number' => 'required|string',
            'date' => 'required|string',
            'total' => 'required|numeric',
            'pdf_path' => 'nullable|string',
        ]);

        $result = $this->emailService->sendInvoiceEmail(
            $data['email'],
            $data,
            $data['pdf_path'] ?? null
        );

        return response()->json($result, $result['success'] ? 200 : 500);
    }
}
