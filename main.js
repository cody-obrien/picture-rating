
let images = [];
const btn = document.getElementById('btn');
btn.addEventListener('click', async () => {
    const dirHandle = await window.showDirectoryPicker();
    const promises = [];
    for await (const entry of dirHandle.values()) {
        if (entry.kind !== 'file') {
            continue;
        }
        promises.push(entry.getFile().then((file) => URL.createObjectURL(file)))
    }
    const object_urls = await Promise.all(promises);
    console.log(object_urls);
    
    for (const object_url of object_urls) {
        let image = {
            object_url: object_url,
            player: ranking.makePlayer()
        }
        images.push(image)
    }
    startMatch(images[0], images[1]);
});

const cardsContainer = document.querySelector("cards__list")
const cardTemplateContent = document.querySelector("#card").content;
function createImageElement(file){
    const cardElement = cardTemplateContent.cloneNode(true);
    return cardElement;
}
for (const file of images){
    cardsContainer.append(createImageElement(file))
}

let image1, image2;

function startMatch(i1, i2) {
    image1 = i1;
    image2 = i2;
    
    let leftImgEl = document.getElementById("left");
    let rightImgEl = document.getElementById("right");

    leftImgEl.src = image1.object_url;
    rightImgEl.src = image2.object_url;
}

function chooseWinner(winner) {
    matches.push([image1, image2, winner]);

    // start the next match
    let imageIndex = images.indexOf(image2) + 1;
    startMatch(images[imageIndex], images[imageIndex + 1]);
}

document.getElementById("left").addEventListener('click',() => {
    chooseWinner(1);
})
document.getElementById("right").addEventListener('click',() => {
    chooseWinner(0);
})
document.getElementById("drawButton").addEventListener('click',() => {
    chooseWinner(0.5);
})

// (e.g. A for left image is better, D for right image is better, (S)kip, (T)ie, (R)andom )
document.addEventListener('keyup', e => {
    switch(e.key) {
        case 'a':
            chooseWinner(1);
            break
        case 'd':
            chooseWinner(0);
            break
        case 't':
            chooseWinner(0.5);
            break
    }
});

var settings = {
    // tau : "Reasonable choices are between 0.3 and 1.2, though the system should
    //      be tested to decide which value results in greatest predictive accuracy."
    tau : 0.5,
    // rating : default rating
    rating : 1500,
    //rd : Default rating deviation 
    //     small number = good confidence on the rating accuracy
    rd : 200,
    //vol : Default volatility (expected fluctation on the player rating)
    vol : 0.06
  };
var ranking = new glicko2.Glicko2(settings);

// Create players
var Ryan = ranking.makePlayer();
var Bob = ranking.makePlayer(1400, 30, 0.06);
var John = ranking.makePlayer(1550, 100, 0.06);
var Mary = ranking.makePlayer(1700, 300, 0.06);
var matches = [];
matches.push([Ryan, Bob, 1]); //Ryan won over Bob
matches.push([Ryan, John, 0]); //Ryan lost against John
matches.push([Ryan, Mary, 0.5]); //A draw between Ryan and Mary
ranking.updateRatings(matches);
console.log("Ryan new rating: " + Ryan.getRating());
console.log("Ryan new rating deviation: " + Ryan.getRd());
console.log("Ryan new volatility: " + Ryan.getVol());
var players = ranking.getPlayers();
var expected = ranking.predict(Ryan, Bob); // or Ryan.predict(Bob);
console.log("Ryan has " + (expected * 100) + "% chances of winning against Bob in the next match");