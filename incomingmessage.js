const electron = require('electron');

const remote = electron.remote;

var ipc = electron.ipcRenderer;

const $ = require('jquery');

var interacted = false;

$(document).ready(() => {
    ipc.send('messageDomReady');
    $('#content-div').addClass('translucent');
});

$(document).click(() => {
    interacted = true;
    ipc.send('messageInteracted');
    $('#content-div').removeClass('translucent');
});

ipc.once('initMessageDetails', (event, threadinfo, userInfo) => {
    mainLog('Initial message update.');
    event.sender.send('pollPreloadedThreads', userInfo.message.threadID);
    ipc.once('preloadedThreadInfo', (event, threadData)=>{
        $('#thread_pic').attr('src', threadData.imageSrc == null ? userInfo.data.thumbSrc : threadData.imageSrc);
        $('#thread_name').text(threadinfo.name);
        var sender_name = userInfo.data.name + ((userInfo.data.alternateName != undefined) ? ' (' + userInfo.data.alternateName + ')' : '');
        $('#sender_name').text(userInfo.data.isGroup ? sender_name:'');
        appendMessage(userInfo.message);
        event.sender.send('readyToDisplay');
    });
});

ipc.on('anotherMessage', (event, userInfo) => {
    mainLog('Appending message.');
    appendMessage(userInfo.message_data);
});

function appendMessage(message) {
    $('#message_container').append('<p id="message_body">' + message.body + '</p>');
}

$('#close_button').click(() => {
    mainLog('Message close button clicked.');
    ipc.send('message_close');
});


function mainLog(log) {
    ipc.send('console.log', log);
}