
"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export function PieProgress({
  available,
  reading,
  done,
}: {
  available: number;
  reading: number;
  done: number;
}) {
  const total = Math.max(1, available + reading + done);

  const data = {
    labels: ["פנוי", "בקריאה", "נקרא"],
    datasets: [
      {
        data: [available, reading, done],
        // Colors are OK to set (user asked for white/orange/green states)
        backgroundColor: ["#ffffff", "#f97316", "#22c55e"],
        borderColor: ["#000000", "#000000", "#000000"],
        borderWidth: 1,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        rtl: true,
        textDirection: "rtl",
        labels: { color: "#e5e5e5" },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const v = ctx.raw ?? 0;
            const pct = Math.round((v / total) * 100);
            return `${ctx.label}: ${v} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 shadow">
      <div className="mb-2 flex items-baseline justify-between">
        <div className="text-lg font-semibold">התקדמות הקריאה</div>
        <div className="text-sm text-neutral-300">{Math.round((done / total) * 100)}% נקרא</div>
      </div>
      <div className="relative h-44 w-full">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-neutral-800 py-2">
          <div className="font-semibold text-white">{available}</div>
          <div className="text-neutral-300">פנוי</div>
        </div>
        <div className="rounded-xl bg-neutral-800 py-2">
          <div className="font-semibold text-orange-400">{reading}</div>
          <div className="text-neutral-300">בקריאה</div>
        </div>
        <div className="rounded-xl bg-neutral-800 py-2">
          <div className="font-semibold text-green-400">{done}</div>
          <div className="text-neutral-300">נקרא</div>
        </div>
      </div>
    </div>
  );
}
