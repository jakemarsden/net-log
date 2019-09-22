document.addEventListener("DOMContentLoaded", () => {
    const $trafficChart = document.getElementById("chart_traffic")
    if ($trafficChart !== null) {
        const ctx = $trafficChart.getContext("2d")
        new window.Chart(ctx, window.app.trafficChart)
    }
})
