let maxScore = 51;
const randomNames = ["Martin", "Peter", "Ondrej", "Michal", "Lukas", "Jozko", "Andrej", "Matus", "Dominika"];
let players       = [];
let playersBackup = [];
let activePlayer  = 0;
let round         = 1;
let multiplier    = 1;
let dartsLeft     = 3;
let totalRoundScore = 0;
var currentScore = 0;
var orderOfWinners = 1;
let gameStatus = true;

let canVibrate = false;
if('vibrate' in navigator)
  canVibrate = true;

const audio_START = new Audio("assets/audio/PSX.mp3");
const audio = new Audio("assets/audio/pew-pew.mp3");
const audio_win = new Audio("assets/audio/bad-to-the-bone.mp3");
const audio_loss = new Audio("assets/audio/nein.mp3");


$( document ).ready(function() {
   
    $("#loader").fadeIn("slow")
    $("#loader").fadeOut("slow", function() {
        $(this).removeClass("d-flex");
        $("#setMaxScore").fadeIn("slow")
        
    }); 
});

/** scene #1 */
function setMaxScore(score){
    
    maxScore = score;
    let scoreScreen = $("#setMaxScore");
    scoreScreen.fadeOut().removeClass('d-flex');
    let usersScreen = $("#setUsers");
    usersScreen.fadeIn();
}

$("#btn-set-custom-score").click(function(){
    if($("#custom-score").val() !== '' &&  $("#custom-score").val() >= 1) {
        setMaxScore($("#custom-score").val());
    }else {
        createToast(false,'Zadaj číslo')
    }
    
})

/** scene #2 */
function setPlayersName() {
    let playersName = $("#players-name").val();
    if(playersName !== '') {
        createPlayer(playersName);
        $("#players-name").val('')
        $("#players-name").focus()
    }else {
        createToast(false,'Enter name')
    }
}

function createPlayer(playersName) {
    
    playerId = generateRandomString(7);
    var obj = {

        "id": playerId,
        "name": playersName,
        "score": maxScore,
        "darts": dartsLeft,
        "status": true,

    }
    players.push(obj)

    $("#addedPlayersList").append(`<li class="list-group-item">${playersName}</li>`)
    $("#addedPlayersList").removeClass('d-none');
    $('#startGame').fadeIn('slow');
}


function createGame() {
    audio_START.cloneNode(true).play();
playersTest = 
    [
        {
            "id": "B2uFPuOB",
            "name": "Martin",
            "score": 51,
            "darts":3,
            "status": true
        },
        {
            "id": "3jX7S0uU",
            "name": "Andrej",
            "score": 51,
            "darts":3,
            "status": true
        },
        {
            "id": "uaYx8vk3",
            "name": "Lukas",
            "score": 51,
            "darts":3,
            "status": true
        }
        ,{
            "id": "B2uFPuOX",
            "name": "Martin 2",
            "score": 51,
            "darts":3,
            "status": true
        } 
        ,{
            "id": "C2uFPuOX",
            "name": "Emil",
            "score": 51,
            "darts":3,
            "status": true
        },
    ];
        
    if(players.length==0){
        createToast(false,'Zadaj hracov')
        return false;
    }  
    
    playersBackup = JSON.parse(JSON.stringify(players));
    /*  test*/
    //$("#loader").remove();
    //$("#setMaxScore").remove()
    /* /test*/
    $("#setUsers").fadeOut('slow');
    $("#game").fadeIn(1500);
    
    var controlPanel = createControlPanel();
    $("#players-cards").prepend(controlPanel);
    controlPanel.show('drop',timer,'easeInOutQuint')
    var timer = 50;
    let activePlayer  = 0;

    players.forEach(player => {
        var playerCard = createPlayerCardContainer(player);
         
        $("#players-cards").append(playerCard)
        timer=timer+150;
        
        setTimeout( function(){
            playerCard.show('drop',timer,'easeInOutQuint');
        }, (timer*4));
    });
   
    $("#"+players[activePlayer].id).addClass("text-bg-primary");
    howToEndGame();
}

