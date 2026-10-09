const dhikrSelect = document.querySelector("#dhikr-select");
const countButton = document.querySelector("#count-button");
const countNumber = document.querySelector("#count-number");
const counterRing = document.querySelector("#counter-ring");
const cycleNote = document.querySelector("#cycle-note");
const countsKey = "dhikr-counts-v1";
const currentDhikrKey = "dhikr-current-v1";
const cycleSize = 33;
const arabicDigits = new Intl.NumberFormat("ar-SA", { useGrouping: false });

const dhikrNames = {
  subhan: "سبحان الله وبحمده",
  istighfar: "أستغفر الله وأتوب إليه",
  salawat: "اللهم صلِّ وسلم على نبينا محمد"
};

function readCounts() {
  try {
    const stored = JSON.parse(localStorage.getItem(countsKey) || "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
}

let counts = readCounts();
let activeDhikr = localStorage.getItem(currentDhikrKey);
if (!Object.hasOwn(dhikrNames, activeDhikr)) activeDhikr = "subhan";
dhikrSelect.value = activeDhikr;

function saveCounts() {
  try {
    localStorage.setItem(countsKey, JSON.stringify(counts));
    localStorage.setItem(currentDhikrKey, activeDhikr);
  } catch {
    cycleNote.textContent = "تعذّر حفظ العدد على هذا الجهاز";
  }
}

function renderCount() {
  const value = Number.isSafeInteger(counts[activeDhikr]) && counts[activeDhikr] > 0 ? counts[activeDhikr] : 0;
  counts[activeDhikr] = value;
  countNumber.textContent = arabicDigits.format(value);
  countButton.setAttribute("aria-label", `اضغط للتسبيح، العدد ${arabicDigits.format(value)}`);
  counterRing.style.setProperty("--progress", `${(value % cycleSize) / cycleSize * 100}%`);
  cycleNote.textContent = value > 0 && value % cycleSize === 0
    ? `أتممت ${arabicDigits.format(value / cycleSize)} دورة، تقبّل الله ذكرك`
    : "كل ٣٣ تسبيحة، محطةٌ للتأمل";
}

countButton.addEventListener("click", () => {
  counts[activeDhikr] = (Number(counts[activeDhikr]) || 0) + 1;
  saveCounts();
  renderCount();
});

dhikrSelect.addEventListener("change", () => {
  activeDhikr = dhikrSelect.value;
  saveCounts();
  renderCount();
});

document.querySelector("#reset-button").addEventListener("click", () => {
  counts[activeDhikr] = 0;
  saveCounts();
  renderCount();
});

renderCount();

const dailyMessages = [
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", source: "سورة الشرح · الآية ٦" },
  { text: "فَاذْكُرُونِي أَذْكُرْكُمْ", source: "سورة البقرة · الآية ١٥٢" },
  { text: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنْتُمْ", source: "سورة الحديد · الآية ٤" },
  { text: "الكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", source: "حديث صحيح · رواه البخاري ومسلم" },
  { text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", source: "حديث صحيح · رواه البخاري ومسلم" },
  { text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", source: "حديث صحيح · رواه مسلم" },
  { text: "يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا", source: "حديث صحيح · رواه البخاري ومسلم" }
];

const quoteText = document.querySelector("#quote-text");
const quoteSource = document.querySelector("#quote-source");
const copyStatus = document.querySelector("#copy-status");
let currentMessage = new Date().getDate() % dailyMessages.length;

function renderMessage() {
  quoteText.textContent = dailyMessages[currentMessage].text;
  quoteSource.textContent = dailyMessages[currentMessage].source;
  copyStatus.textContent = "";
}

renderMessage();
document.querySelector("#next-quote").addEventListener("click", () => {
  currentMessage = (currentMessage + 1) % dailyMessages.length;
  renderMessage();
});

document.querySelector("#copy-quote").addEventListener("click", async () => {
  const textToCopy = `${dailyMessages[currentMessage].text} — ${dailyMessages[currentMessage].source}`;
  try {
    await navigator.clipboard.writeText(textToCopy);
    copyStatus.textContent = "نُسخ النص";
  } catch {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = textToCopy;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.append(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand("copy");
    temporaryInput.remove();
    copyStatus.textContent = copied ? "نُسخ النص" : "تعذّر النسخ، حدّد النص لنسخه";
  }
});

const citySelect = document.querySelector("#city-select");
const prayerList = document.querySelector("#prayer-list");
const prayerStatus = document.querySelector("#prayer-status");
const prayerDate = document.querySelector("#prayer-date");
const nextPrayerName = document.querySelector("#next-prayer-name");
const nextPrayerTime = document.querySelector("#next-prayer-time");
const nextPrayerCountdown = document.querySelector("#next-prayer-countdown");
const prayerItems = [
  { key: "Fajr", label: "الفجر" },
  { key: "Sunrise", label: "الشروق" },
  { key: "Dhuhr", label: "الظهر" },
  { key: "Asr", label: "العصر" },
  { key: "Maghrib", label: "المغرب" },
  { key: "Isha", label: "العشاء" }
];
const nextPrayerKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const cityCoordinates = {
  taif: { name: "الطائف", latitude: 21.2703, longitude: 40.4158 },
  makkah: { name: "مكة المكرمة", latitude: 21.3891, longitude: 39.8579 }
};
let activeCoordinates = cityCoordinates.taif;
let currentTimings = null;
let fetchSequence = 0;

function formatPrayerDate(date) {
  return new Intl.DateTimeFormat("ar-SA", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

document.querySelector("#today-date").textContent = new Intl.DateTimeFormat("ar-SA", {
  weekday: "long", day: "numeric", month: "long", year: "numeric"
}).format(new Date());

function formatTime(value) {
  if (typeof value !== "string") return "--:--";
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "--:--";
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return new Intl.DateTimeFormat("ar-SA", { hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}

function renderNextPrayer() {
  if (!currentTimings) return;
  const now = new Date();
  let upcoming = null;
  for (const key of nextPrayerKeys) {
    const match = currentTimings[key]?.match(/^(\d{1,2}):(\d{2})/);
    if (!match) continue;
    const at = new Date();
    at.setHours(Number(match[1]), Number(match[2]), 0, 0);
    if (at > now) {
      upcoming = { key, at };
      break;
    }
  }
  if (!upcoming) {
    const fajr = currentTimings.Fajr?.match(/^(\d{1,2}):(\d{2})/);
    if (!fajr) return;
    const at = new Date();
    at.setDate(at.getDate() + 1);
    at.setHours(Number(fajr[1]), Number(fajr[2]), 0, 0);
    upcoming = { key: "Fajr", at };
  }

  const secondsRemaining = Math.max(0, Math.floor((upcoming.at - now) / 1000));
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const arabicTime = (number) => arabicDigits.format(number).padStart(2, "٠");
  nextPrayerName.textContent = prayerItems.find((item) => item.key === upcoming.key)?.label || "الفجر";
  nextPrayerTime.textContent = formatTime(currentTimings[upcoming.key]);
  nextPrayerTime.dateTime = upcoming.at.toISOString();
  nextPrayerCountdown.textContent = `${arabicTime(hours)}:${arabicTime(minutes)}:${arabicTime(seconds)}`;
  prayerList.querySelectorAll(".prayer-item").forEach((item, index) => {
    item.classList.toggle("is-next", prayerItems[index].key === upcoming.key);
  });
}

async function loadPrayerTimes(coordinates, statusPrefix = "") {
  const requestId = ++fetchSequence;
  activeCoordinates = coordinates;
  prayerStatus.textContent = "جارٍ جلب المواقيت...";
  nextPrayerName.textContent = "--";
  nextPrayerTime.textContent = "--:--";
  nextPrayerTime.removeAttribute("datetime");
  nextPrayerCountdown.textContent = "--:--";
  const now = new Date();
  const requestDate = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
  const url = new URL(`https://api.aladhan.com/v1/timings/${requestDate}`);
  url.search = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    method: "4"
  });
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Prayer times request failed");
    const payload = await response.json();
    if (payload.code !== 200 || !payload.data?.timings) throw new Error("Prayer times unavailable");
    if (requestId !== fetchSequence) return;
    currentTimings = payload.data.timings;
    prayerList.innerHTML = prayerItems.map(({ key, label }) =>
      `<div class="prayer-item"><span>${label}</span><strong>${formatTime(currentTimings[key])}</strong></div>`
    ).join("");
    const hijri = payload.data.date?.hijri;
    const hijriDate = hijri?.day && hijri?.month?.ar ? ` · ${hijri.day} ${hijri.month.ar}` : "";
    prayerDate.textContent = `${formatPrayerDate(now)} · ${coordinates.name || "موقعك"}${hijriDate}`;
    prayerStatus.textContent = `${statusPrefix}طريقة أم القرى`;
    renderNextPrayer();
  } catch {
    if (requestId !== fetchSequence) return;
    currentTimings = null;
    prayerStatus.textContent = "تعذّر تحميل المواقيت. تحقق من الاتصال ثم أعد المحاولة.";
    nextPrayerName.textContent = "--";
    nextPrayerTime.textContent = "--:--";
    nextPrayerTime.removeAttribute("datetime");
    nextPrayerCountdown.textContent = "--:--";
    prayerDate.textContent = `${formatPrayerDate(now)} · ${coordinates.name || "موقعك"}`;
    prayerList.innerHTML = prayerItems.map(({ label }) =>
      `<div class="prayer-item"><span>${label}</span><strong>--:--</strong></div>`
    ).join("");
  }
}

citySelect.addEventListener("change", () => {
  loadPrayerTimes(cityCoordinates[citySelect.value]);
});

document.querySelector("#location-button").addEventListener("click", () => {
  if (!navigator.geolocation) {
    prayerStatus.textContent = "تحديد الموقع غير متاح في هذا المتصفح.";
    return;
  }
  prayerStatus.textContent = "بانتظار إذن تحديد الموقع...";
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      citySelect.value = "";
      loadPrayerTimes({ name: "موقعك الحالي", latitude: coords.latitude, longitude: coords.longitude }, "حسب موقعك · ");
    },
    () => {
      prayerStatus.textContent = "لم نتمكن من تحديد موقعك؛ اختر مدينة من القائمة.";
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
});

loadPrayerTimes(activeCoordinates);
window.setInterval(renderNextPrayer, 1000);
