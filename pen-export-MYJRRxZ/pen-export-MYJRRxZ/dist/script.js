const DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت"
];

const DEFAULT_SCHEDULE = {

  "الجمعة": [
    {
      subject: "عربي",
      time: "5:00 PM"
    }
  ],

  "السبت": [
    {
      subject: "علوم",
      time: "3:30 PM"
    },
    {
      subject: "دراسات",
      time: "6:00 PM"
    }
  ],

  "الأحد": [],

  "الاثنين": [],

  "الثلاثاء": [],

  "الأربعاء": [
    {
      subject: "رياضيات",
      time: "1:00 PM"
    },
    {
      subject: "إنجليزي",
      time: "6:00 PM"
    }
  ],

  "الخميس": []
};


/* =========================
   DATA
========================= */

let data;

try {
  data = JSON.parse(
    localStorage.getItem("studyTracker")
  );
} catch (e) {
  data = null;
}

if (!data) {

  data = {

    started: false,

    points: 0,

    xp: 0,

    streak: 0,

    totalSeconds: 0,

    dailySeconds: {},

    completedTasks: {},

    schedule: DEFAULT_SCHEDULE,

    lastStudyDate: null,

    lastTaskDay: null,

    todaySubjects: []

  };
}


/* =========================
   TIMER
========================= */

let timerSeconds = 0;
let timerInterval = null;


/* =========================
   SAVE
========================= */

function save() {

  localStorage.setItem(
    "studyTracker",
    JSON.stringify(data)
  );
}


/* =========================
   DATE
========================= */

function getTodayKey() {

  const date = new Date();

  return date.toISOString().slice(0, 10);
}


/* =========================
   TIME
========================= */

function formatTime(seconds) {

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  const secs =
    seconds % 60;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}


/* =========================
   DAY
========================= */

function getArabicDay() {

  const map = {

    0: "الأحد",
    1: "الاثنين",
    2: "الثلاثاء",
    3: "الأربعاء",
    4: "الخميس",
    5: "الجمعة",
    6: "السبت"

  };

  return map[
    new Date().getDay()
  ];
}


/* =========================
   GET ALL SUBJECTS
========================= */

function getAllSubjects() {

  const subjects = [];

  Object.values(data.schedule)
    .forEach(function(lessons) {

      lessons.forEach(function(lesson) {

        if (
          !subjects.includes(
            lesson.subject
          )
        ) {

          subjects.push(
            lesson.subject
          );
        }

      });

    });

  return subjects;
}


/* =========================
   CREATE TODAY'S 2-3 SUBJECTS
========================= */

function createTodaySubjects() {

  const today = getTodayKey();

  if (
    data.lastTaskDay === today &&
    data.todaySubjects.length
  ) {

    return;
  }

  const allSubjects =
    getAllSubjects();

  if (allSubjects.length === 0) {
    data.todaySubjects = [];
    return;
  }


  /*
    نغير ترتيب المواد كل يوم
    عشان مش نفس مادتين كل يوم
  */

  const shuffled =
    [...allSubjects].sort(
      () => Math.random() - 0.5
    );


  /*
    ناخد 2 أو 3 مواد فقط
  */

  const count =
    Math.min(
      shuffled.length,
      Math.random() > 0.5 ? 3 : 2
    );

  data.todaySubjects =
    shuffled.slice(0, count);

  data.lastTaskDay = today;

  save();
}


/* =========================
   RENDER
========================= */

function render() {

  const today =
    getTodayKey();

  const todaySeconds =
    data.dailySeconds[today] || 0;


  document.getElementById(
    "points"
  ).textContent =
    data.points;


  document.getElementById(
    "xp"
  ).textContent =
    data.xp;


  document.getElementById(
    "streak"
  ).textContent =
    data.streak;


  document.getElementById(
    "todayStudy"
  ).textContent =
    formatTime(todaySeconds);


  document.getElementById(
    "todayText"
  ).textContent =
    getArabicDay() +
    " • " +
    new Date().toLocaleDateString(
      "ar-EG"
    );


  const percentage =
    Math.min(
      (todaySeconds / 14400) * 100,
      100
    );


  document.getElementById(
    "progressBar"
  ).style.width =
    percentage + "%";


  document.getElementById(
    "progressText"
  ).textContent =
    Math.floor(percentage) +
    "% من هدف 4 ساعات";


  const status =
    document.getElementById(
      "studyStatus"
    );


  const toggle =
    document.getElementById(
      "studyToggle"
    );


  if (data.started) {

    status.textContent =
      "🟢 الدراسة شغالة";

    toggle.textContent =
      "⏸️ إيقاف الدراسة";

    toggle.className =
      "btn gray";

  } else {

    status.textContent =
      "⏸️ الدراسة متوقفة";

    toggle.textContent =
      "▶️ بدء الدراسة";

    toggle.className =
      "btn blue";
  }


  renderSchedule();

  renderTasks();
}