function setFirstPlayerActive() {
    $("#"+players[activePlayer].id).removeClass("text-bg-primary");
    activePlayer  = 0;
    players[activePlayer].darts = 3;
    players[activePlayer].status = true;
    $("#"+players[activePlayer].id).addClass("text-bg-primary");
}
 

function restartGame() {
    players = JSON.parse(JSON.stringify(playersBackup));

    $("#game").fadeOut().addClass('pe-none');
    loadingScreen();
    activePlayer  = 0;
    round         = 1;
    multiplier    = 1;
    //dartsLeft     = 3;
    totalRoundScore = 0;
    currentScore = 0;
    orderOfWinners = 1;
    gameStatus = true;
    $("#players-cards").empty();
    createGame();
    $("#game").removeClass('pe-none');
}


function addScore(element, hit) {
   
    if( $(element).hasClass("resume-to-game") ) {
        players[activePlayer].darts = 3
        $('button.btn-add-score').removeClass('resume-to-game')
    }
    
    if (!gameStatus) {
        return false;
    }

    if (canVibrate) 
    navigator.vibrate(500);
    audio.cloneNode(true).play();

    var totalRoundScore1 = $(".user-round-score-total-"+players[activePlayer].id+":last").html();
    
    if(!totalRoundScore1){
        players[activePlayer].darts = 3
    } 

    if(players[activePlayer].darts == 3) {
        currentScore = players[activePlayer].score;
    }
    
    var roundScore = hit*multiplier;
    
    totalRoundScore = (totalRoundScore+roundScore);

    if(players[activePlayer].darts == 3) { //new row
        $("#user-round-score-"+players[activePlayer].id).append(` 
            <ul class="list-inline user-round-score-row border-bottom">
                <li class="list-inline-item round-score">${multiplierIntoLetter(multiplier) + hit }</li>
                <li class="list-inline-item"><b>( <span class="user-round-score-total-${players[activePlayer].id}">${totalRoundScore}</span> )</b></li>
            </ul>
        `);
    }else { //append to existing row
        $("#user-round-score-"+players[activePlayer].id+" .user-round-score-row .list-inline-item:last")
        .before(`<li class="list-inline-item round-score">${multiplierIntoLetter(multiplier) + hit } </li>`);
        
        $(".user-round-score-total-"+players[activePlayer].id+":last").text(totalRoundScore);
    }

    resetMultiplier();
    

    if( (players[activePlayer].score - roundScore  ) < 0 ) {
        /** prehodil */
        
        $(".user-round-score-total-"+players[activePlayer].id+":last").addClass('text-danger');
        $("#score-"+players[activePlayer].id).text(currentScore)
        players[activePlayer].score = currentScore;   
        
        if(players[activePlayer].darts == 3) {
            $("#user-round-score-"+players[activePlayer].id+" .user-round-score-row .list-inline-item:last")
            .before(`<li class="list-inline-item round-score">0</li>`);
            $("#user-round-score-"+players[activePlayer].id+" .user-round-score-row .list-inline-item:last")
            .before(`<li class="list-inline-item round-score">0</li>`);
           
        }
        if(players[activePlayer].darts == 2) {
            $("#user-round-score-"+players[activePlayer].id+" .user-round-score-row .list-inline-item:last")
            .before(`<li class="list-inline-item round-score">0</li>`);
           
        }
        audio_loss.cloneNode(true).play();
        nextPlayersMove();
        return false;
    }

    $("#score-"+players[activePlayer].id).text(players[activePlayer].score - roundScore)
    players[activePlayer].score = players[activePlayer].score - roundScore;

    /* 
        objIndex = players.findIndex((obj => obj.id == playerId));
        console.log(objIndex)
        players[objIndex].score = 10;
        console.log(players);
    */
    players[activePlayer].darts--;

    if(players[activePlayer].darts == 0) {

        if( players[activePlayer].score == 0 ) {
            /** vyhral */
            players[activePlayer].status = false;
            $("#score-"+players[activePlayer].id).text(players[activePlayer].score)
            $("#score-"+players[activePlayer].id).addClass('text-success');

            showWinningModal();
            
            orderOfWinners++;
           
            nextPlayersMove();
            return false;
        } 
        
        nextPlayersMove();
        return false;
    }else{
        howToEndGame()
    }
 
}

