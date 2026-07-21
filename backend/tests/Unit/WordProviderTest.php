<?php

use App\Services\WordProvider;

it('exposes difficulty length map', function () {
    expect(WordProvider::DIFFICULTY_LENGTHS)->toBe([
        'easy' => 5,
        'medium' => 7,
        'hard' => 10,
    ]);
});