/* =========================
   SCHEDULE
========================= */

function renderSchedule() {

  const container =
    document.getElementById(
      "schedule"
    );

  container.innerHTML = "";


  DAYS.forEach(function(day) {

    const lessons =
      data.schedule[day] || [];


    const div =
      document.createElement(
        "div"
      );

    div.className =
      "day";


    let html =
      "<strong>" +
      day +
      "</strong>";


    if (
      lessons.length === 0
    ) {

      html +=
        '<div class="lesson">' +
        "لا يوجد درس" +
        "</div>";

    } else {

      let lessonHTML = "";

      lessons.forEach(
        function(lesson) {

          lessonHTML +=
            "📚 " +
            lesson.subject +
            " — " +
            lesson.time +
            "<br>";

        }
      );


      html +=
        '<div class="lesson">' +
        lessonHTML +
        "</div>";
    }


    div.innerHTML = html;

    container.appendChild(div);

  });
}


/* =========================
   TASKS
========================= */

function renderTasks() {

  const container =
    document.getElementById(
      "tasks"
    );


  container.innerHTML = "";


  if (!data.started) {

    container.innerHTML =
      '<div class="empty">' +
      "⏸️ الدراسة لسه مبدأتش" +
      "<br>" +
      "ابدأ الدراسة لما تبدأ فعليًا." +
      "</div>";


    document.getElementById(
      "taskCount"
    ).textContent =
      "0 مواد";


    return;
  }


  createTodaySubjects();


  const subjects =
    data.todaySubjects;


  document.getElementById(
    "taskCount"
  ).textContent =
    subjects.length +
    " مواد";


  if (subjects.length === 0) {

    container.innerHTML =
      '<div class="empty">' +
      "🎉 مفيش مواد متاحة" +
      "</div>";

    return;
  }


  subjects.forEach(
    function(subject) {

      const id =
        getTodayKey() +
        "-" +
        subject;


      const completed =
        data.completedTasks[id];


      const div =
        document.createElement(
          "div"
        );


      div.className =
        "task";


      div.innerHTML =

        "<div>" +

        "<h3>" +
        (completed
          ? "✅"
          : "📚") +
        " " +
        subject +
        "</h3>" +

        "<p>" +
        "ذاكر " +
        subject +
        " وحل الواجب" +
        "</p>" +

        "</div>" +


        (
          completed

          ? '<button class="btn gray" disabled>' +
            "تمت ✓" +
            "</button>"

          : '<button class="btn green" onclick="completeTask(\'' +
            id +
            "')\">" +
            "خلصت" +
            "</button>"
        );


      container.appendChild(div);

    }
  );
}


/* =========================
   COMPLETE TASK
========================= */

window.completeTask =
function(id) {

  if (
    data.completedTasks[id]
  ) {
    return;
  }


  data.completedTasks[id] =
    true;


  data.points += 15;

  data.xp += 20;


  save();

  render();


  alert(
    "🔥 عاش! خلصت المادة +15 Points"
  );
};


/* =========================
   START / STOP STUDY
========================= */

document
  .getElementById(
    "studyToggle"
  )
  .addEventListener(
    "click",
    function() {

      data.started =
        !data.started;


      if (data.started) {

        createTodaySubjects();

        alert(
          "🚀 الدراسة بدأت! بالتوفيق يا بطل."
        );

      } else {

        /*
          إيقاف الدراسة لا يمسح
          نقاطك أو وقتك
        */

        alert(
          "⏸️ تم إيقاف الدراسة مؤقتًا."
        );
      }


      save();

      render();

    }
  );


/* =========================
   TIMER START
========================= */

document
  .getElementById(
    "startTimer"
  )
  .addEventListener(
    "click",
    function() {

      if (
        !data.started
      ) {

        alert(
          "⏸️ ابدأ الدراسة الأول."
        );

        return;
      }


      if (
        timerInterval !== null
      ) {
        return;
      }


      timerInterval =
        setInterval(
          function() {

            timerSeconds++;


            document.getElementById(
              "timer"
            ).textContent =
              formatTime(
                timerSeconds
              );

          },
          1000
        );
    }
  );


/* =========================
   TIMER PAUSE
========================= */