function handleUndo() {

    if (canVibrate) 
    navigator.vibrate(500);


    var undoMulti = 1;
    //ak bude hrat sam tak to nepude
    if(players[activePlayer].darts == 3) {
        // setFirstPlayerActive();
        prevPlayersMove()
        //lastShotText = 0;
        totalRoundScore = 0;
        players[activePlayer].darts = 0;
        //return false;
    } 

    var lastShotText = $("#user-round-score-"+players[activePlayer].id+" .user-round-score-row .round-score:last").html();

    if(!lastShotText) {
        prevPlayersMove()
        totalRoundScore = 0;
        players[activePlayer].darts = 0;
        /**  add class to all buttons*/
        $('button.btn-add-score').addClass('resume-to-game');
        return false;
    }
    
    undoMulti = multiplierIntoNumber(lastShotText);
     
    var lastShot = lastShotText.replace(/[^\d.-]/g, '');

    lastShot = parseInt(lastShot);

    totalRoundScore = $(".user-round-score-total-"+players[activePlayer].id+":last").html();
    if(!totalRoundScore){
        totalRoundScore = 0;
    } 
    totalRoundScore = (totalRoundScore-(undoMulti*lastShot)); 
    totalRoundScore = parseInt(totalRoundScore);

    $("#user-round-score-"+players[activePlayer].id+" .user-round-score-row .round-score:last").remove()

    // prehodil
    if ($(".user-round-score-total-"+players[activePlayer].id+":last").hasClass( "text-danger" )) {
        
        if(totalRoundScore <= players[activePlayer].score) {
            $(".user-round-score-total-"+players[activePlayer].id+":last").removeClass('text-danger');
            players[activePlayer].score = players[activePlayer].score - (getValuesFromLastRow());
        }  
    }else{
        players[activePlayer].score = players[activePlayer].score + (undoMulti*lastShot);
    }
    /* tu to bolo, ale co tu bolo? */  
     

    $("#score-"+players[activePlayer].id).text(players[activePlayer].score)
    $(".user-round-score-total-"+players[activePlayer].id+":last").text(totalRoundScore)


    if(players[activePlayer].darts == 2) {
        $("#user-round-score-"+players[activePlayer].id+ " .user-round-score-row:last").remove()
    }

    
    if(players[activePlayer].darts <= 2) {
        players[activePlayer].darts++;
    }
}

function getValuesFromLastRow() {
    let rowScore = 0;
    let row = $("#user-round-score-"+players[activePlayer].id+" .user-round-score-row:last li.round-score");
     
    row.each(function () {
        columnScore = multiplierIntoNumber($(this).text())*$(this).text().replace(/[^\d.-]/g, '')
        rowScore = rowScore+columnScore
    });
    return rowScore;
}



function checkIfGameIsOver() {
    var winners = new Set(players.map((item) => item.status));
     
    if( players[activePlayer].status == false){
        if( [...winners].length === 1 ) {
            console.log('winners true');
            gameStatus = false;
            $(".card").removeClass('text-bg-primary')
        }
    }
    
}

function prevPlayersMove() {
    
    $("#"+players[activePlayer].id).removeClass("text-bg-primary")
    activePlayer--;
   
    if(activePlayer < 0 && activePlayer < players.length + 1){
        activePlayer = players.length - 1;
        
        if(players[activePlayer].status === false) {
            prevPlayersMove();
        }
       
    }else{
        activePlayer = activePlayer--;
        
        if( players[activePlayer].status == false ){
            prevPlayersMove();
        }
    }
    players[activePlayer].status = true;
    
    $("#"+players[activePlayer].id).addClass("text-bg-primary")
}


function nextPlayersMove() {

    checkIfGameIsOver();
     
    if (!gameStatus) {
        return false;
    }

    players[activePlayer].darts = 3; //prev player
    totalRoundScore = 0;

    $("#"+players[activePlayer].id).removeClass("text-bg-primary")
    if(activePlayer >= 0 && activePlayer < players.length - 1){
        activePlayer = activePlayer + 1;

        if(players[activePlayer].status === false) {
            nextPlayersMove();
        }
    }else{
        activePlayer = 0;
        round++;
        $("#roundCounter").append(`<ul id="roundCounter" class="list-inline border-bottom">
                                        <li class="list-inline-item round-score">${round}</li>
                                    </ul>`);
        
        if( players[activePlayer].status == false ){
            //next round here? yes indeed
            nextPlayersMove();
        }

    }

    howToEndGame()
    $("#"+players[activePlayer].id).addClass("text-bg-primary");

}


