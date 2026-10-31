/**
 * In-Memory Translation Cache with TTL and Performance Metrics Tracking
 */
class TranslationCache {
  constructor(maxSize = 1000, defaultTtlMs = 30 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      savedLatencyMs: 0,
      createdTimestamp: Date.now(),
    };
  }

  generateKey({ text, sourceLanguage = 'auto', targetLanguage = 'en', mode = 'standard', formality = 'auto', speedMode = 'balanced' }) {
    const normalizedText = (text || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const src = (sourceLanguage || 'auto').toLowerCase();
    const tgt = (targetLanguage || 'en').toLowerCase();
    const m = (mode || 'standard').toLowerCase();
    const f = (formality || 'auto').toLowerCase();
    const sm = (speedMode || 'balanced').toLowerCase();
    return `${src}:${tgt}:${m}:${f}:${sm}:${normalizedText}`;
  }

  get(key) {
    this.stats.totalRequests++;
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    // Estimate ~1800ms saved per cache hit compared to an external AI API call
    this.stats.savedLatencyMs += 1800;

    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    if (this.cache.size >= this.maxSize) {
      // Evict oldest entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      cachedAt: Date.now(),
    });
  }

  getStats() {
    const total = this.stats.totalRequests || 1;
    const hitRate = ((this.stats.hits / total) * 100).toFixed(1);
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests: this.stats.totalRequests,
      hitRatePercent: parseFloat(hitRate),
      savedLatencySeconds: (this.stats.savedLatencyMs / 1000).toFixed(2),
      uptimeSeconds: Math.floor((Date.now() - this.stats.createdTimestamp) / 1000),
    };
  }

  clear() {
    this.cache.clear();
  }
}

export const translationCache = new TranslationCache();
