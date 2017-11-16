var player,
    time_update_interval = 0,
    currentTimeCodeEntry = new timecodeentry(0);

var Templates = {
    FullTemplate:
    '## {Video_Title}' +
    '\n# ' +
    '\n' +
    '\n----' +
    '\n#### {Video_Link_Line_Template} {Show_Notes_Link_LineTemplate}' +
    '\n# ' +
    '\n' +
    '\n----' +
    '\n' +
    '\n## Extra' +
    '\n### Monologues' +
    '\n| Description | Start Time | End Time | Duration |' +
    '\n| ----------- | ---------- | -------- | -------- |' +
    '\n{Monologue_Entry}' +
    '\n' +
    '\n### Funny Snippets' +
    '\n| Description | Start Time | End Time | Duration |' +
    '\n| ----------- | ---------- | -------- | -------- |' +
    '\n{Funny_Snippets_Entry}' +
    '\n' +
    '\n#' +
    '\n----' +
    '\n' +
    '\n## Outline' +
    '\n### Intro' +
    '\n| Description | Start Time | End Time | Duration |' +
    '\n| ----------- | ---------- | -------- | -------- |' +
    '\n{Intro_Entry}' +
    '\n' +
    '\n### Main Video' +
    '\n| Description | Start Time | End Time | Duration |' +
    '\n| ----------- | ---------- | -------- | -------- |' +
    '\n{Main_Video_Entry}' +
    '\n' +
    '\n### Outro' +
    '\n| Description | Start Time | End Time | Duration |' +
    '\n| ----------- | ---------- | -------- | -------- |' +
    '\n{Outro_Entry}',
    LineTemplate: ' | {Description} | {Start_Time} | {End_Time} | {Duration} |\n',
    Video_Link_Line_Template: 'Full Video: [Link]({Video_Link})',
    Show_Notes_Link_LineTemplate: 'Show Notes: [Link]({Show_Notes_Link})',
}

var timecodecontainer = {
    title: "",
    video_url: "",
    show_notes_url: "",
    timecodes: []
}

function timecodeentry(currentDuration) {
    this.timecode_type = "";
    this.description = "";
    this.starttime = "";
    this.startDuration = currentDuration;
    this.endtime = "";
    this.endDuration = "";
    this.duration = "";
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('video-placeholder', {
        width: 600,
        height: 400,
        videoId: '0',
        playerVars: {
            color: 'white',
            playlist: '0'
        },
        events: {
            onReady: initialize
        }
    });
    player.addEventListener("onStateChange", "onytplayerStateChange");
}

function onytplayerStateChange(newState) {
    if (newState.data === 1 && timecodecontainer.title === "") {
        player.pauseVideo();
        timecodecontainer.title = player.j.videoData.title;
        timecodecontainer.video_url = "https://www.youtube.com/watch?v=" + player.j.videoData.video_id;
        $('#video-title').text(timecodecontainer.title);
        $("#video-title_main").contentEditable().change(function (e) {
            timecodecontainer.title = $('#video-title').text();
            updateTemplateOutput();
        });
        $('#video-link').text(timecodecontainer.video_url);
        $("#show-notes_main").contentEditable().change(function (e) {
            timecodecontainer.show_notes_url = $('#show-notes').text();
            updateTemplateOutput();
        });
        updateTemplateOutput();
    }
}

function updateTemplateOutput() {
    var tupdate = Templates.FullTemplate;
    tupdate = tupdate.replace('{Video_Title}', timecodecontainer.title);
    tupdate = tupdate.replace('{Video_Link_Line_Template}', Templates.Video_Link_Line_Template.replace('{Video_Link}', timecodecontainer.video_url));
    if (!timecodecontainer.show_notes_url.trim()) {
        tupdate = tupdate.replace('{Show_Notes_Link_LineTemplate}', '');
    }
    else {
        tupdate = tupdate.replace('{Show_Notes_Link_LineTemplate}', Templates.Show_Notes_Link_LineTemplate.replace('{Show_Notes_Link}', timecodecontainer.video_url));
    }
    tupdate = tupdate.replace('{Monologue_Entry}', $('#Monologue_markdown').html().replace('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n', ''));
    tupdate = tupdate.replace('{Funny_Snippets_Entry}', $('#Funny_markdown').html().replace('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n', ''));
    tupdate = tupdate.replace('{Intro_Entry}', $('#Intro_markdown').html().replace('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n', ''));
    tupdate = tupdate.replace('{Main_Video_Entry}', $('#Main_markdown').html().replace('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n', ''));
    tupdate = tupdate.replace('{Outro_Entry}', $('#Outro_markdown').html().replace('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n', ''));

    $('#markdownTemplate').html(tupdate);
}

