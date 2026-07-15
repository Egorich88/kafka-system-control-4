import fs from "fs";

const FRONTEND_REPO = "egorich27/kafka-control-frontend";
const BACKEND_REPO = "egorich27/kafka-control-backend";

async function fetchRepository(repository) {
    const response = await fetch(
        `https://hub.docker.com/v2/repositories/${repository}/`
    );

    if (!response.ok) {
        throw new Error(`Docker Hub API error: ${repository}`);
    }

    return await response.json();
}

function formatPulls(value) {
    if (value >= 1000000)
        return (value / 1000000).toFixed(1).replace(".0", "") + "M";

    if (value >= 1000)
        return (value / 1000).toFixed(1).replace(".0", "") + "K";

    return value.toString();
}

function relativeTime(dateString) {

    const now = new Date();
    const updated = new Date(dateString);

    const diff = Math.floor((now - updated) / 1000);

    const minute = 60;
    const hour = 3600;
    const day = 86400;

    if (diff < minute)
        return "Updated just now";

    if (diff < hour)
        return `Updated ${Math.floor(diff / minute)} min ago`;

    if (diff < day)
        return `Updated ${Math.floor(diff / hour)} hours ago`;

    return `Updated ${Math.floor(diff / day)} days ago`;
}

const frontend = await fetchRepository(FRONTEND_REPO);

const backend = await fetchRepository(BACKEND_REPO);

const frontendInfo = {
    title: "Frontend",
    repository: `${frontend.namespace}/${frontend.name}`,
    pulls: formatPulls(frontend.pull_count),
    updated: relativeTime(frontend.last_updated),
    accent: "#2EC7FF"
};

const backendInfo = {
    title: "Backend",
    repository: `${backend.namespace}/${backend.name}`,
    pulls: formatPulls(backend.pull_count),
    updated: relativeTime(backend.last_updated),
    accent: "#8B5CF6"
};

const svg = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="1280"
    height="220"
    viewBox="0 0 1280 220">

<defs>

<linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0D1117"/>
    <stop offset="100%" stop-color="#161B22"/>
</linearGradient>

<filter id="shadow">
    <feDropShadow
        dx="0"
        dy="3"
        stdDeviation="6"
        flood-opacity="0.35"/>
</filter>

</defs>

<rect
    x="0"
    y="0"
    width="1280"
    height="270"
    rx="18"
    fill="url(#background)"/>

<!-- HEADER -->

<text
    x="45"
    y="52"
    font-size="34"
    font-family="Segoe UI"
    font-weight="700"
    fill="#2EC7FF">

🐳 Docker Hub

</text>

<text
    x="45"
    y="80"
    font-size="18"
    font-family="Segoe UI"
    fill="#8B949E">

Kafka System Control Official Images

</text>

<line
    x1="40"
    y1="102"
    x2="1240"
    y2="102"
    stroke="#30363D"/>

<!-- FRONTEND -->

<rect
    x="40"
    y="105"
    width="570"
    height="90"
    rx="14"
    fill="#111827"
    stroke="${frontendInfo.accent}"
    stroke-width="2"
    filter="url(#shadow)"/>

<text
    x="65"
    y="132"
    font-size="24"
    font-family="Segoe UI"
    font-weight="700"
    fill="${frontendInfo.accent}">
Frontend
</text>

<text
    x="65"
    y="155"
    font-size="15"
    font-family="Consolas"
    fill="#9CA3AF">
${frontendInfo.repository}
</text>

<text
    x="65"
    y="185"
    font-size="30"
    font-family="Segoe UI"
    font-weight="700"
    fill="#FFFFFF">
⬇ ${frontendInfo.pulls}
</text>

<text
    x="185"
    y="185"
    font-size="17"
    font-family="Segoe UI"
    fill="#8B949E">
Pulls
</text>

<text
    x="65"
    y="202"
    font-size="14"
    font-family="Segoe UI"
    fill="#8B949E">
${frontendInfo.updated}
</text>

<!-- BACKEND -->

<rect
    x="670"
    y="105"
    width="570"
    height="90"
    rx="14"
    fill="#111827"
    stroke="${backendInfo.accent}"
    stroke-width="2"
    filter="url(#shadow)"/>

<text
    x="695"
    y="132"
    font-size="24"
    font-family="Segoe UI"
    font-weight="700"
    fill="${backendInfo.accent}">
Backend
</text>

<text
    x="695"
    y="155"
    font-size="15"
    font-family="Consolas"
    fill="#9CA3AF">
${backendInfo.repository}
</text>

<text
    x="695"
    y="185"
    font-size="30"
    font-family="Segoe UI"
    font-weight="700"
    fill="#FFFFFF">
⬇ ${backendInfo.pulls}
</text>

<text
    x="815"
    y="185"
    font-size="17"
    font-family="Segoe UI"
    fill="#8B949E">
Pulls
</text>

<text
    x="695"
    y="202"
    font-size="14"
    font-family="Segoe UI"
    fill="#8B949E">
${backendInfo.updated}
</text>
</svg>
`;

fs.mkdirSync(".github/assets", {
    recursive: true
});

fs.writeFileSync(
    ".github/assets/dockerhub-card.svg",
    svg,
    "utf8"
);

console.log("✅ Docker Hub card generated.");