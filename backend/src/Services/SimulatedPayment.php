<?php
namespace App\Services;

final class SimulatedPayment
{
    public function validate(array $card): array
    {
        $f = [];
        $num = preg_replace('/\D/', '', (string)($card['number'] ?? ''));
        if (strlen($num) < 13 || strlen($num) > 19 || !$this->luhn($num)) $f['card_number'] = 'Invalid card number';
        if (trim((string)($card['name'] ?? '')) === '') $f['name'] = 'Name is required';
        if (!preg_match('#^(0[1-9]|1[0-2])\s*/\s*(\d{2})$#', trim((string)($card['expiry'] ?? '')), $m)) {
            $f['expiry'] = 'Use MM/YY';
        } elseif (((int)$m[2] + 2000) * 100 + (int)$m[1] < (int)date('Ym')) {
            $f['expiry'] = 'Card expired';
        }
        if (!preg_match('/^\d{3,4}$/', (string)($card['cvc'] ?? ''))) $f['cvc'] = 'Invalid CVC';
        return $f;
    }

    /** @return array{ok: bool, error: ?string, reference: ?string} */
    public function charge(array $card, float $amount): array
    {
        $num = preg_replace('/\D/', '', (string)($card['number'] ?? ''));
        if ($num === '4000000000000002') {
            return ['ok' => false, 'error' => 'Your card was declined', 'reference' => null];
        }
        return ['ok' => true, 'error' => null, 'reference' => 'sim_' . bin2hex(random_bytes(6))];
    }

    private function luhn(string $n): bool
    {
        $sum = 0;
        $alt = false;
        for ($i = strlen($n) - 1; $i >= 0; $i--) {
            $d = (int)$n[$i];
            if ($alt) {
                $d *= 2;
                if ($d > 9) $d -= 9;
            }
            $sum += $d;
            $alt = !$alt;
        }
        return $sum % 10 === 0;
    }
}