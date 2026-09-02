<?php

namespace App\Domains\Operations\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateSetting extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Parse template content replacing {{variable}} placeholders with provided data.
     */
    public function render(array $data): string
    {
        $content = $this->content_pattern;
        foreach ($data as $key => $value) {
            $content = str_replace('{{' . $key . '}}', (string)$value, $content);
        }
        return $content;
    }
}
