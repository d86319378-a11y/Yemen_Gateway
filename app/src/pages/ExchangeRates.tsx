import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

type RateItem = {
  rate: number;
  updated_at: string;
};

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<Record<string, RateItem>>({});
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/currency/rates`, {
        headers: {
          'X-API-Key': localStorage.getItem('yg_api_key') || '',
        },
      });

      const data = await res.json();

      if (data.success) {
        setRates(data.data || {});
      } else {
        alert(data.error || 'فشل تحميل أسعار الصرف');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أسعار الصرف</h1>
          <p className="text-sm text-muted-foreground mt-1">
            أسعار العملات مقابل الريال اليمني
          </p>
        </div>

        <Button onClick={fetchRates} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جار التحميل...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(rates).map(([pair, item]) => (
            <Card key={pair}>
              <CardContent className="p-5">
                <div className="text-sm text-muted-foreground">{pair}</div>
                <div className="text-3xl font-bold mt-2">
                  {Number(item.rate).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  آخر تحديث: {new Date(item.updated_at).toLocaleString('ar-YE')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
