import tmi from 'tmi.js';
import 'bootstrap/dist/css/bootstrap.min.css';
const queryString = require('query-string');

let cards;
let locations;
let duration = 8000;

function connectChat() {

    const parsed = queryString.parse(location.search);
    let channel = parsed.channel;
    let displayLength = parsed.duration;

    if (channel === undefined || channel.length < 2) {
        console.log("URL invalid");
        return;
    }
    if (displayLength !== undefined && !isNaN(displayLength)) {
        duration = parseInt(displayLength);
        console.log("Time set to " + displayLength);
    }
    else
        console.log("Default time used");

    const client = new tmi.Client({
        channels: [channel]
    });

    client.connect();

    console.log("Connecting to chat for " + channel);

    client.on("chat", (channel, userstate, message, self) => {
        //console.log(`${userstate['display-name']}: ${message}`);
    });

    client.on('message', (channel, tags, message, self) => {
        //console.log(`${tags['display-name']}: ${message}`);
        //console.log(message.substring(0, 5));

        if (message.length > 5 && message.substring(0, 5) == "!card") {

            let search = message.substring(5, message.length).trim();

            // basic search apply text directly
            var result = cards.card.filter(card => card.name.replace(" ", "").toLowerCase().indexOf(search.replace(" ", "").toLowerCase()) > -1);

            // if we get no result try each word in the search if theres more thank one
            if (result.length == 0) {
                if (search.includes(" ")) {
                    let s = search.split(" ");
                    for (let i = s.length - 1; i >= 0; i--) {
                        result = cards.card.filter(card => card.name.replace(" ", "").toLowerCase().indexOf(s[i].toLowerCase()) > -1);
                        if (result.length > 0) {
                            showCard(result, duration);
                            break;
                        }
                    }
                }
            }
            else if (result.length > 0) {
                showCard(result, duration);
            }

            return;
        }

        if (message.length > 9 && message.substring(0, 9) == "!location") {

            let search = message.substring(9, message.length).trim();

            // basic search
            var result = locations.location.filter(location => location.name.replace(" ", "").toLowerCase().indexOf(search.replace(" ", "").toLowerCase()) > -1);

            if (result.length == 0) {
                if (search.includes(" ")) {
                    let s = search.split(" ");
                    for (let i = s.length - 1; i >= 0; i--) {
                        result = locations.location.filter(location => location.name.replace(" ", "").toLowerCase().indexOf(s[i].toLowerCase()) > -1);
                        if (result.length > 0) {
                            showLocation(result, duration);
                            break;
                        }
                    }
                }
            } else if (result.length > 0) {
                showLocation(result, duration);
            }

            return;
        }
    });
}

async function loadCards() {
    let result = await (await fetch("media/js/cards.json")).json();
    cards = result.data.cards;
    locations = result.data.locations;
}


// card search
function showCard(card, length) {

    let cardContainer = document.getElementById("card-result");

    if (cardContainer === null)
        return;

    cardContainer.style.display = 'block';
    document.getElementById("card-image").src = "/media/images/cards/" + card[0].id + ".webp";

    //document.getElementById("card-desc").innerHTML = card[0].desc;

    setTimeout(() => {
        cardContainer.style.display = "none";
    }, length)

}

function showLocation(id, length) {
    let cardContainer = document.getElementById("card-result");

    if (cardContainer === null)
        return;

    cardContainer.style.display = 'block';

    document.getElementById("card-image").src = "https://snapdata-cdn.stonedonkey.com/images/locations/" + id[0].id + ".webp";
    document.getElementById("card-desc").innerHTML = id[0].desc;

    setTimeout(() => {
        cardContainer.style.display = "none";
    }, length)

}

function generateLink() {

    let url = document.getElementById("overlay-url");
    let channel = document.getElementById("channel");

    if (channel.value.length < 1) {
        alert("You must enter a channel name.");
        return false;
    }

    let currentURL = new URL(location.pathname, location.href).href
    url.value = currentURL + 'bot.html?channel=' + channel.value;

    let length = document.getElementById("display-length").value;

    if (length != 8)
        url.value += "&duration=" + parseInt(length) * 1000;


    let config = document.getElementById("configure");
    let link = document.getElementById("botlink");

    config.style.display = "none";
    link.style.display = "block";

}

window.loadCards = loadCards;
window.connectChat = connectChat;
window.generateLink = generateLink;