function showWinningModal () {
    switch (orderOfWinners) {
        case 1 :
            $('.modal-body').html(`<h${orderOfWinners}>${orderOfWinners}. ${players[activePlayer].name} 🥇</h${orderOfWinners}>`);
            $("#"+players[activePlayer].id+" .card-title").html(players[activePlayer].name+ " 🥇").addClass('text-success')
            break;
        case 2:
            $('.modal-body').html(`<h${orderOfWinners}>${orderOfWinners}. ${players[activePlayer].name} 🥈</h${orderOfWinners}>`);
            $("#"+players[activePlayer].id+" .card-title").html(players[activePlayer].name+ " 🥈").addClass('text-success')
            break;
        case 3:
            $('.modal-body').html(`<h${orderOfWinners}>${orderOfWinners}. ${players[activePlayer].name} 🥉</h${orderOfWinners}>`);
            $("#"+players[activePlayer].id+" .card-title").html(players[activePlayer].name+ " 🥉").addClass('text-success')
            break;
        default:
            $('.modal-body').html(`<h${orderOfWinners}>${orderOfWinners}. ${players[activePlayer].name} 🥔</h${orderOfWinners}>`);
            $("#"+players[activePlayer].id+" .card-title").html(players[activePlayer].name+ " 🥔").addClass('text-success')
            break;
    }

    myModal.toggle();
    audio_win.cloneNode(true).play();
    //todo
    /*const myModalEl = document.getElementById('exampleModal')
        myModalEl.addEventListener('hidden.bs.modal', event => {
        poofOff()
    })*/
}
function createControlPanel() {
    var controlPanel = $(`
                    <div id="controlPanel" class="card bg-white text-black" style="display:none">
                        <div class="card-header border-bottom">
                            <h5 class="card-title text-center ">#</h5>
                        </div>
                        <div class="card-body text-center d-flex flex-column gap-3 overflow-y-auto">
                            <div id="roundCounter" class="text-center">
                                <ul class="list-inline border-bottom">
                                    <li class="list-inline-item round-score">1</li>
                                </ul>
                            </div>
                            <div class=" mt-auto text-center">

                            </div>
                        </div>
                        
                        <div class="card-footer text-center p-2 ">
                            <button type="button" class="btn btn-outline-muted " onclick="toggleFullScreen()" title="Full screen" ><i class="bi bi-arrows-fullscreen"></i></button>
                        </div>
                        <div class="card-footer text-center p-2 d-none">
                            <button type="button" class="btn btn-outline-muted " onclick="prevPlayersMove()" title="Predchadzajuci hrac" ><i class="bi bi-arrow-left-circle"></i></button>
                        </div>
                        <div class="card-footer text-center p-2 ">
                            <button type="button" class="btn btn-outline-muted " onclick="handleUndo()" id="handleUndo" title="Vymazat skore"><i class="bi bi-skip-start-circle"></i></button>
                        </div>
                        <div class="card-footer text-center p-2 ">
                            <button type="button" class="btn btn-outline-muted " onclick="restartGame()" title="Reset hry"><i class="bi bi-bootstrap-reboot"></i></button>
                        </div>
                    </div>           
                `);
    return controlPanel;
}

function createPlayerCardContainer(player) {
    var card = $(`
                <div id="${player.id}" class="card " style="display:none">
                <div class="card-header border-bottom">
                    <h5 class="card-title text-center ">${player.name}</h5>
                </div>
                <div class="card-body text-center d-flex flex-column gap-3 overflow-y-auto">
                    <div id="user-round-score-${player.id}" class="text-end">
                        
                    </div>
                    
                    <span class="route-to-endgame mt-auto text-center badge bg-dark">
                    
                    </span>
                </div>
                <div class="card-footer text-center p-2 border-top">
                    <h4 id="score-${player.id}">${player.score}</h4>
                </div>
            </div>           
        `);
    return card;
};

