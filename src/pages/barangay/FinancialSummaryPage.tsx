import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { getFinancialsByBarangay, computeYTDSummary } from "../../data/financials";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function FinancialSummaryPage() {
  const { user } = useAuth();
  const barangayId = user?.barangayId ?? "brgy-001";
  const year = 2025;

  const records = getFinancialsByBarangay(barangayId, year);
  const ytd = computeYTDSummary(barangayId, year);

  const chartData = records.map((r) => ({
    month: MONTH_LABELS[r.month - 1],
    "Fee Collected": r.feeCollected,
    "Recycling Income": r.recyclingIncome,
    Expenses: r.expenses,
    "Net Balance": r.feeCollected + r.recyclingIncome - r.expenses,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Summary"
        subtitle={`${year} — Waste fee collection, recycling income, and expenditures`}
      />

      {/* YTD Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Fee Collected (YTD)", value: `₱${ytd.totalFeeCollected.toLocaleString()}`, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "Recycling Income (YTD)", value: `₱${ytd.totalRecyclingIncome.toLocaleString()}`, color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Expenses (YTD)", value: `₱${ytd.totalExpenses.toLocaleString()}`, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          {
            label: "Net Balance (YTD)",
            value: `₱${ytd.netBalance.toLocaleString()}`,
            color: ytd.netBalance >= 0 ? "text-green-700" : "text-red-700",
            bg: ytd.netBalance >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Financial Overview</CardTitle>
          <CardDescription>Fee collection, recycling income, and expenses per month</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => [`₱${Number(value).toLocaleString()}`]} />
              <Legend />
              <Bar dataKey="Fee Collected" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Recycling Income" fill="#16a34a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expenses" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Breakdown</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Month</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Fee Collected</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Recycling Income</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Expenses</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Net</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.map((r) => {
                const net = r.feeCollected + r.recyclingIncome - r.expenses;
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{MONTH_LABELS[r.month - 1]} {r.year}</td>
                    <td className="py-3 px-4 text-right text-blue-700 font-semibold">₱{r.feeCollected.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-700 font-semibold">₱{r.recyclingIncome.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-amber-700 font-semibold">₱{r.expenses.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right font-bold ${net >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {net >= 0 ? "+" : ""}₱{net.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 hidden lg:table-cell max-w-xs truncate">{r.notes}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800">YTD Total</td>
                <td className="py-3 px-4 text-right font-bold text-blue-800">₱{ytd.totalFeeCollected.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-green-800">₱{ytd.totalRecyclingIncome.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-amber-800">₱{ytd.totalExpenses.toLocaleString()}</td>
                <td className={`py-3 px-4 text-right font-bold ${ytd.netBalance >= 0 ? "text-green-800" : "text-red-800"}`}>
                  {ytd.netBalance >= 0 ? "+" : ""}₱{ytd.netBalance.toLocaleString()}
                </td>
                <td className="hidden lg:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
