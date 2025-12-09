'use client';

import { AreaChart, BarChart, LineChart, PolarAngleAxis, RadialBar, RadialBarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Bar, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { EnhancedAqiResponse } from '@/lib/api-client';

interface AqiChartsProps {
    data: EnhancedAqiResponse;
}

export default function AqiCharts({ data }: AqiChartsProps) {
    const hourly = data.hourly || {};
    const daily = data.daily || {};

    // Transform Hourly Data (24h)
    const hourlyData = hourly.time?.slice(0, 24).map((time: string, i: number) => ({
        time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pm25: hourly.pm2_5?.[i] || 0,
        pm10: hourly.pm10?.[i] || 0,
        no2: hourly.nitrogen_dioxide?.[i] || 0,
        o3: hourly.ozone?.[i] || 0,
    })) || [];

    // Transform Daily Data
    const dailyData = daily.time?.map((time: string, i: number) => ({
        date: time,
        pm25: daily.pm2_5?.[i] || 0,
        pm10: daily.pm10?.[i] || 0,
        no2: daily.nitrogen_dioxide?.[i] || 0,
        o3: daily.ozone?.[i] || 0,
    })) || [];

    // Current AQI for Radial
    const currentAqi = data.aqi?.local_epa_aqi?.value || 0;
    const radialChartData = [
        { name: 'AQI', value: Math.min(currentAqi, 500), fill: 'hsl(var(--chart-1))' },
    ];

    // Configs
    const areaChartConfig = {
        pm25: { label: 'PM2.5', color: 'hsl(var(--chart-1))' },
        pm10: { label: 'PM10', color: 'hsl(var(--chart-2))' },
    } satisfies ChartConfig;

    const barChartConfig = {
        o3: { label: 'Ozone (O₃)', color: 'hsl(var(--chart-1))' },
        no2: { label: 'NO₂', color: 'hsl(var(--chart-2))' },
        pm25: { label: 'PM2.5', color: 'hsl(var(--chart-3))' },
    } satisfies ChartConfig;

    const lineChartConfig = {
        pm25: { label: 'PM2.5', color: 'hsl(var(--chart-1))' },
        no2: { label: 'NO₂', color: 'hsl(var(--chart-2))' },
        o3: { label: 'Ozone', color: 'hsl(var(--chart-4))' },
    } satisfies ChartConfig;

    // Determine Radial Color based on AQI
    let radialColor = 'hsl(var(--chart-1))'; // Good
    if (currentAqi > 50) radialColor = 'hsl(var(--chart-2))'; // Moderate
    if (currentAqi > 100) radialColor = 'hsl(var(--chart-3))'; // Unhealthy for Sensitive
    if (currentAqi > 150) radialColor = 'hsl(var(--chart-4))'; // Unhealthy
    if (currentAqi > 200) radialColor = 'hsl(var(--chart-5))'; // Very Unhealthy

    const radialConfig = {
        value: { label: 'AQI', color: radialColor }
    } satisfies ChartConfig;

    // Update payload fill
    radialChartData[0].fill = radialColor;


    if (!hourly.time || hourly.time.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full">
            {/* Hourly Trend Area Chart */}
            <Card className="glass transition-all duration-300 hover:shadow-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                    <CardTitle className="text-xl">Hourly Particulate Matter (24h)</CardTitle>
                    <CardDescription>
                        Comparison of PM2.5 and PM10 concentrations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={areaChartConfig} className="h-64 w-full">
                        <AreaChart data={hourlyData} margin={{ left: -20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} minTickGap={30} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Area type="monotone" dataKey="pm25" stackId="1" stroke="var(--color-pm25)" fill="var(--color-pm25)" fillOpacity={0.4} />
                            <Area type="monotone" dataKey="pm10" stackId="1" stroke="var(--color-pm10)" fill="var(--color-pm10)" fillOpacity={0.4} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Daily Pollutants Bar Chart */}
            <Card className="glass transition-all duration-300 hover:shadow-2xl animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <CardHeader>
                    <CardTitle className="text-xl">Daily Forecast (5 Days)</CardTitle>
                    <CardDescription>
                        Expected levels of key pollutants.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="h-64 w-full">
                        <BarChart data={dailyData} margin={{ left: -20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="o3" fill="var(--color-o3)" radius={4} name="Ozone" />
                            <Bar dataKey="no2" fill="var(--color-no2)" radius={4} name="NO2" />
                            <Bar dataKey="pm25" fill="var(--color-pm25)" radius={4} name="PM2.5" />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Hourly Trend Line Chart */}
            <Card className="glass lg:col-span-2 transition-all duration-300 hover:shadow-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                    <CardTitle className="text-xl">Hourly Gas Pollutants Trend</CardTitle>
                    <CardDescription>
                        24-hour trend for NO2 and Ozone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={lineChartConfig} className="h-64 w-full">
                        <LineChart data={hourlyData} margin={{ left: -20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} minTickGap={30} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line type="monotone" dataKey="no2" stroke="var(--color-no2)" strokeWidth={2} dot={false} name="NO2" />
                            <Line type="monotone" dataKey="o3" stroke="var(--color-o3)" strokeWidth={2} dot={false} name="Ozone" />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Radial AQI Chart */}
            <Card className="glass transition-all duration-300 hover:shadow-2xl animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <CardHeader>
                    <CardTitle className="text-xl">Current AQI Gauge</CardTitle>
                    <CardDescription>
                        Current Air Quality Index Value
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <ChartContainer config={radialConfig} className="h-64 w-64">
                        <RadialBarChart data={radialChartData} startAngle={180} endAngle={0} innerRadius="70%" outerRadius="110%">
                            <PolarAngleAxis type="number" domain={[0, 300]} dataKey="value" tick={false} />
                            <RadialBar background dataKey="value" cornerRadius={10} />
                            <Tooltip content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="p-2 border rounded-lg bg-background/80 glass">
                                            <p className="text-sm font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                            />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
                                {currentAqi}
                            </text>
                        </RadialBarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Placeholder for "Yearly Trends" if strictly needed, but replaced with Hourly Gas Pollutants as better alternative for real data */}
        </div>
    );
}