function resetMultiplier() {
    multiplier = 1;
    $(".multipliersetter").removeClass('bg-success');
    $(".hide-by-multiplier").removeClass('opacity-0 pe-none');
}
 
 
$(document).on("click",".multipliersetter",function(e) {
    e.preventDefault();

    if($(this).hasClass('bg-success')) {
        multiplier = 1;
        $(this).removeClass("bg-success");
        $(".hide-by-multiplier").removeClass('opacity-0 pe-none')
    }else {
        multiplier = $(this).data('number');
        $(".multipliersetter").removeClass('bg-success');
        $(this).addClass('bg-success');
        $(".hide-by-multiplier").addClass('opacity-0 pe-none')
    }
});

function howToEndGame() {

    if(players[activePlayer].score <= 170) {
        //console.log(dartsLeft)
        switch(players[activePlayer].darts) {
            case 3:
                //console.log('3 sipky')
                $("#"+players[activePlayer].id+" .route-to-endgame").html(`<h6 class="p-2 ">${bestWayToEndGame(players[activePlayer].score)}</h6>`)
                //console.log(bestWayToEndGame(players[activePlayer].score))
                break;
            case 2:
                //console.log('2 sipky')
                $("#"+players[activePlayer].id+" .route-to-endgame").html(`<h6 class="  ">${bestWayToEndGame2Darts(players[activePlayer].score)}</h6>`)
                //console.log(bestWayToEndGame2Darts(players[activePlayer].score))
                break;
            case 1:
                //console.log('1 sipka')
                $("#"+players[activePlayer].id+" .route-to-endgame").html(`<h6 class="  ">${bestWayToEndGame1Darts(players[activePlayer].score)}</h6>`)
                //console.log(bestWayToEndGame1Darts(players[activePlayer].score))
                break;
            default:
                //console.log('default sipka')
                $("#"+players[activePlayer].id+" .route-to-endgame").html(`<h6 class="  ">${bestWayToEndGame(players[activePlayer].score)}</h6>`)
                //console.log(bestWayToEndGame(players[activePlayer].score))

                break;
        }

    }else{
        $("#"+players[activePlayer].id+" .route-to-endgame").html('')
    }
     
}

function bestWayToEndGame1Darts (score) {
    let dartThrow1 = 0;
    let dartThrow1Multi = 1;

    bestString = "---";
    bestSum = 0;

    for (dartThrow1Multi = 3; dartThrow1Multi >= 1; dartThrow1Multi--) {
        for (dartThrow1 = 20; dartThrow1 >= 0; dartThrow1--) {

            testScore = score - dartThrow1*dartThrow1Multi;

            if (dartThrow1 != 0 && dartThrow1Multi != 2 && testScore != 50) {
                continue;
            }

            if (testScore == 0 || (testScore == 50 && dartThrow1 == 0)){

                returnString = "";

                if (testScore == 50 && dartThrow1 == 0) {
                    returnString += "50";
                }  else {
                    returnString += multiplierIntoLetter(dartThrow1Multi) + dartThrow1 + " ";
                }

                sum = 3*dartThrow1;
                if (dartThrow1 == 0 && testScore == 0) {
                    sum += 300;
                } else if (testScore == 0) {
                    sum += 100;
                }
                if (dartThrow1Multi == 3){
                    sum += 50;
                }
                
                if (sum > bestSum){
                    bestSum = sum;
                    bestString = returnString;
                }
            }
        }
    }
    return bestString;
}

 
function bestWayToEndGame2Darts (score) {
    let dartThrow1 = 0;
    let dartThrow1Multi = 1;

    let dartThrow2 = 0;
    let dartThrow2Multi = 1;

    bestString = "---";
    bestSum = 0;

    for (dartThrow1Multi = 3; dartThrow1Multi >= 1; dartThrow1Multi--) {

        for (dartThrow2Multi = 3; dartThrow2Multi >= 1; dartThrow2Multi--) {

            for (dartThrow1 = 20; dartThrow1 >= 1; dartThrow1--) {

                for (dartThrow2 = 20; dartThrow2 >= 0; dartThrow2--) {

                    testScore = score - dartThrow1*dartThrow1Multi - dartThrow2*dartThrow2Multi;

                    if (dartThrow2 == 0 && dartThrow1 != 0 && dartThrow1Multi != 2 && testScore != 50) {
                        continue;
                    }

                    if (testScore == 0 || (testScore == 50 && dartThrow2 == 0)){

                        returnString = "";

                        returnString += multiplierIntoLetter(dartThrow1Multi) + dartThrow1 + " ";

                        if (dartThrow2 > 0) {
                            returnString += multiplierIntoLetter(dartThrow2Multi) + dartThrow2 + " ";
                        }

                        if (testScore == 50 && dartThrow2 == 0) {
                            returnString += "50";
                        }  

                        sum = dartThrow1+3*dartThrow2;
                        if (dartThrow2 == 0 && testScore == 0) {
                            sum += 300;
                        } else if (testScore == 0) {
                            sum += 100;
                        }
                        if (dartThrow1Multi == 3){
                            sum += 50;
                        }
                        
                        if (sum > bestSum){
                            bestSum = sum;
                            bestString = returnString;
                        }
                    }
                }
            }
        }
    }
    return bestString;
}

