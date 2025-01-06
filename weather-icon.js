const icons = document.querySelectorAll('.icon')

const counters = {}

icons.forEach(icon => {
    const id = icon.getAttribute('data-id')
    counters[id] = 0;

    icon.addEventListener('click', () => {
        counters[id]++
        const counterDisplay = document.getElementById(`counter-${id}`)
        counterDisplay.textContent = "(" + counters[id] + ")"
    })
})