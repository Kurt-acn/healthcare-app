import pytest
from app.rag import _has_enough_signal

def test_has_enough_signal_when_no_scores():
    items = [{"score": None}, {"score": None}]
    assert _has_enough_signal(items, 0.2) is True

def test_has_enough_signal_threshold():
    items = [{"score": 0.1}, {"score": 0.25}]
    assert _has_enough_signal(items, 0.2) is True
    assert _has_enough_signal(items, 0.3) is False