function bestWayToEndGame(score){

    let dartThrow1 = 0;
    let dartThrow1Multi = 1;

    let dartThrow2 = 0;
    let dartThrow2Multi = 1;

    let dartThrow3 = 0;
    let dartThrow3Multi = 2;

    bestString = "---";
    bestSum = 0;

    for (dartThrow1Multi = 3; dartThrow1Multi >= 1; dartThrow1Multi--) {
        for (dartThrow2Multi = 3; dartThrow2Multi >= 1; dartThrow2Multi--) {
            for (dartThrow1 = 20; dartThrow1 >= 1; dartThrow1--) {
                for (dartThrow2 = 20; dartThrow2 >= 0; dartThrow2--) {
                    for (dartThrow3 = 20; dartThrow3 >= 0; dartThrow3--) {

                        testScore = score - dartThrow1*dartThrow1Multi - dartThrow2*dartThrow2Multi - dartThrow3*dartThrow3Multi;

                        if (dartThrow3 == 0 && dartThrow2 != 0 && dartThrow2Multi != 2 && testScore != 50) {
                            continue;
                        } else if (dartThrow2 == 0 && dartThrow1 != 0 && dartThrow1Multi != 2 && testScore != 50) {
                            continue;
                        }

                        if (testScore == 0 || (testScore == 50 && dartThrow3 == 0)){

                            returnString = "";

                            returnString += multiplierIntoLetter(dartThrow1Multi) + dartThrow1 + " ";

                            if (dartThrow2 > 0) {
                                returnString += multiplierIntoLetter(dartThrow2Multi) + dartThrow2 + " ";
                            }

                            if (testScore == 50 && dartThrow3 == 0) {
                                returnString += "50";
                            } else if (dartThrow3 > 0) {
                                returnString += multiplierIntoLetter(dartThrow3Multi) + dartThrow3;
                            }

                            sum = dartThrow1+3*dartThrow2+5*dartThrow3;
                            if (dartThrow2 == 0 && dartThrow3 == 0 && testScore == 0) {
                                sum += 300;
                            } else if (dartThrow3 == 0 && testScore == 0) {
                                sum += 100;
                            }
                            if (dartThrow1Multi == 3){
                                sum += 50;
                            }

                            if (sum > bestSum){
                                bestSum = sum;
                                bestString = returnString;
                            }

                        }
                    }
                }
            }
        }
    }

    return bestString;

}


const myModal = new bootstrap.Modal('#exampleModal', {
    keyboard: true
})

function getRandomName() {
    const randomValue = randomNames[Math.floor(Math.random() * randomNames.length)];
    $("#players-name").val(randomValue);
}

function generateRandomString(string_length) {
    var character, characters, i, rand, string;
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    string = '';
    i = 0;
    while (i <= string_length) {
      rand = Math.round(Math.random() * (characters.length - 1));
      character = characters.substr(rand, 1);
      string = string + character;
      i++;
    }
    return string;
 };

  function multiplierIntoLetter(multiplier){
    switch (multiplier) {
        case 1:
            return "";
            break;
        case 2:
            return "D";
            break;
        case 3:
            return "T";
            break;
        default:
            return "";
            break;
    }
}

