import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "./chart.tsx";

import type { ChartConfig } from "./chart.tsx";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "#2563eb",
  },
} satisfies ChartConfig

type chartElement = {
    [key: string]: string | number;
}

export function ExpenseChart(
    {chartData, labelKey}: 
    {
        chartData: chartElement[], 
        labelKey: string
    }
) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] py-12 bg-zinc-900 rounded-xl my-4 p-4">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={ labelKey }
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 30)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
