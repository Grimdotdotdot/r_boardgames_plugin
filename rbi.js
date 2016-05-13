var rsi_cache = {};
var rsi_popupClose = '<div class="rsi_close">X</div>';

$(document).ready(function () {
    // [] find all the bolded games and add a hover event
    $(".usertext-body").find("strong").each(function () {
        var $t = $(this);
        $t.mouseenter(function () {
            rsi_fetchInfo($t);
        });
    });

    // [] add a click event to allow user to close popup
    $("body").on("click", ".rsi_close", function() {
        $(".rsi_popup").remove();
    });
});

function rsi_fetchInfo($t) {
    var gameName = $t.text();

    // [] build the popup if it doesn't exist, or change it to loading
    if (!$(".rsi_popup").length) {
        $('body').append('<div class="rsi_popup">' + rsi_popupClose + '<div class="rsi_loading">Loading "' + gameName + '"...</div></div>');
    } else {
        $(".rsi_popup").html('<div class="rsi_popup">' + rsi_popupClose + '<div class="rsi_loading">Loading "' + gameName + '"...</div></div>');
    }

    // [] check the cache
    if ("undefined" != typeof rsi_cache[gameName]) {
        rsi_drawData(rsi_cache[gameName]);
    }

    // [] search BGG for the game.
    $.getJSON("https://bgg-api.herokuapp.com/api/v1/search?type=boardgame&query=" + gameName, function (data) {
        console.log(data, gameName);

        // [] if BGG can't find anything for that game, display an error message
        if (0 == parseInt(data.items['$'].total)) {
            $(".rsi_popup").html(rsi_popupClose + '"' + gameName + '" was not found!<br /><br />:-(');
            return;
        }

        // [] assume the first game is the correct game
        var id = data.items.item[0]['$'].id;

        // [] fetch the details for the game using the ID we just got
        $.getJSON("https://bgg-api.herokuapp.com/api/v1/thing?stats=1&type=boardgame&id=" + id, function (data) {
            console.log(data);

            // [] sometimes this doesn't work, and the ID can't be matched. God knows why. Display an error message
            if ("undefined" == typeof data.items.item) {
                $(".rsi_popup").html(rsi_popupClose + 'There was a problem retrieving the data for "' + gameName + '".<br /><br /><a href="http://www.boardgamegeek.com/boardgame/' + id + '" target=""_blank">Visit BGG for game info</a>.');
                return;
            }

            // [] get all the info for the game
            var name = data.items.item[0].name[0]['$'].value;
            rsi_cache[name] = data.items.item[0];
            rsi_cache[gameName] = data.items.item[0];
            rsi_drawData(data.items.item[0]);
        });
    });
}

function rsi_drawData(item) {
    // [] put the new game data into the popup window
    var html = rsi_popupClose + '<div class="rsi_title">' + item.name[0]['$'].value + '</div>';
    html += '<div class="rsi_rating">Rating: ' + Math.floor(item.statistics[0]['ratings'][0]['average'][0]['$'].value) + '/10</div>';
    html += '<div class="rsi_thumb"><img src="' + item.thumbnail[0] + '" /></div>';

    html += '<div class="rsi_link"><a href="http://www.boardgamegeek.com/boardgame/' + item['$']['id'] + '" target="_blank">Link</a></div>';
    html += '<div class="rsi_descript">' + item.description[0] + '</div>';

    $(".rsi_popup").html(html);
}