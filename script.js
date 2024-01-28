let maxScore = 101;
const randomNames = ["Martin", "Peter", "Ondrej", "Michal", "Lukas"];
let players       = [];
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
        createToast(false,'Enter Number')
    }
})

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
}

function createGame() {
        
    if(players.length==0){
        createToast(false,'Zadaj hracov')
        return false;
    }  
     
    $("#setUsers").fadeOut('slow');
    $("#game").fadeIn('slow');

    players.forEach(player => {
        $("#players-cards").append(createPlayerCardContainer(player))
    });

    /* set active player */
    $("#"+players[activePlayer].id).addClass("text-bg-primary")
    howToEndGame()
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
        .before(`
            <li class="list-inline-item round-score">${multiplierIntoLetter(multiplier) + hit } </li>
        `);
        
        $(".user-round-score-total-"+players[activePlayer].id+":last").text(totalRoundScore);
    }
    resetMultiplier();
    

    if( (players[activePlayer].score - roundScore  ) <= 0 ) {
        if( players[activePlayer].score - roundScore   == 0 ) {
            /** vyhral */
            players[activePlayer].status = false;
            $("#score-"+players[activePlayer].id).text(players[activePlayer].score - roundScore)
            $("#score-"+players[activePlayer].id).addClass('text-success');
            players[activePlayer].score = players[activePlayer].score - roundScore;
             

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
                    $("#"+players[activePlayer].id+" .card-title").addClass('text-success')
                    break;
            }
            
            orderOfWinners++;
            myModal.toggle()
            nextPlayersMove();
            return false;
        } else {
            /** prehodil */
            $(".user-round-score-total-"+players[activePlayer].id+":last").addClass('text-danger');
            $("#score-"+players[activePlayer].id).text(currentScore)
            players[activePlayer].score = currentScore;    
            nextPlayersMove();
            return false;
        }
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
        nextPlayersMove();
        return false;
    }else{
        howToEndGame()
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
        if( players[activePlayer].status == false ){
            
            
            nextPlayersMove();
        }
    }
    howToEndGame()
    $("#"+players[activePlayer].id).addClass("text-bg-primary");
}

function bestWayToEndGame1Darts (score) {
    let dart1 = 0;
    let dart1Mod = 1;

    bestString = "none";
    bestSum = 0;

    for (dart1Mod = 3; dart1Mod >= 1; dart1Mod--) {
        for (dart1 = 20; dart1 >= 0; dart1--) {

            testScore = score - dart1*dart1Mod;

            if (dart1 != 0 && dart1Mod != 2 && testScore != 50) {
                continue;
            }

            if (testScore == 0 || (testScore == 50 && dart1 == 0)){

                returnString = "";

                if (testScore == 50 && dart1 == 0) {
                    returnString += "50";
                }  else {
                    returnString += multiplierIntoLetter(dart1Mod) + dart1 + " ";
                }

                sum = 3*dart1;
                if (dart1 == 0 && testScore == 0) {
                    sum += 300;
                } else if (testScore == 0) {
                    sum += 100;
                }
                if (dart1Mod == 3){
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
    let dart1 = 0;
    let dart1Mod = 1;

    let dart2 = 0;
    let dart2Mod = 1;

    bestString = "none";
    bestSum = 0;

    for (dart1Mod = 3; dart1Mod >= 1; dart1Mod--) {

        for (dart2Mod = 3; dart2Mod >= 1; dart2Mod--) {

            for (dart1 = 20; dart1 >= 1; dart1--) {

                for (dart2 = 20; dart2 >= 0; dart2--) {

                    testScore = score - dart1*dart1Mod - dart2*dart2Mod;

                    if (dart2 == 0 && dart1 != 0 && dart1Mod != 2 && testScore != 50) {
                        continue;
                    }

                    if (testScore == 0 || (testScore == 50 && dart2 == 0)){

                        returnString = "";

                        returnString += multiplierIntoLetter(dart1Mod) + dart1 + " ";

                        if (dart2 > 0) {
                            returnString += multiplierIntoLetter(dart2Mod) + dart2 + " ";
                        }

                        if (testScore == 50 && dart2 == 0) {
                            returnString += "50";
                        }  

                        sum = dart1+3*dart2;
                        if (dart2 == 0 && testScore == 0) {
                            sum += 300;
                        } else if (testScore == 0) {
                            sum += 100;
                        }
                        if (dart1Mod == 3){
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

    let dart1 = 0;
    let dart1Mod = 1;

    let dart2 = 0;
    let dart2Mod = 1;

    let dart3 = 0;
    let dart3Mod = 2;

    bestString = "none";
    bestSum = 0;

    for (dart1Mod = 3; dart1Mod >= 1; dart1Mod--) {
        for (dart2Mod = 3; dart2Mod >= 1; dart2Mod--) {
            for (dart1 = 20; dart1 >= 1; dart1--) {
                for (dart2 = 20; dart2 >= 0; dart2--) {
                    for (dart3 = 20; dart3 >= 0; dart3--) {

                        testScore = score - dart1*dart1Mod - dart2*dart2Mod - dart3*dart3Mod;

                        if (dart3 == 0 && dart2 != 0 && dart2Mod != 2 && testScore != 50) {
                            continue;
                        } else if (dart2 == 0 && dart1 != 0 && dart1Mod != 2 && testScore != 50) {
                            continue;
                        }

                        if (testScore == 0 || (testScore == 50 && dart3 == 0)){

                            returnString = "";

                            returnString += multiplierIntoLetter(dart1Mod) + dart1 + " ";

                            if (dart2 > 0) {
                                returnString += multiplierIntoLetter(dart2Mod) + dart2 + " ";
                            }

                            if (testScore == 50 && dart3 == 0) {
                                returnString += "50";
                            } else if (dart3 > 0) {
                                returnString += multiplierIntoLetter(dart3Mod) + dart3;
                            }

                            sum = dart1+3*dart2+5*dart3;
                            if (dart2 == 0 && dart3 == 0 && testScore == 0) {
                                sum += 300;
                            } else if (dart3 == 0 && testScore == 0) {
                                sum += 100;
                            }
                            if (dart1Mod == 3){
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
        `);
    return card;
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