<?php

use App\Services\GameScorer;

it('marks correct letters in correct positions', function () {
    $result = GameScorer::scoreLetters('MAISON', 'MAISON');
    expect($result)->toBe([
        'correct', 'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
});

it('marks absent letters when no letter from guess is in target', function () {
    $result = GameScorer::scoreLetters('XYZWK', 'MAISO');
    expect($result)->toBe([
        'absent', 'absent', 'absent', 'absent', 'absent',
    ]);
});

it('marks letters as present when they exist in target but in wrong position', function () {
    $result = GameScorer::scoreLetters('NOMAS', 'MAISO');
    expect($result)->toBe([
        'absent', 'present', 'present', 'present', 'present',
    ]);
});

it('handles duplicate letters using pool of remaining unmatched target letters', function () {
    $result = GameScorer::scoreLetters('AABBA', 'ABBAZ');
    expect($result)->toBe([
        'correct', 'present', 'correct', 'present', 'absent',
    ]);
});

it('handles case insensitivity', function () {
    $result = GameScorer::scoreLetters('maison', 'MAISON');
    expect($result)->toBe([
        'correct', 'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
});

it('handles partial correct and present in same guess', function () {
    $result = GameScorer::scoreLetters('OISMA', 'MAISO');
    expect($result)->toBe([
        'present', 'present', 'present', 'present', 'present',
    ]);
});

it('detects a win', function () {
    $result = GameScorer::scoreLetters('MAISON', 'MAISON');
    expect(GameScorer::isWin($result))->toBeTrue();
});

it('detects a non-win', function () {
    $result = GameScorer::scoreLetters('MAISON', 'MAISONX');
    expect(GameScorer::isWin($result))->toBeFalse();
});

it('scores wins based on attempts left and difficulty multiplier', function () {
    expect(GameScorer::gameScore(1, 6, 'easy', true))->toBe(600);
    expect(GameScorer::gameScore(6, 6, 'easy', true))->toBe(100);
    expect(GameScorer::gameScore(3, 6, 'medium', true))->toBe(600);
    expect(GameScorer::gameScore(2, 5, 'hard', true))->toBe(800);
});

it('returns 0 for lost games', function () {
    expect(GameScorer::gameScore(6, 6, 'easy', false))->toBe(0);
    expect(GameScorer::gameScore(5, 5, 'hard', false))->toBe(0);
});