function initialize() {
    $('#step_1').show();
    //$('#step_2').hide();
    //$('#step_3').hide();
    //$('#step_4').hide();
    setCorrectingInterval(function () {
        updateTimerDisplay();
    }, 1000);

    $('#newtimestampentry').on("click", function () {
        currentTimeCodeEntry.starttime = formatTime(currentTimeCodeEntry.startDuration);
        currentTimeCodeEntry.endDuration = Math.round(player.getCurrentTime());
        currentTimeCodeEntry.endtime = formatTime(currentTimeCodeEntry.endDuration);
        currentTimeCodeEntry.description = $('#newtimestampentry_description').val();
        currentTimeCodeEntry.timecode_type = $('#newtimestampentry_timecode_type').val();
        currentTimeCodeEntry.duration = convertSecondsToHHMMSS(currentTimeCodeEntry.endDuration - currentTimeCodeEntry.startDuration);
        var tempString = ('| ' + $('#newtimestampentry_description').val() + ' | ' + currentTimeCodeEntry.starttime + ' | ' + currentTimeCodeEntry.endtime + ' | ' + currentTimeCodeEntry.duration + ' |\n');

        switch (currentTimeCodeEntry.timecode_type) {
            case 'Intro':
                $('#Intro_markdown').append(tempString);
                break;
            case 'Main':
                $('#Main_markdown').append(tempString);
                break;
            case 'Outro':
                $('#Outro_markdown').append(tempString);
                break;
            case 'Monologue':
                $('#Monologue_markdown').append(tempString);
                break;
            case 'Funny':
                $('#Funny_markdown').append(tempString);
                break;
        }

        timecodecontainer.timecodes.push(currentTimeCodeEntry);
        currentTimeCodeEntry = new timecodeentry(Math.round(player.getCurrentTime()));
        $('#start-time').text(formatTime(player.getCurrentTime()));
        updateTemplateOutput();
    });
    $('#resetStart').on("click", function () {
        currentTimeCodeEntry.startDuration = Math.round(player.getCurrentTime());
        currentTimeCodeEntry.starttime = formatTime(currentTimeCodeEntry.startDuration);
        $('#start-time').text(formatTime(currentTimeCodeEntry.startDuration));
    });
    //$('#markdownTemplate').html(Templates.FullTemplate);
    $('#Monologue_markdown').html('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n');
    $('#Funny_markdown').html('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n');
    $('#Intro_markdown').html('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n');
    $('#Main_markdown').html('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n');
    $('#Outro_markdown').html('| Description | Start&nbsp;Time | End&nbsp;Time | Duration |\n| ----------- | ---------- | -------- | -------- |\n');
    $('#video_id').on("click", function () {
        player.loadVideoById(YouTubeGetID($('#videoid').val()));
        //$('#shownotes').val()
        //$('#video-link').text($('#videoid').val());
        //$('#step_1').hide();
        $('#step_2').show();
        $('#step_3').show();
        //$('#step_4').hide();
    });
    $('#btnSaveTemplate').on("click", function () {
        localStorage.setItem("markdown", $('#markdownTemplate').text())
    });
    $('#btnUpdateTemplate').on("click", function () {
        updateTemplateOutput();
    });
    
}

// This function is called by initialize()
function updateTimerDisplay() {
    // Update current time text display.
    $('#current-time').text(formatTime(player.getCurrentTime()));
    $('#end-time').text(formatTime(player.getCurrentTime()));
    //$('#duration').text(formatTime( player.getDuration() ));
}

// Playback
$('#play').on('click', function () {
    player.playVideo();
});

$('#pause').on('click', function () {
    player.pauseVideo();
});

// Load video
$('.thumbnail').on('click', function () {
    var url = $(this).attr('data-video-id');
    player.loadVideoById(url);
});

// Helper Functions
function formatTime(time) {
    seconds = Math.round(time);

    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    var hours = Math.floor(minutes / 60)
    minutes = minutes % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return (hours) + ":" + (minutes) + ":" + (seconds);

}

function YouTubeGetID(url) {
    url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}

function getOrdinal(n) {
    var s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

var secondsPerMinute = 60;
var minutesPerHour = 60;

function convertSecondsToHHMMSS(intSecondsToConvert) {
    var hours = convertHours(intSecondsToConvert);
    var minutes = getRemainingMinutes(intSecondsToConvert);
    minutes = (minutes == 60) ? "00" : minutes;
    var seconds = getRemainingSeconds(intSecondsToConvert);

    var s_hours = "";
    var s_minutes = "";
    var s_seconds = (seconds < 10) ? "0" + seconds + "s" : seconds + "s";
    if (hours > 0) {
        s_hours = hours + "h";
    }
    if (minutes > 0) {
        s_minutes = minutes + "m";
        if (hours > 0 && minutes < 10) {
            s_minutes = "0" + s_minutes;
        }
    }
    return s_hours + s_minutes + s_seconds
}

function convertHours(intSeconds) {
    var minutes = convertMinutes(intSeconds);
    var hours = Math.floor(minutes / minutesPerHour);
    return hours;
}
function convertMinutes(intSeconds) {
    return Math.floor(intSeconds / secondsPerMinute);
}
function getRemainingSeconds(intTotalSeconds) {
    return (intTotalSeconds % secondsPerMinute);
}
function getRemainingMinutes(intSeconds) {
    var intTotalMinutes = convertMinutes(intSeconds);
    return (intTotalMinutes % minutesPerHour);
}

function HMStoSec1(T) { // h:m:s
    var A = T.split(/\D+/); return (A[0] * 60 + +A[1]) * 60 + +A[2]
}

$('pre code').each(function (i, block) {
    hljs.highlightBlock(block);
});

window.setCorrectingInterval = (function (func, delay) {
    var instance = {};

    function tick(func, delay) {
        if (!instance.started) {
            instance.func = func;
            instance.delay = delay;
            instance.startTime = new Date().valueOf();
            instance.target = delay;
            instance.started = true;

            setTimeout(tick, delay);
        } else {
            var elapsed = new Date().valueOf() - instance.startTime,
                adjust = instance.target - elapsed;

            instance.func();
            instance.target += instance.delay;

            setTimeout(tick, instance.delay + adjust);
        }
    };

    return tick(func, delay);
});

$(function () {
    // execute once on the container
    $("#main").contentEditable().change(function (e) {
        // what to do when the data has changed
        console.log(e);
        $(".output .action").html(e.action);
        for (i in e.changed) {
            $(".output .key").html(i);
        }
    });

});