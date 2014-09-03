chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.method === "chatBubbles") {
        console.log("Begin searching for chats to replace.");
        var interval = setInterval(function() {
            var unparsedChats = findUnparsedChats();
            if (unparsedChats.length) {
                unparsedChats.each(function() {
                    $(this).addClass("parsed-chat")
                    convertChatToBubbles($(this));
                });
            } else if ($(".comment_input_wrapper:visible .body").length) {
                clearInterval(interval);
            }
        });
    }
});

function findUnparsedChats() {
    return $(".comment:visible:not(.parsed-chat)").filter(function() {
        return $(this).text().match(/\(\d\d:\d\d:\d\d [A|P]M\) /g);
    })
}

function convertChatToBubbles(chat) {
    var chatBody = chat.children("p:not(:contains(was closed and merged into this request))");
    var chatTexts = [];
    chatBody.each(function() {
        chatTexts.push($(this).text());
    });
    var chatText = chatTexts.join("\n");
    console.log("chat text", chatText);

    var conversationWrapper = $("<div/>", {"class": "conversation"});
    conversationWrapper.insertBefore(chatBody);

    var messages = parseChat(chatText);
    makeBubbles(messages, conversationWrapper);
    chatBody.remove();
}

function parseChat(chatText) {
    return chatText.split("\n");
}

function makeBubbles(messages, conversationWrapper) {
    var displayedCount = 0;
    messages.forEach(function(message) {
        var messageRe = /\((.+)\) ([^:]+): (.+)\s*/g;
        var messageMatch = messageRe.exec(message);
        var noteRe = /\(.+\) \*\*\* (.+) \*\*\*/g;
        var noteMatch = noteRe.exec(message);
        if (messageMatch) {
            var timestamp = messageMatch[1];
            var sender = messageMatch[2];
            var messageText = messageMatch[3];
            if (sender.match("SYSTEM")) {
                appendNote(messageText, conversationWrapper);
            } else {
                var showTimestamp = displayedCount % 5 === 0;
                displayedCount ++;
                appendMessage(timestamp, sender, messageText, showTimestamp, conversationWrapper);
            }
        } else if (noteMatch) {
            appendNote(noteMatch[1], conversationWrapper);
        } else if (message.match("Chat started on")) {
            appendNote(message, conversationWrapper);
        } else {
            // append to last bubble if doesn't match any regex, since that's
            // probably a newline in the original message.
            var lastBubble = $(conversationWrapper).find(".bubble:last");
            $("<p/>").text(message).appendTo(lastBubble);
        }
    });
}


function appendNote(noteText, conversationWrapper) {
    $("<p/>", {"class": "datestamp"})
        .text(noteText)
        .appendTo(conversationWrapper);
}


function appendMessage(timestamp, sender, messageText, showTimestamp, conversation, isQSAgent) {
    messageText = messageText.trim();
    sender = sender.trim();
    if (messageText === "") return;
    
    if (showTimestamp) {
        $("<p/>", {"class": "datestamp"})
            .text(timestamp)
            .appendTo(conversation);
    }

    isQSAgent = isQSAgent || nameIsQSAgent(sender);
    var bubbleClass = isQSAgent ? "bubble bubble-alt yellow" : "bubble green";
    var newBubble = $("<div/>", {
        "class": bubbleClass, 
        "title": timestamp
    });
    newBubble.text(messageText)
        .addClass(bubbleClass);

    if (sender !== "") {
        var senderSpan = $("<span/>", {"class": "sender"}).text(sender + ": ");
        newBubble.prepend(senderSpan);
    }
    newBubble.appendTo(conversation);
}

function nameIsQSAgent(sender) {
    var qsAgents = ["Anna", "Azroy", "Elisabeth", "Rick", "Victor", "Azreen", "Ben", "Bernadette", "Elka", "Emily", "Ezekiel", "Marsha", "Regie"];
    for (var i = 0; i < qsAgents.length; i++) {
        if (sender.match(qsAgents[i])) {
            return true;
        }
    }
    return false;
}