function multiplierIntoNumber(multiplier) {
    if (multiplier.includes("T")) {
       return 3;
    } else if (multiplier.includes("D")) {
        return 2;
    } else {
        return 1;
    }
}

function createToast(isSuccess, toastMessage) {
    var toastContainer = createToastContainer(isSuccess, toastMessage);
    $("#toast-holder").prepend(toastContainer);
    toastContainer.toast('show');
    destroyToast(toastContainer);
}

function createToastContainer(isSuccess, toastMessage) {
    var toastClass = 'text-bg-primary';
    if(isSuccess == true){
        toastClass = 'text-bg-success';
    }else{
        toastClass = 'text-bg-danger';
    }
    var toast = $(` 
                    <div class="toast align-items-center ${toastClass} border-0 rounded-3 " role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="d-flex">
                        <div class="toast-body">
                            ${toastMessage}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                    </div>
                `);
    return toast;
}

function destroyToast(toastContainer) {
    setTimeout(function() {
        toastContainer.fadeOut(500, function() {
        toastContainer.remove();
        });
    }, 5000);
}
 
   
function loadingScreen() {
    var loadingScreen = $(`<div style="display:none" class="vh-100 text-center d-flex justify-content-center align-items-center">
                            <div class="spinner-grow text-primary" role="status">
                                <span class="sr-only"></span>
                            </div>
                        </div>`);
    $('body').prepend(loadingScreen).fadeIn();
    setTimeout(function() {
        loadingScreen.fadeOut(500, function() {
            loadingScreen.remove();
        });
    }, 1000);
}





