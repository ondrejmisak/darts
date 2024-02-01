let maxScore = 301;
const randomNames = ["Martin", "Peter", "Ondrej", "Michal", "Lukas"];
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
        "status": true,

    }
    players.push(obj)

    $("#addedPlayersList").append(`<li class="list-group-item">${playersName}</li>`)
    $("#addedPlayersList").removeClass('d-none');
    $('#startGame').fadeIn('slow');
}

function createGame() {
        
    if(players.length==0){
        createToast(false,'Zadaj hracov')
        return false;
    }  
    
    playersBackup = JSON.parse(JSON.stringify(players));

    $("#setUsers").fadeOut('slow');
    $("#game").fadeIn(1500);

    

    players.forEach(player => {
        $("#players-cards").append(createPlayerCardContainer(player))
    });
    
    $("#players-cards").prepend(createControlPanel())
    

    /* set active player */
    let activePlayer  = 0;
    $("#"+players[activePlayer].id).addClass("text-bg-primary")
    howToEndGame();
     
}

function restartGame() {
    players = JSON.parse(JSON.stringify(playersBackup));
    $("#game").fadeOut().addClass('pe-none');
    loadingScreen();
    activePlayer  = 0;
    round         = 1;
    multiplier    = 1;
    dartsLeft     = 3;
    totalRoundScore = 0;
    currentScore = 0;
    orderOfWinners = 1;
    gameStatus = true;
    $("#players-cards").empty();
    createGame();
    $("#game").removeClass('pe-none');
}


 


function addScore(hit) {

    if (!gameStatus) {
        return false;
    }

    if(dartsLeft == 3) {
        currentScore = players[activePlayer].score;
    }
    
    var roundScore = hit*multiplier;
    totalRoundScore = (totalRoundScore+roundScore);
    

    if(dartsLeft == 3) { //new row
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
    

    dartsLeft--;
    
    if(dartsLeft == 0) {

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
    var undoMulti = 1;

    //ak bude hrat sam tak to nepude
    if(dartsLeft == 3) {
        //return to prev player
         // activePlayer--   
        return false;
    }   
    var lastShotText = $("#user-round-score-"+players[activePlayer].id+" .user-round-score-row .round-score:last").html();
    
    if (lastShotText.includes("T")) {
        undoMulti = 3;
    } else if (lastShotText.includes("D")) {
        undoMulti = 2;
    } else {
        undoMulti = 1;
    }

    var lastShot = lastShotText.replace(/[^\d.-]/g, '');

    var lastShot = parseInt(lastShot);

    $("#user-round-score-"+players[activePlayer].id+" .user-round-score-row .round-score:last").remove()
    $(".user-round-score-total-"+players[activePlayer].id+":last").html('');
    if(dartsLeft == 2) {
        $("#user-round-score-"+players[activePlayer].id+ " .user-round-score-row:last").remove()
    }

    console.log((undoMulti*lastShot))
    dartsLeft++;
    totalRoundScore = (totalRoundScore-(undoMulti*lastShot));
    players[activePlayer].score = players[activePlayer].score + (undoMulti*lastShot);
    $("#score-"+players[activePlayer].id).text(players[activePlayer].score)

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


function nextPlayersMove() {
    checkIfGameIsOver();
     
    if (!gameStatus) {
        return false;
    }

    dartsLeft = 3;
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
            
            //next round here?
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
    myModal.toggle()
}
function createControlPanel() {
    var controlPanel = $(`
                    <div id="controlPanel" class="card bg-white text-black">
                        <div class="card-header border-bottom">
                            <h5 class="card-title text-center ">#</h5>
                        </div>
                        <div class="card-body text-center d-flex flex-column gap-3 overflow-y-auto">
                            <div id="roundCounter" class="text-center">
                                <ul class="list-inline border-bottom">
                                    <li class="list-inline-item round-score">1</li>
                                </ul>
                            </div>
                            <div class="route-to-endgame mt-auto text-center">

                            </div>
                        </div>
                        <div class="card-footer text-center p-2 ">
                            <button type="button" class="btn btn-outline-warning " onclick="handleUndo()"><i class="bi bi-skip-start-circle"></i></button>
                        </div>
                        <div class="card-footer text-center p-2 ">
                            <button type="button" class="btn btn-outline-danger " onclick="restartGame()"><i class="bi bi-bootstrap-reboot"></i></button>
                        </div>
                    </div>           
                `);
    return controlPanel;
}

function createPlayerCardContainer(player) {
    var card = $(`
                <div id="${player.id}" class="card ">
                <div class="card-header border-bottom">
                    <h5 class="card-title text-center ">${player.name}</h5>
                </div>
                <div class="card-body text-center d-flex flex-column gap-3 overflow-y-auto">
                    <div id="user-round-score-${player.id}" class="text-end">
                        
                    </div>
                    
                    <div class="route-to-endgame mt-auto text-center">
                       
                    </div>
                </div>
                <div class="card-footer text-center p-2 border-top">
                    <h4 id="score-${player.id}">${player.score}</h4>
                </div>
            </div>           
        `).effect( "bounce", 1000 );
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
        console.log(dartsLeft)
        switch(dartsLeft) {
            case 3:
                console.log('3 sipky')
                $("#"+players[activePlayer].id+" .route-to-endgame").html(`<h4 class="badge bg-secondary">${bestWayToEndGame(players[activePlayer].score)}</h4>`)
                console.log(bestWayToEndGame(players[activePlayer].score))
                break;
            case 2:
                console.log('2 sipky')
                $("#"+players[activePlayer].id+" .route-to-endgame").html(`<h4 class="badge bg-secondary">${bestWayToEndGame2Darts(players[activePlayer].score)}</h4>`)
                console.log(bestWayToEndGame2Darts(players[activePlayer].score))
                break;
            case 1:
                console.log('1 sipka')
                $("#"+players[activePlayer].id+" .route-to-endgame").html(`<h4 class="badge bg-secondary">${bestWayToEndGame1Darts(players[activePlayer].score)}</h4>`)
                console.log(bestWayToEndGame1Darts(players[activePlayer].score))
                break;
            default:
                console.log('default sipka')
                $("#"+players[activePlayer].id+" .route-to-endgame").html(`<h4 class="badge bg-secondary">${bestWayToEndGame(players[activePlayer].score)}</h4>`)
                console.log(bestWayToEndGame(players[activePlayer].score))

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
 


