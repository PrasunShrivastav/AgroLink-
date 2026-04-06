import { useState, useEffect, useRef } from 'react';
import { BASE_PRICES, fluctuate, calcChange } from '@/lib/mandiData';

export function useMandiPrices() {
  const [prices, setPrices] = useState({});
  const [changes, setChanges] = useState({});
  const [flashing, setFlashing] = useState({});
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [source, setSource] = useState('fallback');

  const previousPrices = useRef({});
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function initializePrices() {
      const cacheKey = 'agrolink_mandi_cache';
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { prices: cachedPrices, fetchedAt } = JSON.parse(cached);
          if (Date.now() - fetchedAt < 6 * 60 * 60 * 1000) {
            setPrices(cachedPrices);
            previousPrices.current = cachedPrices;
            setSource('cache');
            setLastUpdated(`Today, ${new Date(fetchedAt).toLocaleTimeString()}`);
            return;
          }
        } catch (e) {}
      }

      let fetchedPrices = {};
      let usedApi = false;

      try {
        const apiKey = process.env.NEXT_PUBLIC_MANDI_API_KEY;
        if (apiKey) {
          const res = await fetch(`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=50`);
          if (res.ok) {
            const data = await res.json();
            // Try to map modal prices for existing crops
            const records = data.records || [];
            Object.keys(BASE_PRICES).forEach(crop => {
              const matched = records.find(r => r.commodity?.toLowerCase() === crop.toLowerCase());
              if (matched && matched.modal_price) {
                fetchedPrices[crop] = Number(matched.modal_price);
              }
            });
            if (Object.keys(fetchedPrices).length > 0) {
              usedApi = true;
            }
          }
        }
      } catch (err) {
        // Fallback silently
      }

      const finalPrices = {};
      Object.keys(BASE_PRICES).forEach(crop => {
        finalPrices[crop] = fetchedPrices[crop] || BASE_PRICES[crop].base;
      });

      setPrices(finalPrices);
      previousPrices.current = finalPrices;
      setSource(usedApi ? 'api' : 'fallback');
      
      const now = Date.now();
      setLastUpdated(`Today, ${new Date(now).toLocaleTimeString()}`);
      
      if (usedApi) {
        localStorage.setItem(cacheKey, JSON.stringify({ prices: finalPrices, fetchedAt: now }));
      }
    }

    initializePrices();
  }, []);

  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    const interval = setInterval(() => {
      setIsLive(true);
      setPrices(currentPrices => {
        const newPrices = {};
        const newChanges = {};
        const newFlashing = {};

        Object.keys(currentPrices).forEach(crop => {
          const newPrice = fluctuate(currentPrices[crop]);
          newPrices[crop] = newPrice;
          newChanges[crop] = calcChange(previousPrices.current[crop] || newPrice, newPrice);
          newFlashing[crop] = true;
        });

        previousPrices.current = newPrices;
        setChanges(newChanges);
        setFlashing(newFlashing);

        setTimeout(() => {
          setFlashing(f => {
            const reset = { ...f };
            Object.keys(reset).forEach(k => reset[k] = false);
            return reset;
          });
        }, 400);

        return newPrices;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [prices]);

  return { prices, changes, flashing, lastUpdated, isLive, source };
}
