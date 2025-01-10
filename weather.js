import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js'
import { getDatabase, ref, set, get, onValue } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js'

let app = null
let database = null

let currentUser = null;

// Create a new user
async function createNewUser(username) {
    const userRef = ref(database, `users/${username}`)

    await set(userRef, {
        icons: {
            "badge-check": false,
        }
    })
}

// Connection management
document.getElementById("username").addEventListener("click", async (e) => {
    e.preventDefault()

    const username = prompt("Enter your user name:")
    const password = prompt("Enter your password:")

    if(!username || !password) {
        alert("Please provide username and password!")
        return
    }

    try {
        // Empty because firebase security is not optimal for the front end
        const firebaseConfig = {
        }

        app = initializeApp(firebaseConfig)
        database = getDatabase(app)

        // Check if the user exists
        const userRef = ref(database, `users/${username}`)

        const snapshot = await get(userRef)
        if(snapshot.exists()) {
            alert("Successful connection!")
            currentUser = username
            getIcon()
            fetchUserIcons()
        } else {
            alert("Account creation successfully completed!")
            currentUser = username
            await createNewUser(username)
            getIcon()
            fetchUserIcons()
        }
    } catch(error) {
        alert("Connection error: ", error)
        console.error(error)
    }
})

// Icon management
function getIcon() {
    const icons = document.querySelectorAll(".icon")

    icons.forEach(icon => {
        const id = icon.getAttribute("data-id")

        if(currentUser) {
            document.getElementById('username').textContent = `Hello, ${currentUser}!`
        }

        if(database) {
            const counterRef = ref(database, `icons/${id}`);

            // Retrieve and update the global counter
            onValue(counterRef, (snapshot) => {
                if(snapshot.exists()) {
                    document.getElementById(`counter-${id}`).textContent = `(${snapshot.val()})`
                }
            })

            // Icon click management
            icon.addEventListener("click", async () => {
                if(!currentUser) {
                    alert("You must be logged in to enter your weather!")
                    return
                }

                const userIconRef = ref(database, `users/${currentUser}/icons/${id}`)

                // Check if the user has already ticked the icon
                const userIconSnapshot = await get(userIconRef)
                const isChecked = userIconSnapshot.exists() && userIconSnapshot.val() === true

                const counterSnapshot = await get(counterRef)
                let currentCount = counterSnapshot.exists() ? counterSnapshot.val() : 0

                if(isChecked) {
                    await set(userIconRef, false)
                    await set(counterRef, Math.max(currentCount - 1, 0))
                } else {
                    await set(userIconRef, true)
                    await set(counterRef, currentCount + 1)
                }

                fetchUserIcons()
            })
        }
    })
}

// Retrieve the list of users and their icons
async function fetchUserIcons() {
    const usersRef = ref(database, `users`)

    try {
        const snapshot = await get(usersRef)

        if(snapshot.exists()) {
            const users = snapshot.val()
            const usersContainer = document.getElementById("users-container")

            usersContainer.innerHTML = "<h2>Users List</h2>"

            for(const username in users) {
                const userIcons = users[username].icons
                const userDiv = document.createElement("div")
                userDiv.classList.add("user")

                const userTitle = document.createElement("h2")
                userTitle.textContent = username
                userDiv.appendChild(userTitle)

                for(const iconId in userIcons) {
                    const iconElement = document.querySelector(`.icon[data-id="${iconId}"]`)
                    const type = iconElement?.getAttribute("data-type") || "none"

                    if(userIcons[iconId] === true) {
                        const icon = document.createElement("div")
                        icon.classList.add("user-icon")
                        icon.innerHTML = `<box-icon type="${type}" name="${iconId}" color="#0ea5e9" size="32px"></box-icon> `
                        userDiv.appendChild(icon)
                    }
                }

                usersContainer.appendChild(userDiv)
            }
        }
    } catch(error) {
        console.error("Error when retrieving users: ", error)
    }
}