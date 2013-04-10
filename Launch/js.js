/* 
NOTE: The Trello client library has been included as a Managed Resource.  To include the client library in your own code, you would include jQuery and then

<script src="https://api.trello.com/1/client.js?key=your_application_key">...

See https://trello.com/docs for a list of available API URLs

The API development board is at https://trello.com/api

The &dummy=.js part of the managed resource URL is required per http://doc.jsfiddle.net/basic/introduction.html#add-resources
*/
//-Basics-
var updateLoggedIn = function() {
    var isLoggedIn = Trello.authorized();
    $("#loggedout").toggle(!isLoggedIn);
    $("#loggedin").toggle(isLoggedIn);
};
var logout = function() {
    Trello.deauthorize();
    updateLoggedIn();
};
Trello.authorize({
    interactive: false,
    success: onAuthorize
});
$("#connectLink").click(function() {
    Trello.authorize({
        type: "popup",
        success: onAuthorize
    });
});
$("#disconnect").click(logout);
//Connect
var onAuthorize = function() {
    updateLoggedIn();
    $("#output").empty();
    //get member info
    Trello.members.get("me", function(member) {
        ShowUsername(member);
        localStorage.memberId = member.id;
        localStorage.connectTime = moment(new Date()).utc();
        $("<div>").text("Loading Data...").appendTo("#output");
        try {
            //Display member boards
            if (member.idBoards.length > 0) {
                $("#output").text("");
                $("<select>").attr({
                    id: 'boards',
                    class: 'span4'
                }).appendTo("#output");
                $('#boards').append(new Option("Select Board", null));
                $('#boards').change(function(e) {
                    ChangeBoard($(this).val());
                });
                $.each(member.idBoards, function(index, value) {
                    Trello.get('/boards/' + value, {}, function(r) {
                        //console.log(r);
                        if (!r.closed) {
                            if (r.desc !== null) {
                                $('#boards').append(new Option(r.name, r.id));
                            }
                        }
                    });
                });
            }
        } catch (e) {
            //Dont work
            console.log('Error al cargar Boards' + e);
        }
    });
};
//Load Board,List,Card
var ChangeBoard = function(boardId) {
    if (boardId !== null) {
        try {
            $("#lists> option").remove();
            $("#cards> option").remove();
            $('#lists').append(new Option("Select List", "noId"));
        } catch (e) {}
        Trello.get('/boards/' + boardId + '/lists', {}, function(lists) {
            if (!$("#lists").length) {
                $("<select>").attr({
                    id: 'lists',
                    class: 'span4'
                }).appendTo("#output");
                $('#lists').append(new Option("Select List", "noId"));
            }
            $('#lists').change(function(e) {
                ChangeList($(this).val());
            });
            $.each(lists, function(index, list) {
                //console.log(list);
                if (!list.closed) {
                    $('#lists').append(new Option(list.name, list.id));
                }
            });
        });
    }
}
var ChangeList = function(listId) {
    console.log(listId);
    if (listId !== "noId") {
        try {
            $("#cards> option").remove();
        } catch (e) {}
        Trello.get('/lists/' + listId + '/cards', {}, function(cards) {
            console.log(cards);
            if (!$("#cards").length) {
                $("<select>").attr({
                    id: 'cards',
                    class: 'span4'
                }).appendTo("#output");
            }
            $('#cards').change(function(e) {
                ChangeCard($(this).val());
            });
            $.each(cards, function(index, card) {
                console.log(card);
                if (!card.closed) {
                    console.log("localStorage.memberId" + localStorage.memberId);
                    $.each(card.idMembers, function(index, member) {
                        console.log("member" + member);
                        if (member == localStorage.memberId) {
                            $('#cards').append(new Option(card.name, card.id));
                        }
                    });
                }
            });           
            if ($('#cards option').length > 0) {
            console.log('Tarjetas asignadas' + $('#cards option').length );
            }else{
            console.log('No hay tarjetas asignadas');
            }
        });
    }
}
var ChangeCard = function(cardId) {
    console.log(cardId);
    try {
        console.log("Change card");
    } catch (e) {
        console.log("Error Change card" + e);
    }
}
//Set divs with user info
var ShowUsername = function(member) {
    try {
        $("#linkProfile").attr('href', function(i) {
            return "https://trello.com/" + member.username;
        });
        $("#linkProfile2").attr('href', function(i) {
            return "https://trello.com/" + member.username;
        });
        $("#fullName").val(member.fullName);
    } catch (e) {
        console.log('Error al cargar datos del usuario ' + e)
    }
};
//THE REAL FUN
$("#btnLog").click(function() {
    var input = $("#logInput");
    var log = $("#logHistory");
    console.log(input);
    if (input.val() != "") {
        var now = moment(new Date()).utc();
        var dataString = now.format("MMMM Do YYYY, h:mm a") + '\n' + input.val() + '\n' + log.val();
        log.val(dataString);
        input.val('');
    }
});
$("#btnStart").click(function() {
    if (!$("#cards").length) {
        console.log("no hay tarea escogida");
    } else {
        try {
            var now = moment(new Date()).utc();
            var dataString = "\n" + now.format("MMMM Do YYYY, h:mm a") + " UTC" + "\n";
            if (localStorage.cardStart) {
                localStorage.cardStart = false;
                dataString += "<strong>Finish working on </strong> " + $("#cards option:selected").text();
                $("#output").show();
            } else {
                localStorage.cardStart = true;
                dataString += "<strong>Start working in </strong> " + $("#cards option:selected").text();
                $("#output").hide();
            }
            $("#logHistory").val(function(prev) {
                if (prev == 0) {
                    return dataString;
                } else {
                    return prev + dataString;
                }
            });
            
        }
        catch (e) {
            console.log("fallo actualizar log");
        }
    }
});​