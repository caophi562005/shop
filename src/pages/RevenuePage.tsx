import React, { useState, useMemo, useEffect } from "react";
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
import http from "../api/http";

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

// Định nghĩa kiểu dữ liệu cho API response
interface OrderData {
  id: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  revenue: OrderData[];
}

// Hàm định dạng tiền tệ VNĐ
const formatVNCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Hàm xử lý dữ liệu API thành format phù hợp cho biểu đồ
const processRevenueData = (orders: OrderData[], mode: ChartMode) => {
  const processedData: { [key: string]: number } = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    let key = "";

    switch (mode) {
      case "daily":
        key = date.toISOString().slice(0, 10); // YYYY-MM-DD
        break;
      case "monthly":
        key = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`; // YYYY/MM
        break;
      case "yearly":
        key = `${date.getFullYear()}`; // YYYY
        break;
    }

    if (!processedData[key]) {
      processedData[key] = 0;
    }
    processedData[key] += order.totalPrice;
  });

  // Sắp xếp theo thời gian
  const sortedKeys = Object.keys(processedData).sort();
  const labels = sortedKeys;
  const data = sortedKeys.map((key) => processedData[key]);

  return { labels, data };
};

const RevenuePage: React.FC = () => {
  const [mode, setMode] = useState<ChartMode>("daily");
  const [type, setType] = useState<ChartType>("line");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await http.get("/order-revenue");

        const data: ApiResponse = await response.data;
        setOrders(data.revenue);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu"
        );
        console.error("Error fetching revenue data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  // Dùng useMemo để tính toán dữ liệu một cách hiệu quả khi 'mode' hoặc 'orders' thay đổi
  const { labels, data, periodLabel, totalRevenue, periodValue } =
    useMemo(() => {
      if (orders.length === 0) {
        return {
          labels: [],
          data: [],
          periodLabel: "Ngày",
          totalRevenue: 0,
          periodValue: "",
        };
      }

      const now = new Date();
      const processedData = processRevenueData(orders, mode);

      let currentPeriodLabel = "";
      let currentTotalRevenue = 0;
      let currentPeriodValue = "";

      switch (mode) {
        case "monthly":
          currentPeriodLabel = "Tháng";
          const monthKey = `${now.getFullYear()}/${String(
            now.getMonth() + 1
          ).padStart(2, "0")}`;
          const monthIndex = processedData.labels.indexOf(monthKey);
          currentTotalRevenue =
            monthIndex >= 0 ? processedData.data[monthIndex] : 0;
          currentPeriodValue = `${now.getMonth() + 1}/${now.getFullYear()}`;
          break;
        case "yearly":
          currentPeriodLabel = "Năm";
          const yearKey = `${now.getFullYear()}`;
          const yearIndex = processedData.labels.indexOf(yearKey);
          currentTotalRevenue =
            yearIndex >= 0 ? processedData.data[yearIndex] : 0;
          currentPeriodValue = yearKey;
          break;
        case "daily":
        default:
          currentPeriodLabel = "Ngày";
          const dayKey = now.toISOString().slice(0, 10);
          const dayIndex = processedData.labels.indexOf(dayKey);
          currentTotalRevenue =
            dayIndex >= 0 ? processedData.data[dayIndex] : 0;
          currentPeriodValue = now.toLocaleDateString("vi-VN");
          break;
      }

      return {
        labels: processedData.labels,
        data: processedData.data,
        periodLabel: currentPeriodLabel,
        totalRevenue: currentTotalRevenue,
        periodValue: currentPeriodValue,
      };
    }, [mode, orders]);

  // Ghi nhớ các tùy chọn biểu đồ để không phải tạo lại mỗi lần render
  const chartOptions = useMemo(() => {
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

    if (type === "line" || type === "bar") {
      options.scales = {
        x: {
          ticks: {
            color: "#333",
            callback: function (value: number) {
              const label = labels[value];
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
  }, [type, labels]);

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

    // Thêm tất cả dữ liệu vào Excel
    labels.forEach((label, index) => {
      aoa.push([label, data[index]]);
    });

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
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            fontSize: "1.2rem",
            color: "#666",
          }}
        >
          Đang tải dữ liệu...
        </div>
      );
    }

    if (error) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            fontSize: "1.1rem",
            color: "#ff5252",
            textAlign: "center",
          }}
        >
          <div>
            <p>Lỗi tải dữ liệu: {error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#ff6f00",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    if (labels.length === 0) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            fontSize: "1.1rem",
            color: "#666",
          }}
        >
          Không có dữ liệu để hiển thị
        </div>
      );
    }

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
              disabled={loading}
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
              disabled={loading}
            >
              <option value="daily">Ngày</option>
              <option value="monthly">Tháng</option>
              <option value="yearly">Năm</option>
            </select>
          </div>
          <div className="btn-group">
            <button
              className="btn btn-export"
              onClick={handleExportExcel}
              disabled={loading || labels.length === 0}
            >
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
