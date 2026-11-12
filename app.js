/* 《茁苗》職青姊妹小組 — 答案只存本裝置 localStorage（各課用 data-prefix 分開） */
(function () {
  "use strict";

  var PREFIX = (document.body && document.body.getAttribute("data-prefix")) || "zuomiao4:";
  var STORAGE_KEY = PREFIX + "answers";

  function $(id) { return document.getElementById(id); }

  function fieldEls() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-key]"));
  }

  function uniqueFields() {
    var seen = {};
    return fieldEls().filter(function (el) {
      var key = el.getAttribute("data-key");
      if (el.type === "radio") {
        if (seen[key]) return false;
        seen[key] = true;
      }
      return true;
    });
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

  function setFieldValue(el, value) {
    if (el.type === "checkbox") {
      el.checked = value === true || value === "1" || value === "true";
    } else if (el.type === "radio") {
      var group = document.querySelectorAll("[data-key=\"" + el.getAttribute("data-key") + "\"]");
      Array.prototype.forEach.call(group, function (r) {
        r.checked = r.value === value;
      });
    } else if (typeof value === "string") {
      el.value = value;
    }
  }

  function getFieldValue(el) {
    if (el.type === "checkbox") {
      return el.checked ? "1" : "";
    }
    if (el.type === "radio") {
      var checked = document.querySelector("[data-key=\"" + el.getAttribute("data-key") + "\"]:checked");
      return checked ? checked.value : "";
    }
    return el.value;
  }

  function loadAnswers() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      uniqueFields().forEach(function (el) {
        var key = el.getAttribute("data-key");
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          setFieldValue(el, data[key]);
        }
      });
    } catch (e) {
      console.warn("loadAnswers failed", e);
    }
  }

  function collectAnswers() {
    var data = { savedAt: new Date().toISOString() };
    uniqueFields().forEach(function (el) {
      data[el.getAttribute("data-key")] = getFieldValue(el);
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
    fieldEls().forEach(function (el) {
      if (el.type === "checkbox" || el.type === "radio") el.checked = false;
      else el.value = "";
    });
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
    persist();
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

    var chips = Array.prototype.slice.call(document.querySelectorAll(".nav-chips a"));
    if (!chips.length) return;
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