function toggleFullScreen() {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }
  


 
  // Globals
  var random = Math.random
    , cos = Math.cos
    , sin = Math.sin
    , PI = Math.PI
    , PI2 = PI * 2
    , timerC = 10
    , frame = undefined
    , confetti = [];

  var particles = 10
    , spread = 40
    , sizeMin = 3
    , sizeMax = 12 - sizeMin
    , eccentricity = 10
    , deviation = 100
    , dxThetaMin = -.1
    , dxThetaMax = -dxThetaMin - dxThetaMin
    , dyMin = .13
    , dyMax = .18
    , dThetaMin = .4
    , dThetaMax = .7 - dThetaMin;

  var colorThemes = [
    function() {
      return color(200 * random()|0, 200 * random()|0, 200 * random()|0);
    }, function() {
      var black = 200 * random()|0; return color(200, black, black);
    }, function() {
      var black = 200 * random()|0; return color(black, 200, black);
    }, function() {
      var black = 200 * random()|0; return color(black, black, 200);
    }, function() {
      return color(200, 100, 200 * random()|0);
    }, function() {
      return color(200 * random()|0, 200, 200);
    }, function() {
      var black = 256 * random()|0; return color(black, black, black);
    }, function() {
      return colorThemes[random() < .5 ? 1 : 2]();
    }, function() {
      return colorThemes[random() < .5 ? 3 : 5]();
    }, function() {
      return colorThemes[random() < .5 ? 2 : 4]();
    }
  ];
  function color(r, g, b) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // Cosine interpolation
  function interpolation(a, b, t) {
    return (1-cos(PI*t))/2 * (b-a) + a;
  }

  // Create a 1D Maximal Poisson Disc over [0, 1]
  var radius = 1/eccentricity, radius2 = radius+radius;
  function createPoisson() {
    // domain is the set of points which are still available to pick from
    // D = union{ [d_i, d_i+1] | i is even }
    var domain = [radius, 1-radius], measure = 1-radius2, spline = [0, 1];
    while (measure) {
      var dart = measure * random(), i, l, interval, a, b, c, d;

      // Find where dart lies
      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        a = domain[i], b = domain[i+1], interval = b-a;
        if (dart < measure+interval) {
          spline.push(dart += a-measure);
          break;
        }
        measure += interval;
      }
      c = dart-radius, d = dart+radius;

      // Update the domain
      for (i = domain.length-1; i > 0; i -= 2) {
        l = i-1, a = domain[l], b = domain[i];
        // c---d          c---d  Do nothing
        //   c-----d  c-----d    Move interior
        //   c--------------d    Delete interval
        //         c--d          Split interval
        //       a------b
        if (a >= c && a < d)
          if (b > d) domain[l] = d; // Move interior (Left case)
          else domain.splice(l, 2); // Delete interval
        else if (a < c && b > c)
          if (b <= d) domain[i] = c; // Move interior (Right case)
          else domain.splice(i, 0, c, d); // Split interval
      }

      // Re-measure the domain
      for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
        measure += domain[i+1]-domain[i];
    }

    return spline.sort();
  }

  // Create the overarching container
  var container = document.createElement('div');
  container.classList.add('confetti');
  container.style.position = 'fixed';
  container.style.top      = '0';
  container.style.left     = '0';
  container.style.width    = '100%';
  container.style.height   = '0';
  container.style.overflow = 'visible';
  container.style.zIndex   = '9999';

  // Confetto constructor
  function Confetto(theme) {
    this.frame = 0;
    this.outer = document.createElement('div');
    this.inner = document.createElement('div');
    this.outer.appendChild(this.inner);

    var outerStyle = this.outer.style, innerStyle = this.inner.style;
    outerStyle.position = 'absolute';
    outerStyle.width  = (sizeMin + sizeMax * random()) + 'px';
    outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
    innerStyle.width  = '100%';
    innerStyle.height = '100%';
    innerStyle.backgroundColor = theme();

    outerStyle.perspective = '50px';
    outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
    this.axis = 'rotate3D(' +
      cos(360 * random()) + ',' +
      cos(360 * random()) + ',0,';
    this.theta = 360 * random();
    this.dTheta = dThetaMin + dThetaMax * random();
    innerStyle.transform = this.axis + this.theta + 'deg)';

    this.x = window.innerWidth * random();
    this.y = -deviation;
    this.dx = sin(dxThetaMin + dxThetaMax * random());
    this.dy = dyMin + dyMax * random();
    outerStyle.left = this.x + 'px';
    outerStyle.top  = this.y + 'px';

    // Create the periodic spline
    this.splineX = createPoisson();
    this.splineY = [];
    for (var i = 1, l = this.splineX.length-1; i < l; ++i)
      this.splineY[i] = deviation * random();
    this.splineY[0] = this.splineY[l] = deviation * random();

    this.update = function(height, delta) {
      this.frame += delta;
      this.x += this.dx * delta;
      this.y += this.dy * delta;
      this.theta += this.dTheta * delta;

      // Compute spline and convert to polar
      var phi = this.frame % 7777 / 7777, i = 0, j = 1;
      while (phi >= this.splineX[j]) i = j++;
      var rho = interpolation(
        this.splineY[i],
        this.splineY[j],
        (phi-this.splineX[i]) / (this.splineX[j]-this.splineX[i])
      );
      phi *= PI2;

      outerStyle.left = this.x + rho * cos(phi) + 'px';
      outerStyle.top  = this.y + rho * sin(phi) + 'px';
      innerStyle.transform = this.axis + this.theta + 'deg)';
      return this.y > height+deviation;
    };
  }

  function poof() {
    if (!frame) {
      // Append the container
      document.body.appendChild(container);

      // Add confetti
      var theme = colorThemes[0]
        , count = 0;
      (function addConfetto() {
        var confetto = new Confetto(theme);
        confetti.push(confetto);
        container.appendChild(confetto.outer);
        timerC = setTimeout(addConfetto, spread * random());
      })(0);

      // Start the loop
      var prev = undefined;
      requestAnimationFrame(function loop(timestamp) {
        var delta = prev ? timestamp - prev : 0;
        prev = timestamp;
        var height = window.innerHeight;

        for (var i = confetti.length-1; i >= 0; --i) {
          if (confetti[i].update(height, delta)) {
            container.removeChild(confetti[i].outer);
            confetti.splice(i, 1);
          }
        }
        
        console.log(confetti.length )
        if (confetti.length < 250)
          return frame = requestAnimationFrame(loop);

        // Cleanup
        document.body.removeChild(container);
        frame = undefined;
      });
    }
  }
  function poofOff() {
    document.body.removeChild(container);
    frame = undefined;
  }
