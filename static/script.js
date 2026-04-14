fetch("/vocab")
    .then(res => res.json())
    .then(vocab => {
        const container = document.getElementById("vocab-container");
        for (const [char, index] of Object.entries(vocab)) {
            const item = document.createElement("div");
            item.className = "vocab-item";
            const display = char === " " ? "␣" : char;
            item.innerHTML = `<span class="vocab-char">${display}</span>
                              <span class="arrow">→</span>
                              <span class="vocab-index">${index}</span>`;
            container.appendChild(item);
        }
    });