document
  .getElementById(
    "pauseTimer"
  )
  .addEventListener(
    "click",
    function() {

      clearInterval(
        timerInterval
      );

      timerInterval =
        null;

    }
  );


/* =========================
   FINISH TIMER
========================= */

document
  .getElementById(
    "finishTimer"
  )
  .addEventListener(
    "click",
    function() {

      clearInterval(
        timerInterval
      );

      timerInterval =
        null;


      if (
        timerSeconds < 60
      ) {

        alert(
          "ذاكر دقيقة واحدة على الأقل."
        );

        return;
      }


      const today =
        getTodayKey();


      if (
        !data.dailySeconds[today]
      ) {

        data.dailySeconds[today] =
          0;
      }


      data.dailySeconds[today] +=
        timerSeconds;


      data.totalSeconds +=
        timerSeconds;


      const points =
        Math.floor(
          timerSeconds / 1800
        ) * 5;


      data.points +=
        points;


      data.xp +=
        points * 2;


      checkFourHours();

      updateStreak();


      timerSeconds = 0;


      document.getElementById(
        "timer"
      ).textContent =
        "00:00:00";


      save();

      render();


      alert(
        "🔥 جلسة ممتازة! +" +
        points +
        " Points"
      );

    }
  );


/* =========================
   FOUR HOURS BONUS
========================= */

function checkFourHours() {

  const today =
    getTodayKey();


  const seconds =
    data.dailySeconds[today] || 0;


  if (
    seconds >= 14400 &&
    !data.fourHourBonus
  ) {

    data.points += 20;

    data.xp += 50;

    data.fourHourBonus =
      today;

  }


  if (
    data.fourHourBonus !==
    today
  ) {

    if (
      seconds < 14400
    ) {

      data.fourHourBonus =
        null;
    }
  }
}


/* =========================
   STREAK
========================= */

function updateStreak() {

  const today =
    getTodayKey();


  const seconds =
    data.dailySeconds[today] || 0;


  if (
    seconds >= 1800 &&
    data.lastStudyDate !== today
  ) {

    data.streak++;

    data.points += 10;

    data.lastStudyDate =
      today;

  }
}


/* =========================
   EDIT SCHEDULE
========================= */

document
  .getElementById(
    "editSchedule"
  )
  .addEventListener(
    "click",
    function() {

      const container =
        document.getElementById(
          "scheduleInputs"
        );


      container.innerHTML = "";


      DAYS.forEach(
        function(day) {

          const lessons =
            data.schedule[day] ||
            [];


          let value = "";


          lessons.forEach(
            function(lesson) {

              if (
                value !== ""
              ) {
                value += " | ";
              }


              value +=
                lesson.subject +
                " - " +
                lesson.time;

            }
          );


          container.innerHTML +=

            '<div class="input-row">' +

            "<label>" +
            day +
            "</label>" +

            '<input ' +
            'data-day="' +
            day +
            '" ' +
            'value="' +
            value +
            '" ' +
            'placeholder="مثال: رياضيات - 1:00 PM">' +

            "</div>";

        }
      );


      document
        .getElementById(
          "modal"
        )
        .classList.remove(
          "hidden"
        );

    }
  );


/* =========================
   CLOSE MODAL
========================= */

document
  .getElementById(
    "closeModal"
  )
  .addEventListener(
    "click",
    function() {

      document
        .getElementById(
          "modal"
        )
        .classList.add(
          "hidden"
        );

    }
  );


/* =========================
   SAVE SCHEDULE
========================= */

document
  .getElementById(
    "saveSchedule"
  )
  .addEventListener(
    "click",
    function() {

      const inputs =
        document.querySelectorAll(
          "#scheduleInputs input"
        );


      inputs.forEach(
        function(input) {

          const day =
            input.dataset.day;


          const value =
            input.value.trim();


          if (!value) {

            data.schedule[day] =
              [];

            return;
          }


          const lessons = [];


          value
            .split("|")
            .forEach(
              function(item) {

                const parts =
                  item.split("-");


                lessons.push({

                  subject:
                    parts[0].trim(),

                  time:
                    parts
                      .slice(1)
                      .join("-")
                      .trim()

                });

              }
            );


          data.schedule[day] =
            lessons;

        }
      );


      /*
        لما نغير الجدول،
        نعيد توزيع المواد
      */

      data.lastTaskDay =
        null;

      data.todaySubjects =
        [];


      save();

      render();


      document
        .getElementById(
          "modal"
        )
        .classList.add(
          "hidden"
        );


      alert(
        "💾 تم حفظ جدول الدروس!"
      );

    }
  );


/* =========================
   INITIAL RENDER
========================= */

render();