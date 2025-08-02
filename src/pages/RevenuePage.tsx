import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import * as XLSX from "xlsx";
import "../assets/css/revenue.css";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Định nghĩa các kiểu dữ liệu cho rõ ràng
type ChartMode = "daily" | "monthly" | "yearly";
type ChartType = "line" | "bar" | "pie" | "doughnut";

// --- DỮ LIỆU GIẢ (thay thế cho dữ liệu từ PHP) ---
const mockDailyData = {
  labels: [
    "2025-07-28",
    "2025-07-29",
    "2025-07-30",
    "2025-07-31",
    "2025-08-01",
  ],
  data: [1200000, 1900000, 3000000, 2500000, 4200000],
};
const mockMonthlyData = {
  labels: ["2025/06", "2025/07", "2025/08"],
  data: [45000000, 78000000, 92000000],
};
const mockYearlyData = {
  labels: ["2023", "2024", "2025"],
  data: [850000000, 1100000000, 1500000000],
};
// --- HẾT DỮ LIỆU GIẢ ---

// Hàm định dạng tiền tệ VNĐ
const formatVNCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const RevenuePage: React.FC = () => {
  const [mode, setMode] = useState<ChartMode>("daily");
  const [type, setType] = useState<ChartType>("line");

  // Dùng useMemo để tính toán dữ liệu một cách hiệu quả khi 'mode' thay đổi
  const { labels, data, periodLabel, totalRevenue, periodValue } =
    useMemo(() => {
      // Vì hôm nay là ngày 1 tháng 8 năm 2025, ta sẽ dùng ngày này làm ngày hiện tại
      const now = new Date("2025-08-01T10:00:00");
      let currentLabels: string[] = [],
        currentData: number[] = [],
        currentPeriodLabel = "",
        currentTotalRevenue = 0,
        currentPeriodValue = "";

      switch (mode) {
        case "monthly":
          currentLabels = mockMonthlyData.labels;
          currentData = mockMonthlyData.data;
          currentPeriodLabel = "Tháng";
          const monthKey = `${now.getFullYear()}/${String(
            now.getMonth() + 1
          ).padStart(2, "0")}`;
          const monthIndex = currentLabels.indexOf(monthKey);
          currentTotalRevenue = monthIndex >= 0 ? currentData[monthIndex] : 0;
          currentPeriodValue = `${now.getMonth() + 1}/${now.getFullYear()}`;
          break;
        case "yearly":
          currentLabels = mockYearlyData.labels;
          currentData = mockYearlyData.data;
          currentPeriodLabel = "Năm";
          const yearKey = `${now.getFullYear()}`;
          const yearIndex = currentLabels.indexOf(yearKey);
          currentTotalRevenue = yearIndex >= 0 ? currentData[yearIndex] : 0;
          currentPeriodValue = yearKey;
          break;
        case "daily":
        default:
          currentLabels = mockDailyData.labels;
          currentData = mockDailyData.data;
          currentPeriodLabel = "Ngày";
          const dayKey = now.toISOString().slice(0, 10); // Định dạng: YYYY-MM-DD
          const dayIndex = currentLabels.indexOf(dayKey);
          currentTotalRevenue = dayIndex >= 0 ? currentData[dayIndex] : 0;
          currentPeriodValue = now.toLocaleDateString("vi-VN");
          break;
      }
      return {
        labels: currentLabels,
        data: currentData,
        periodLabel: currentPeriodLabel,
        totalRevenue: currentTotalRevenue,
        periodValue: currentPeriodValue,
      };
    }, [mode]);

  // Ghi nhớ các tùy chọn biểu đồ để không phải tạo lại mỗi lần render
  const chartOptions = useMemo(() => {
    // **SỬA LỖI 1:** Tạo một đối tượng options cơ bản
    // Dùng 'any' để TypeScript cho phép thêm thuộc tính 'scales' một cách linh động
    const options: any = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: true },
      plugins: {
        legend: { labels: { color: "#333" } },
        tooltip: {
          callbacks: {
            label: (context: any) =>
              `${context.label || ""}: ${new Intl.NumberFormat("vi-VN").format(
                context.raw as number
              )} VNĐ`,
          },
        },
      },
      animation: { duration: 800, easing: "easeOutQuart" },
    };

    // **SỬA LỖI 1 (tiếp):** Chỉ thêm 'scales' khi cần thiết
    if (type === "line" || type === "bar") {
      options.scales = {
        x: {
          ticks: {
            color: "#333",
            // **SỬA LỖI 2:** Dùng index thay vì 'this'
            callback: function (value: number) {
              const label = labels[value]; // Lấy nhãn trực tiếp từ mảng 'labels'
              if (!label) return "";
              if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
                // Ngày
                const [y, m, d] = label.split("-");
                return `${d}/${parseInt(m)}/${y}`;
              }
              if (/^\d{4}\/\d{2}$/.test(label)) {
                // Tháng
                const [y, m] = label.split("/");
                return `${parseInt(m)}/${y}`;
              }
              return label;
            },
          },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
        y: {
          ticks: {
            color: "#333",
            callback: (value: any) =>
              new Intl.NumberFormat("vi-VN").format(value as number),
          },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      };
    }
    return options;
  }, [type, labels]); // Thêm 'labels' vào dependency array vì callback cần nó

  // Ghi nhớ đối tượng dữ liệu biểu đồ
  const chartData = useMemo(() => {
    const isPieOrDoughnut = type === "pie" || type === "doughnut";
    return {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data,
          fill: true,
          borderColor: isPieOrDoughnut ? undefined : "#ff6f00",
          backgroundColor: isPieOrDoughnut
            ? data.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`)
            : "rgba(255, 111, 0, 0.2)",
          tension: 0.3,
        },
      ],
    };
  }, [labels, data, type]);

  const handleExportExcel = () => {
    const aoa = [
      ["Thống kê theo", periodLabel],
      [periodLabel, "Doanh thu"],
      [periodValue, totalRevenue],
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 20 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `DoanhThu_${mode}`);
    const fileName = `DoanhThu_${mode}_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "")
      .replace("T", "_")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const renderChart = () => {
    switch (type) {
      case "bar":
        return <Bar options={chartOptions} data={chartData} />;
      case "pie":
        return <Pie options={chartOptions} data={chartData} />;
      case "doughnut":
        return <Doughnut options={chartOptions} data={chartData} />;
      case "line":
      default:
        return <Line options={chartOptions} data={chartData} />;
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <div className="header-spacer"></div>
      <div className="container">
        <h1>Thống kê doanh thu</h1>
        <div className="header-info">
          <div className="grand-total">
            Tổng doanh thu ({periodLabel}):{" "}
            <strong>{formatVNCurrency(totalRevenue)}</strong>
          </div>
          <div className="period-info">
            <span>{periodValue}</span>
          </div>
        </div>
        <div className="controls">
          <div className="control-group">
            <label htmlFor="chartType">Loại biểu đồ</label>
            <select
              id="chartType"
              value={type}
              onChange={(e) => setType(e.target.value as ChartType)}
            >
              <option value="line">Đường</option>
              <option value="bar">Cột</option>
              <option value="pie">Tròn</option>
              <option value="doughnut">Donut</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="chartSelect">Thống kê theo</label>
            <select
              id="chartSelect"
              value={mode}
              onChange={(e) => setMode(e.target.value as ChartMode)}
            >
              <option value="daily">Ngày</option>
              <option value="monthly">Tháng</option>
              <option value="yearly">Năm</option>
            </select>
          </div>
          <div className="btn-group">
            <button className="btn btn-export" onClick={handleExportExcel}>
              <span className="icon">📊</span>
              <span>Xuất Excel</span>
            </button>
            <a href="/" className="btn btn-home">
              <span className="icon">🏠</span>
              <span>Về trang chủ</span>
            </a>
          </div>
        </div>
        <div className="card section">
          <h2>
            Doanh thu <span>theo {periodLabel.toLowerCase()}</span>
          </h2>
          <div className="chart-container">{renderChart()}</div>
        </div>
      </div>
    </>
  );
};

export default RevenuePage;
