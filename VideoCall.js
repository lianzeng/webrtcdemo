
async function joinRoom() {
    // 创建QNRTCClient对象
    const client = QNRTC.createClient();
    // 需要先监听对应事件再加入房间
    autoSubscribe(client);
    const roomTokenInput = document.getElementById("roomtoken");
    const roomToken = roomTokenInput.value;
    await client.join(roomToken);
    await publish(client);
}

async function publish(client) {
    // 返回一组audio track 与 video track
    const localTracks = await QNRTC.createMicrophoneAndCameraTracks();
    await client.publish(localTracks);
    // 获取页面上的一个元素作为播放画面的父元素
    const localElement = document.getElementById("localtracks");
    // 遍历本地采集的 Track 对象
    for (const localTrack of localTracks) {
        console.log(localTrack)
        // 如果这是麦克风采集的音频 Track，我们就不播放它。
        if (localTrack.isAudio()) continue;
        // 调用 Track 对象的 play 方法在这个元素下播放视频轨
        localTrack.play(localElement, {
            mirror: true
        });
    }
}

async function subscribe(client, tracks) {
    // 传入 Track 对象数组调用订阅方法发起订阅，异步返回成功订阅的 Track 对象。
    const remoteTracks = await client.subscribe(tracks);
    const remoteElement = document.getElementById("remotetracks");
    // 遍历返回的远端 Track，调用 play 方法完成在页面上的播放
    for (const remoteTrack of [...remoteTracks.videoTracks, ...remoteTracks.audioTracks]) {
        remoteTrack.play(remoteElement);
    }
}

function autoSubscribe(client) {
    // 添加事件监听，当房间中出现新的 Track 时就会触发，参数是 trackInfo 列表
    client.on("user-published", (userId, tracks) => {
        subscribe(client, tracks)
            .then(() => console.log("subscribe success!"))
            .catch(e => console.error("subscribe error", e));
    });
}

//并不是所有的浏览器都支持 WebRTC，可以通过checkSystemRequirements()方法检测浏览器兼容性。该方法，会自动检测媒体流采集、加入房间、发布、订阅、离开房间等整个流程
async function checkSystem() {
    const result = await QNRTC.checkSystemRequirements();
    if (result.ok) {
        console.log("test ok!");
    } else {
        console.log("test fail", result.reason);
    }
}