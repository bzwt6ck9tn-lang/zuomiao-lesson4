/* 《茁苗》第四課｜職青姊妹小組 — 答案只存本裝置 localStorage（前綴 zuomiao4:） */
(function () {
  "use strict";

  var PREFIX = "zuomiao4:";
  var STORAGE_KEY = PREFIX + "answers";

  function $(id) { return document.getElementById(id); }

  function fieldEls() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-key]"));
  }

  function showToast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      t.classList.remove("show");
    }, 2200);
  }

  function loadAnswers() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      fieldEls().forEach(function (el) {
        var key = el.getAttribute("data-key");
        if (typeof data[key] === "string") el.value = data[key];
      });
    } catch (e) {
      console.warn("loadAnswers failed", e);
    }
  }

  function collectAnswers() {
    var data = { savedAt: new Date().toISOString() };
    fieldEls().forEach(function (el) {
      data[el.getAttribute("data-key")] = el.value;
    });
    return data;
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectAnswers()));
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveAnswers() {
    showToast(persist() ? "已儲存到本裝置" : "儲存失敗（本機空間可能不足）");
  }

  function clearAnswers() {
    if (!confirm("確定清除本裝置上這一課的全部答案？")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
    fieldEls().forEach(function (el) { el.value = ""; });
    showToast("已清除");
  }

  function debounce(fn, wait) {
    var timer;
    return function () {
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  var autoSave = debounce(function () {
    if (persist()) {
      /* silent autosave — no toast spam */
    }
  }, 600);

  function bind() {
    var saveBtn = $("btn-save");
    var clearBtn = $("btn-clear");
    if (saveBtn) saveBtn.addEventListener("click", saveAnswers);
    if (clearBtn) clearBtn.addEventListener("click", clearAnswers);

    fieldEls().forEach(function (el) {
      el.addEventListener("input", autoSave);
      el.addEventListener("change", autoSave);
    });

    /* Highlight active nav chip while scrolling */
    var chips = Array.prototype.slice.call(document.querySelectorAll(".nav-chips a"));
    var sections = chips.map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    }).filter(Boolean);

    function updateActiveChip() {
      var y = window.scrollY + 90;
      var current = sections[0];
      sections.forEach(function (sec) {
        if (sec.offsetTop <= y) current = sec;
      });
      chips.forEach(function (a) {
        var active = current && a.getAttribute("href") === "#" + current.id;
        a.style.background = active ? "var(--sage-soft)" : "";
        a.style.borderColor = active ? "var(--sage)" : "";
      });
    }

    window.addEventListener("scroll", updateActiveChip, { passive: true });
    updateActiveChip();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      loadAnswers();
      bind();
    });
  } else {
    loadAnswers();
    bind();
  }
})();
