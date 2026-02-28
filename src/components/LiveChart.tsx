import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

interface LiveChartProps {
  title: string;
  data: Array<Record<string, any>>;
  dataKey: string;
  dataKey2?: string;
  color?: string;
  color2?: string;
  unit?: string;
}

export function LiveChart({ title, data, dataKey, dataKey2, color = 'hsl(217, 91%, 60%)', color2 = 'hsl(160, 84%, 39%)', unit }: LiveChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="p-5 bg-card border border-border/50">
        <h3 className="text-sm font-semibold mb-4 text-foreground">{title}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              {dataKey2 && (
                <linearGradient id={`grad-${dataKey2}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color2} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color2} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                color: 'hsl(var(--foreground))',
                fontSize: '12px',
                boxShadow: '0 4px 20px hsl(var(--foreground) / 0.1)',
              }}
              formatter={(value: number) => [`${value.toFixed(1)}${unit || ''}`, dataKey]}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} dot={false} animationDuration={300} />
            {dataKey2 && (
              <Area type="monotone" dataKey={dataKey2} stroke={color2} strokeWidth={2} fill={`url(#grad-${dataKey2})`} dot={false} animationDuration={300} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
