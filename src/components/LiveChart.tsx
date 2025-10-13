import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LiveChartProps {
  title: string;
  data: Array<Record<string, any>>;
  dataKey: string;
  dataKey2?: string;
  color?: string;
  color2?: string;
  unit?: string;
}

export function LiveChart({ 
  title, 
  data, 
  dataKey, 
  dataKey2, 
  color = '#06b6d4',
  color2 = '#10b981',
  unit 
}: LiveChartProps) {
  return (
    <Card className="card-glow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => [`${value.toFixed(2)}${unit || ''}`, dataKey]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
          {dataKey2 && (
            <Line 
              type="monotone" 
              dataKey={dataKey2} 
              stroke={color2}
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
