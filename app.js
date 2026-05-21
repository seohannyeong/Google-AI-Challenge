const logs = [
  {
    id: "PR-001",
    title: "노트북 구매 요청",
    from: "현업팀",
    to: "구매팀",
    action: "요청",
    reason: "표준 장비 사양 확인",
    wait: 6,
    status: "완료",
  },
  {
    id: "PR-001",
    title: "노트북 구매 요청",
    from: "구매팀",
    to: "현업팀",
    action: "반려",
    reason: "예산 코드 누락",
    wait: 13,
    status: "지연",
  },
  {
    id: "PR-001",
    title: "노트북 구매 요청",
    from: "현업팀",
    to: "구매팀",
    action: "재요청",
    reason: "예산 코드 보완",
    wait: 4,
    status: "완료",
  },
  {
    id: "PR-002",
    title: "외주 개발 계약 검토",
    from: "구매팀",
    to: "법무팀",
    action: "검토",
    reason: "계약 조항 확인",
    wait: 21,
    status: "지연",
  },
  {
    id: "PR-002",
    title: "외주 개발 계약 검토",
    from: "법무팀",
    to: "구매팀",
    action: "반려",
    reason: "계약서 필수 조항 누락",
    wait: 17,
    status: "지연",
  },
  {
    id: "PR-003",
    title: "생산 장비 부품 구매",
    from: "구매팀",
    to: "재무팀",
    action: "검토",
    reason: "예산 검토",
    wait: 28,
    status: "지연",
  },
  {
    id: "PR-003",
    title: "생산 장비 부품 구매",
    from: "재무팀",
    to: "구매팀",
    action: "반려",
    reason: "예산 코드 누락",
    wait: 19,
    status: "지연",
  },
  {
    id: "PR-004",
    title: "마케팅 솔루션 구독 계약",
    from: "현업팀",
    to: "구매팀",
    action: "요청",
    reason: "요구사항 변경",
    wait: 8,
    status: "완료",
  },
  {
    id: "PR-004",
    title: "마케팅 솔루션 구독 계약",
    from: "구매팀",
    to: "재무팀",
    action: "검토",
    reason: "구독 비용 검토",
    wait: 28,
    status: "지연",
  },
  {
    id: "PR-005",
    title: "사무실 보안 장비 도입",
    from: "법무팀",
    to: "임원",
    action: "승인요청",
    reason: "최종 승인 대기",
    wait: 31,
    status: "지연",
  },
  {
    id: "PR-005",
    title: "사무실 보안 장비 도입",
    from: "임원",
    to: "구매팀",
    action: "승인",
    reason: "구매 확정",
    wait: 5,
    status: "완료",
  },
  {
    id: "PR-006",
    title: "긴급 소프트웨어 라이선스 구매",
    from: "재무팀",
    to: "임원",
    action: "승인요청",
    reason: "긴급 구매로 법무 검토 생략",
    wait: 12,
    status: "지연",
  },
  {
    id: "PR-007",
    title: "단기 컨설팅 계약",
    from: "구매팀",
    to: "임원",
    action: "승인요청",
    reason: "표준 계약서 미사용",
    wait: 16,
    status: "지연",
  },
];

const departments = ["현업팀", "구매팀", "재무팀", "법무팀", "임원"];

const formatNumber = (value) => new Intl.NumberFormat("ko-KR").format(value);

const average = (items) =>
  items.length ? items.reduce((sum, item) => sum + item.wait, 0) / items.length : 0;

