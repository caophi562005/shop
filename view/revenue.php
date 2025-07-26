<?php include 'inc/header.php'; ?>
<link href="view/css/revenue.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap" rel="stylesheet" />
<div class="header-spacer"></div>
<div class="container">
    <h1>Thống kê doanh thu</h1>

    <div class="header-info">
        <div class="grand-total">
            Tổng doanh thu (<span id="labelMode">Ngày</span>):
            <strong id="totalDisplay">0 VNĐ</strong>
        </div>
        <div class="period-info"><span id="periodValue"></span></div>
    </div>



    <!-- Daily -->
    <div class="card section" id="daily-section">
        <h2>Doanh thu <span>theo ngày</span></h2>

        <canvas id="chartDaily"></canvas>
    </div>

    <!-- Monthly -->
    <div class="card section" id="monthly-section" style="display:none">
        <h2>Doanh thu <span>theo tháng</span></h2>

        <canvas id="chartMonthly"></canvas>
    </div>

    <!-- Yearly -->
    <div class="card section" id="yearly-section" style="display:none">
        <h2>Doanh thu <span>theo năm</span></h2>

        <canvas id="chartYearly"></canvas>
    </div>
</div>

<script>
function formatNumber(x) {
    return new Intl.NumberFormat('vi-VN').format(x).replace(/\./g, ',');
}

const labelsD = <?= json_encode($labelsD) ?>,
    dataD = <?= json_encode($dataD) ?>;
const labelsM = <?= json_encode($labelsM) ?>,
    dataM = <?= json_encode($dataM) ?>;
const labelsY = <?= json_encode($labelsY) ?>,
    dataY = <?= json_encode($dataY) ?>;

let currentChart;
const labelMode = document.getElementById('labelMode'),
    totalDisplay = document.getElementById('totalDisplay'),
    periodValue = document.getElementById('periodValue');

function clearChart() {
    if (currentChart) currentChart.destroy();
}

function drawChart() {
    clearChart();
    const mode = document.getElementById('chartSelect').value,
        type = document.getElementById('chartType').value;
    ['daily', 'monthly', 'yearly'].forEach(v => {
        document.getElementById(v + '-section').style.display = (v === mode ? 'block' : 'none');
    });

    let labels, data, ctx, periodStr, sum = 0;
    if (mode === 'daily') {
        labels = labelsD;
        data = dataD;
        ctx = document.getElementById('chartDaily').getContext('2d');
        labelMode.textContent = 'Ngày';
        const key = new Date().toISOString().slice(0, 10);
        periodStr = new Date().toLocaleDateString('vi-VN');
        const idx = labels.indexOf(key);
        sum = idx >= 0 ? data[idx] : 0;
    }
    if (mode === 'monthly') {
        labels = labelsM;
        data = dataM;
        ctx = document.getElementById('chartMonthly').getContext('2d');
        labelMode.textContent = 'Tháng';
        const now = new Date(),
            key = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}`;
        periodStr = `${now.getMonth()+1}/${now.getFullYear()}`;
        const idx = labels.indexOf(key);
        sum = idx >= 0 ? data[idx] : 0;
    }
    if (mode === 'yearly') {
        labels = labelsY;
        data = dataY;
        ctx = document.getElementById('chartYearly').getContext('2d');
        labelMode.textContent = 'Năm';
        const key = `${new Date().getFullYear()}`;
        periodStr = key;
        const idx = labels.indexOf(key);
        sum = idx >= 0 ? data[idx] : 0;
    }

    periodValue.textContent = periodStr;
    totalDisplay.textContent = formatNumber(sum) + ' VNĐ';

    let datasets = [{
        label: 'Doanh thu',
        data,
        fill: true,
        borderColor: '#ff6f00',
        backgroundColor: 'rgba(255,111,0,0.2)',
        tension: 0.3
    }];
    if (['pie', 'doughnut'].includes(type)) {
        datasets[0].backgroundColor = data.map(_ => `hsl(${Math.random()*360},70%,70%)`);
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            mode: 'nearest',
            intersect: true
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: ctx => `${ctx.label||''}: ${formatNumber(ctx.raw)} VNĐ`
                }
            },
            legend: {
                labels: {
                    color: '#333'
                }
            }
        },
        animation: {
            duration: 800,
            easing: 'easeOutQuart'
        },
        scales: {
            x: {
                ticks: {
                    color: '#333',
                    callback: function(value, index, ticks) {
                        const label = this.getLabelForValue(value);
                        // Ngày
                        if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
                            const [y, m, d] = label.split('-');
                            return `${d}/${parseInt(m)}/${y}`;
                        }
                        // Tháng
                        if (/^\d{4}\/\d{2}$/.test(label)) {
                            const [y, m] = label.split('/');
                            return `${parseInt(m)}/${y}`;
                        }
                        return label;
                    }
                },
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },

            y: {
                ticks: {
                    color: '#333',
                    callback: v => formatNumber(v)
                },
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            }
        }
    };
    if (['pie', 'doughnut'].includes(type)) delete options.scales;

    currentChart = new Chart(ctx, {
        type,
        data: {
            labels,
            datasets
        },
        options
    });
}

window.onload = drawChart;

function exportExcel() {
    const mode = document.getElementById('chartSelect').value,
        period = periodValue.textContent;
    if (!period) return alert('Chưa có dữ liệu để xuất!');
    let sum = 0;
    if (mode === 'daily') {
        const key = new Date().toISOString().slice(0, 10),
            idx = labelsD.indexOf(key);
        sum = idx >= 0 ? dataD[idx] : 0;
    }
    if (mode === 'monthly') {
        const now = new Date(),
            key = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}`,
            idx = labelsM.indexOf(key);
        sum = idx >= 0 ? dataM[idx] : 0;
    }
    if (mode === 'yearly') {
        const key = `${new Date().getFullYear()}`,
            idx = labelsY.indexOf(key);
        sum = idx >= 0 ? dataY[idx] : 0;
    }
    const formatted = formatNumber(sum) + ' VNĐ',
        header = mode === 'daily' ? 'Ngày' : mode === 'monthly' ? 'Tháng' : 'Năm',
        aoa = [
            [header, 'Doanh thu (VNĐ)'],
            [period, formatted]
        ],
        ws = XLSX.utils.aoa_to_sheet(aoa),
        wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `DoanhThu_${mode}`);
    XLSX.writeFile(wb, `DoanhThu_${mode}_${new Date().toISOString().slice(0,19)
        .replace(/[:-]/g,'').replace('T','_')}.xlsx`);
}
</script>

<?php include 'inc/footer.php'; ?>