// Interactive QCM (multiple-choice quiz) behaviour for the `.. qcm::` directive.
document.addEventListener("DOMContentLoaded", () => {
  const quizzes = Array.from(document.querySelectorAll(".qcm"));
  if (!quizzes.length) return;

  // Scoreboard after the last question
  const board = document.createElement("div");
  board.className = "qcm-score";
  board.innerHTML =
    '<div><span class="qcm-score-label">Your score</span>' +
    '<span class="qcm-score-value"></span></div>' +
    '<div class="qcm-bar"><span></span></div>' +
    '<button type="button" class="qcm-reset">Restart quiz</button>';
  quizzes[quizzes.length - 1].after(board);

  const render = () => {
    const answered = quizzes.filter((q) => q.dataset.done).length;
    const correct = quizzes.filter((q) => q.dataset.done === "ok").length;
    board.querySelector(".qcm-score-value").textContent =
      `${correct} / ${quizzes.length}` +
      (answered < quizzes.length ? `  ·  ${quizzes.length - answered} left` : "");
    board.querySelector(".qcm-bar span").style.width =
      `${(100 * correct) / quizzes.length}%`;
    board.classList.toggle("is-complete", answered === quizzes.length);
  };

  quizzes.forEach((quiz, idx) => {
    quiz.querySelector(".qcm-num").textContent = `Q${idx + 1}`;
    const answer = Number(quiz.dataset.answer);
    const buttons = Array.from(quiz.querySelectorAll(".qcm-opt"));
    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        if (quiz.dataset.done) return;
        const ok = Number(btn.dataset.i) === answer;
        quiz.dataset.done = ok ? "ok" : "ko";
        btn.classList.add(ok ? "is-correct" : "is-wrong");
        buttons[answer].classList.add("is-correct");
        buttons.forEach((b) => (b.disabled = true));
        const fb = quiz.querySelector(".qcm-feedback");
        fb.querySelector(".qcm-verdict").textContent = ok ? "Correct!" : "Not quite.";
        fb.classList.toggle("is-ok", ok);
        fb.hidden = false;
        render();
      })
    );
  });

  board.querySelector(".qcm-reset").addEventListener("click", () => {
    quizzes.forEach((quiz) => {
      delete quiz.dataset.done;
      quiz.querySelector(".qcm-feedback").hidden = true;
      quiz.querySelectorAll(".qcm-opt").forEach((b) => {
        b.disabled = false;
        b.classList.remove("is-correct", "is-wrong");
      });
    });
    render();
    quizzes[0].scrollIntoView({ behavior: "smooth", block: "center" });
  });

  render();
});