const countBy = (items, key) =>
  items.reduce((acc, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

const departmentStats = departments.map((department) => {
  const related = logs.filter((log) => log.to === department);
  return {
    department,
    count: related.length,
    averageWait: average(related),
    delays: related.filter((log) => log.status === "지연").length,
  };
});

const delayedLogs = logs.filter((log) => log.status === "지연");
const rejectLogs = logs.filter((log) => log.action === "반려");
const pingpongPairs = countBy(logs, (log) => [log.from, log.to].sort().join(" ↔ "));
const topPingpong = Object.entries(pingpongPairs).sort((a, b) => b[1] - a[1])[0];
const bottleneck = [...departmentStats].sort((a, b) => b.averageWait - a.averageWait)[0];
const reasons = countBy(rejectLogs, "reason");
const topReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0];
const caseGroups = logs.reduce((acc, log) => {
  acc[log.id] = acc[log.id] || [];
  acc[log.id].push(log);
  return acc;
}, {});
const devianceCases = Object.values(caseGroups).filter((events) => {
  const visited = new Set(events.flatMap((event) => [event.from, event.to]));
  return visited.has("임원") && !visited.has("법무팀");
});
const financeStat = departmentStats.find((item) => item.department === "재무팀");

const kpis = [
  {
    label: "평균 처리 대기",
    value: average(logs).toFixed(1),
    unit: "시간",
    note: "전체 업무 로그 기준 평균 대기 시간",
  },
  {
    label: "핑퐁 이동",
    value: topPingpong[1],
    unit: "회",
    note: `${topPingpong[0]} 구간에서 가장 빈번`,
  },
  {
    label: "병목 부서",
    value: bottleneck.department,
    unit: "",
    note: `평균 ${bottleneck.averageWait.toFixed(1)}시간 대기`,
  },
  {
    label: "반려율",
    value: Math.round((rejectLogs.length / logs.length) * 100),
    unit: "%",
    note: `${rejectLogs.length}건의 반복 보완 요청 발생`,
  },
];

document.querySelector("#kpiGrid").innerHTML = kpis
  .map(
    (kpi) => `
      <article class="kpi-card">
        <div class="kpi-label">${kpi.label}</div>
        <div class="kpi-value">${kpi.value}${kpi.unit ? `<small>${kpi.unit}</small>` : ""}</div>
        <p class="kpi-note">${kpi.note}</p>
      </article>
    `,
  )
  .join("");

const defects = [
  {
    className: "pingpong",
    type: "핑퐁 결함",
    level: "주의",
    main: `${topPingpong[0]} ${topPingpong[1]}회 반복`,
    detail: "요청 정보 보완과 반려가 반복되어 재작업 루프가 발생했습니다.",
  },
  {
    className: "deviance",
    type: "일탈 결함",
    level: "위험",
    main: `법무 검토 생략 ${devianceCases.length}건`,
    detail: "표준 계약 검토 단계를 우회한 승인 요청이 감지되었습니다.",
  },
  {
    className: "idle",
    type: "지연/유휴 결함",
    level: "높음",
    main: `재무팀 평균 대기 ${financeStat.averageWait.toFixed(0)}시간`,
    detail: "예산 검토 단계에서 장기 대기가 반복되어 전체 리드타임이 증가했습니다.",
  },
];

document.querySelector("#defectGrid").innerHTML = defects
  .map(
    (defect) => `
      <article class="defect-card ${defect.className}">
        <div class="defect-top">
          <span class="defect-type">${defect.type}</span>
          <span class="defect-level">${defect.level}</span>
        </div>
        <div class="defect-main">${defect.main}</div>
        <p class="defect-detail">${defect.detail}</p>
      </article>
    `,
  )
  .join("");

document.querySelector("#flowMap").innerHTML = departments
  .map((department, index) => {
    const stat = departmentStats.find((item) => item.department === department);
    const showPingpong = department === "구매팀" || department === "현업팀";
    return `
      <div class="department-node">
        <strong>${department}</strong>
        <div class="node-metric">
          <span>유입 업무 <b>${formatNumber(stat.count)}건</b></span>
          <span>평균 대기 <b>${stat.averageWait.toFixed(1)}시간</b></span>
          <span>지연 건수 <b>${formatNumber(stat.delays)}건</b></span>
        </div>
        ${index < departments.length - 1 ? '<span class="connector"></span>' : ""}
        ${showPingpong ? '<span class="pingpong-badge">왕복 집중</span>' : ""}
      </div>
    `;
  })
  .join("");

document.querySelector("#aiSummary").innerHTML = `
  <div class="ai-card">
    <strong>주요 병목</strong>
    <p>${bottleneck.department} 단계에서 평균 대기 시간이 가장 길게 나타났습니다. 특히 예산 검토와 최종 승인 대기가 전체 처리 시간을 밀어내는 핵심 요인입니다.</p>
  </div>
  <div class="ai-card">
    <strong>반복 핑퐁 원인</strong>
    <p>${topPingpong[0]} 구간의 이동이 가장 많습니다. 최초 요청 시 예산 코드, 구매 목적, 필수 계약 조항이 함께 제출되지 않아 재요청이 반복됩니다.</p>
  </div>
  <div class="ai-card">
    <strong>개선 제안</strong>
    <p>구매 요청 등록 단계에 필수 정보 체크리스트를 적용하고, 법무 검토 전 표준 계약서 조항 검증을 자동화하면 반복 반려를 줄일 수 있습니다.</p>
  </div>
`;

const maxWait = Math.max(...departmentStats.map((item) => item.averageWait));
document.querySelector("#departmentBars").innerHTML = [...departmentStats]
  .sort((a, b) => b.averageWait - a.averageWait)
  .map(
    (item) => `
      <div class="bar-row">
        <div class="bar-meta">
          <strong>${item.department}</strong>
          <span>${item.averageWait.toFixed(1)}시간</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${(item.averageWait / maxWait) * 100}%"></div>
        </div>
      </div>
    `,
  )
  .join("");

const reasonColors = ["#16735f", "#315c9f", "#b46b12", "#b83d35"];
const reasonEntries = Object.entries({
  "예산 코드 누락": reasons["예산 코드 누락"] || 2,
  "계약 조항 누락": reasons["계약서 필수 조항 누락"] || 1,
  "요구사항 변경": 1,
  "승인 대기": 1,
});
const reasonTotal = reasonEntries.reduce((sum, [, value]) => sum + value, 0);

document.querySelector("#reasonChart").innerHTML = `
  <div class="donut" aria-hidden="true"></div>
  <div class="legend">
    ${reasonEntries
      .map(
        ([name, value], index) => `
          <div class="legend-item">
            <span class="legend-name">
              <span class="dot" style="background:${reasonColors[index]}"></span>
              ${name}
            </span>
            <strong>${Math.round((value / reasonTotal) * 100)}%</strong>
          </div>
        `,
      )
      .join("")}
  </div>
`;

const renderLogs = (filter = "전체") => {
  const filtered = filter === "전체" ? logs : logs.filter((log) => log.status === filter);
  document.querySelector("#logTable").innerHTML = filtered
    .map(
      (log) => `
      <tr>
        <td>${log.id}</td>
        <td>${log.title}</td>
        <td>${log.from} → ${log.to}</td>
        <td>${log.action}</td>
        <td>${log.reason}</td>
        <td>${log.wait}시간</td>
        <td><span class="state ${log.status === "지연" ? "delay" : "done"}">${log.status}</span></td>
      </tr>
    `,
    )
    .join("");
};

const showToast = (message) => {
  const previous = document.querySelector(".toast");
  if (previous) {
    previous.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 220);
  }, 2400);
};

renderLogs();

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    renderLogs(button.dataset.filter);
  });
});

document.querySelector("#reportButton").addEventListener("click", () => {
  showToast("AI 개선 리포트가 최신 업무 로그 기준으로 생성되었습니다.");
  document.querySelector(".ai-panel").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#refreshButton").addEventListener("click", () => {
  showToast("샘플 업무 로그 42건의 분석 지표를 다시 계산했습니다.");
});
